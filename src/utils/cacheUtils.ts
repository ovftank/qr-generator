import { Bank } from "@components/BankList";
import { openDB } from "idb";
const DB_NAME = "qr-code-cache";
const STORE_NAME = "qr-images";

export interface QRCodeEntry {
  id?: number;
  url: string;
  bankName: string;
  accountNo: string;
  amount?: string;
  description?: string;
  timestamp: number;
  isPinned: boolean;
  templateName?: string;
  accountName?: string;
}

const dbPromise = openDB(DB_NAME, 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("timestamp", "timestamp");
      store.createIndex("bankName", "bankName");
      store.createIndex("isPinned", "isPinned");
    }
    if (oldVersion < 2) {
      db.createObjectStore("settings");
    }
  },
});

export async function cacheQRImage(entry: Omit<QRCodeEntry, "id">) {
  const db = await dbPromise;
  await db.add(STORE_NAME, entry);
}

export async function getCachedQRImages() {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
}

export async function updateQRImage(id: number, updates: Partial<QRCodeEntry>) {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const item = await store.get(id);
  if (!item) {
    throw new Error("QR code not found");
  }
  const updatedItem = { ...item, ...updates };
  await store.put(updatedItem);
  await tx.done;
}

export async function deleteQRImage(id: number) {
  const db = await dbPromise;
  await db.delete(STORE_NAME, id);
}

export async function setDefaultAccountName(name: string) {
  const db = await dbPromise;
  await db.put("settings", name.toUpperCase(), "defaultAccountName");
}

export async function getDefaultAccountName() {
  const db = await dbPromise;
  return db.get("settings", "defaultAccountName");
}

export async function setDefaultAccountNumber(number: string) {
  const db = await dbPromise;
  await db.put("settings", number, "defaultAccountNumber");
}

export async function getDefaultAccountNumber() {
  const db = await dbPromise;
  return db.get("settings", "defaultAccountNumber");
}

export async function setDefaultBank(bank: Bank) {
  const db = await dbPromise;
  await db.put("settings", bank, "defaultBank");
}

export async function getDefaultBank(): Promise<Bank | undefined> {
  const db = await dbPromise;
  return db.get("settings", "defaultBank");
}
