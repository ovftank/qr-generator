import { IconX as IconClear, IconSearch, IconX } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: boolean;
  isTransfer: boolean;
  swift_code: string;
}

interface BankListProps {
  banks: Bank[];
  onSelectBank: (bank: Bank) => void;
  onClose: () => void;
}

const BankList: React.FC<BankListProps> = ({
  banks,
  onSelectBank,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const filteredBanks = banks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.shortName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const clearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && filteredBanks.length > 0) {
      onSelectBank(filteredBanks[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        ref={modalRef}
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-neutral-800 shadow-2xl"
      >
        <div className="border-b border-neutral-700 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Chọn Ngân Hàng</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 transition-colors hover:text-white"
              aria-label="Đóng"
            >
              <IconX size={24} />
            </button>
          </div>
          <div className="relative">
            <IconSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 transform text-neutral-400"
              size={20}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm ngân hàng"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg bg-neutral-700 p-2 pl-10 pr-10 text-white placeholder-neutral-400 transition focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-neutral-400 transition-colors hover:text-white"
                aria-label="Xóa tìm kiếm"
              >
                <IconClear size={20} />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredBanks.map((bank) => (
            <button
              key={bank.id}
              onClick={() => onSelectBank(bank)}
              className="flex w-full items-center p-4 transition-colors hover:bg-neutral-700"
            >
              <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                <img
                  src={bank.logo}
                  alt={bank.name}
                  className="h-full w-full object-contain p-1"
                />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">{bank.shortName}</p>
                <p className="text-sm text-neutral-400">{bank.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export type { Bank };
export default BankList;
