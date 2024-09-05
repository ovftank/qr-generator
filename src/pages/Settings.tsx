import BankList, { Bank } from "@components/BankList";
import {
  IconBuildingBank,
  IconCreditCard,
  IconDeviceFloppy,
  IconUser,
} from "@tabler/icons-react";
import {
  getDefaultAccountName,
  getDefaultAccountNumber,
  getDefaultBank,
  setDefaultAccountName as saveDefaultAccountName,
  setDefaultAccountNumber as saveDefaultAccountNumber,
  setDefaultBank as saveDefaultBank,
} from "@utils/cacheUtils";
import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

interface LayoutContext {
  showToast: (message: string, type: "success" | "error") => void;
}

const Settings: React.FC = () => {
  const { showToast } = useOutletContext<LayoutContext>();
  const [defaultAccountName, setDefaultAccountName] = useState("");
  const [defaultAccountNumber, setDefaultAccountNumber] = useState("");
  const [defaultBank, setDefaultBank] = useState<Bank | null>(null);
  const [showBankList, setShowBankList] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);

  useEffect(() => {
    const fetchDefaultValues = async () => {
      const name = await getDefaultAccountName();
      const number = await getDefaultAccountNumber();
      const bank = await getDefaultBank();
      setDefaultAccountName(name || "");
      setDefaultAccountNumber(number || "");
      setDefaultBank(bank || null);
    };

    const fetchBanks = async () => {
      try {
        const response = await fetch("https://api.vietqr.io/v2/banks");
        const data = await response.json();
        if (data.code === "00" && Array.isArray(data.data)) {
          setBanks(data.data);
        }
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    };

    fetchDefaultValues();
    fetchBanks();
  }, []);

  const handleSave = async () => {
    try {
      await saveDefaultAccountName(defaultAccountName);
      await saveDefaultAccountNumber(defaultAccountNumber);
      if (defaultBank) {
        await saveDefaultBank(defaultBank);
      }
      showToast("Đã lưu thông tin mặc định", "success");
    } catch (error) {
      console.error("Error saving default values:", error);
      showToast("Có lỗi xảy ra khi lưu thông tin", "error");
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-xl bg-neutral-800 bg-opacity-50 p-8 shadow-2xl">
      <h1 className="mb-6 text-center text-3xl font-bold text-white">
        Cài đặt
      </h1>
      <div className="space-y-4">
        <div className="relative">
          <IconUser
            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-neutral-500"
            size={20}
          />
          <input
            type="text"
            id="defaultAccountName"
            value={defaultAccountName}
            onChange={(e) =>
              setDefaultAccountName(e.target.value.toUpperCase())
            }
            className="mt-1 block w-full rounded-lg bg-neutral-700 p-3 pl-10 text-white placeholder-neutral-400 transition focus:ring-2 focus:ring-blue-500"
            placeholder="Tên người gửi mặc định"
          />
        </div>
        <div className="relative">
          <IconCreditCard
            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-neutral-500"
            size={20}
          />
          <input
            type="text"
            id="defaultAccountNumber"
            value={defaultAccountNumber}
            onChange={(e) => setDefaultAccountNumber(e.target.value)}
            className="mt-1 block w-full rounded-lg bg-neutral-700 p-3 pl-10 text-white placeholder-neutral-400 transition focus:ring-2 focus:ring-blue-500"
            placeholder="Số tài khoản mặc định"
          />
        </div>
        <div className="relative">
          <IconBuildingBank
            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-neutral-500"
            size={20}
          />
          <div
            onClick={() => setShowBankList(true)}
            className="mt-1 block w-full cursor-pointer rounded-lg bg-neutral-700 p-3 pl-10 text-white placeholder-neutral-400 transition focus:ring-2 focus:ring-blue-500"
          >
            {defaultBank
              ? `${defaultBank.shortName} - ${defaultBank.name}`
              : "Chọn ngân hàng"}
          </div>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex h-12 w-full animate-shimmer items-center justify-center rounded-md border border-neutral-600 bg-[linear-gradient(110deg,#171717,45%,#a3a3a3,55%,#171717)] bg-[length:200%_100%] px-6 font-medium text-neutral-300 transition-colors hover:border-neutral-400 focus:border-2 focus:border-neutral-400"
        >
          <IconDeviceFloppy className="mr-2" size={20} />
          Lưu thông tin mặc định
        </button>
      </div>
      {showBankList && (
        <BankList
          banks={banks}
          onSelectBank={(bank) => {
            setDefaultBank(bank);
            setShowBankList(false);
          }}
          onClose={() => setShowBankList(false)}
        />
      )}
    </div>
  );
};

export default Settings;
