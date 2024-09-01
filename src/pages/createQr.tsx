import BankList from "@components/bankList";
import QRCodeModal from "@components/qrCodeModal";
import { ToastType } from "@components/toast";
import {
  IconBuildingBank,
  IconCash,
  IconCopy,
  IconCurrencyDong,
  IconDownload,
  IconFileDescription,
  IconQrcode,
  IconTemplate,
  IconUser,
  IconUserCircle,
} from "@tabler/icons-react";
import {
  cacheQRImage,
  getDefaultAccountName,
  getDefaultAccountNumber,
  getDefaultBank,
} from "@utils/cacheUtils";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  short_name: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  support: boolean;
  isTransfer: boolean;
  swift_code: string;
}

interface LayoutContext {
  showToast: (message: string, type: ToastType) => void;
}

const CreateQr: React.FC = () => {
  const { showToast } = useOutletContext<LayoutContext>();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [showBankList, setShowBankList] = useState(false);
  const [accountNo, setAccountNo] = useState("");
  const [template, setTemplate] = useState("compact");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [accountName, setAccountName] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isAccountValid, setIsAccountValid] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [suggestedAmounts, setSuggestedAmounts] = useState<string[]>([]);
  const [defaultAccountName, setDefaultAccountName] = useState("");
  const [defaultAccountNumber, setDefaultAccountNumber] = useState("");

  const accountInputRef = useRef<HTMLInputElement>(null);
  const generateQRButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch("https://api.vietqr.io/v2/banks")
      .then((response) => response.json())
      .then((data) => {
        if (data.code === "00" && Array.isArray(data.data)) {
          setBanks(data.data);
        }
      })
      .catch((error) => console.error("Error fetching banks:", error));
  }, []);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    if (selectedBank && accountInputRef.current) {
      accountInputRef.current.focus();
    }
  }, [selectedBank]);

  useEffect(() => {
    const fetchDefaultValues = async () => {
      const name = await getDefaultAccountName();
      const number = await getDefaultAccountNumber();
      const bank = await getDefaultBank();
      setDefaultAccountName(name || "");
      setDefaultAccountNumber(number || "");
      if (bank) {
        setSelectedBank(bank);
      }
      if (number) {
        setAccountNo(number);
        validateAccount(number);
      }
      if (name) {
        setAccountName(name);
      }
    };

    fetchDefaultValues();
  }, []);

  const generateQRCode = async () => {
    if (!selectedBank) return;
    let url = `https://img.vietqr.io/image/${selectedBank.bin}-${accountNo}-${template}.png`;
    const params = new URLSearchParams();
    const parsedAmount = parseFloat(amount.replace(/[.,\s]/g, ""));
    if (parsedAmount > 0) params.append("amount", parsedAmount.toString());

    if (description) params.append("addInfo", description);
    if (accountName) params.append("accountName", accountName);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    setQrCodeUrl(url);
    await cacheQRImage({
      url,
      bankName: selectedBank.short_name,
      accountNo,
      amount: parsedAmount > 0 ? parsedAmount.toString() : undefined,
      description,
      timestamp: Date.now(),
      isPinned: false,
      templateName: template,
      accountName: accountName || undefined,
    });
    if (isMobile) {
      setShowQRModal(true);
    }
    showToast("Đã tạo mã QR thành công", "success");
  };

  const validateAccount = (value: string) => {
    const isValid = value.length >= 4 && /^\d+$/.test(value);
    setIsAccountValid(isValid);
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAccountNo(value);
  };

  const handleAccountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateAccount(accountNo);
      if (isAccountValid && generateQRButtonRef.current) {
        generateQRButtonRef.current.focus();
      }
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = Number(value).toLocaleString("vi-VN");
    setAmount(formattedValue);
    updateSuggestedAmounts(value);
  };

  const updateSuggestedAmounts = (value: string) => {
    if (value && /^\d+$/.test(value)) {
      const baseValue = parseInt(value);
      const suggestions = [
        (baseValue * 1000).toString(),
        (baseValue * 10000).toString(),
        (baseValue * 100000).toString(),
      ];
      setSuggestedAmounts(
        suggestions.filter((amount) => parseInt(amount) <= 1000000000),
      );
    } else {
      setSuggestedAmounts([]);
    }
  };

  const applySuggestedAmount = (suggestedAmount: string) => {
    const value = suggestedAmount.replace(/\D/g, "");
    const formattedValue = Number(value).toLocaleString("vi-VN");
    setAmount(formattedValue);
    setSuggestedAmounts([]);
  };

  const downloadQRCode = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "qr-code.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  const copyImageToClipboard = useCallback(async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const item = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([item]);
      showToast("Mã QR đã được sao chép vào clipboard", "success");
    } catch (error) {
      console.error("Failed to copy image:", error);
    }
  }, [qrCodeUrl, showToast]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      copyImageToClipboard();
    },
    [copyImageToClipboard],
  );

  const handleCopyImage = useCallback(async () => {
    if (!qrCodeUrl) return;
    try {
      await copyImageToClipboard();
      showToast("Mã QR đã được sao chép vào clipboard", "success");
    } catch (error) {
      console.error("Failed to copy image:", error);
      showToast("Không thể sao chép mã QR", "error");
    }
  }, [qrCodeUrl, copyImageToClipboard, showToast]);

  const showOptionalFields = selectedBank && isAccountValid;

  return (
    <div className="mx-auto max-w-4xl rounded-xl bg-neutral-800 bg-opacity-50 p-8 shadow-2xl">
      <h1 className="mb-6 text-center text-3xl font-bold text-white">
        Tạo Mã QR
      </h1>
      <div className="flex flex-col-reverse gap-8 md:flex-row">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generateQRCode();
          }}
          className="flex-1 space-y-4"
        >
          <div className="relative">
            <IconBuildingBank
              className="absolute left-3 top-1/2 -translate-y-1/2 transform text-neutral-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm ngân hàng"
              value={
                selectedBank
                  ? `${selectedBank.shortName} - ${selectedBank.name}`
                  : ""
              }
              onFocus={() => setShowBankList(true)}
              readOnly
              className="w-full cursor-pointer overflow-hidden text-ellipsis rounded-lg bg-neutral-700 p-3 pl-10 text-white placeholder-neutral-400 transition focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <IconUser
              className="absolute left-3 top-1/2 -translate-y-1/2 transform text-neutral-500"
              size={20}
            />
            <input
              ref={accountInputRef}
              type="text"
              placeholder="Số Tài Khoản"
              value={accountNo || defaultAccountNumber}
              onChange={handleAccountChange}
              onBlur={() => validateAccount(accountNo)}
              onKeyDown={handleAccountKeyDown}
              className="w-full rounded-lg bg-neutral-700 p-3 pl-10 text-white placeholder-neutral-400 transition focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {showOptionalFields && (
            <>
              <div className="relative">
                <IconTemplate
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-neutral-500"
                  size={20}
                />
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full appearance-none rounded-lg bg-neutral-700 p-3 pl-10 text-white transition focus:ring-2 focus:ring-blue-500"
                >
                  <option value="compact">Đầy đủ</option>
                  <option value="qr_only">Rút gọn</option>
                </select>
              </div>
              <div className="relative">
                <IconCurrencyDong
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-neutral-500"
                  size={20}
                />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Số Tiền (tùy chọn)"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full rounded-lg bg-neutral-700 p-3 pl-10 text-white placeholder-neutral-400 transition focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                {suggestedAmounts.map((suggestedAmount, index) => (
                  <button
                    key={`${suggestedAmount}-${index}`}
                    type="button"
                    onClick={() => applySuggestedAmount(suggestedAmount)}
                    className="flex h-8 w-24 items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded border border-neutral-800 bg-neutral-900 px-3 py-1 text-sm text-white transition hover:bg-neutral-800"
                  >
                    <IconCash size={16} className="mr-1" />
                    {parseInt(suggestedAmount).toLocaleString("vi-VN")}
                  </button>
                ))}
              </div>
              <div className="relative">
                <IconFileDescription
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-neutral-500"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Mô Tả (tùy chọn)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg bg-neutral-700 p-3 pl-10 text-white placeholder-neutral-400 transition focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <IconUserCircle
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-neutral-500"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tên Tài Khoản (tùy chọn)"
                  value={accountName || defaultAccountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full rounded-lg bg-neutral-700 p-3 pl-10 text-white placeholder-neutral-400 transition focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                ref={generateQRButtonRef}
                type="submit"
                className="inline-flex h-12 w-full animate-shimmer items-center justify-center rounded-md border border-neutral-600 bg-[linear-gradient(110deg,#171717,45%,#a3a3a3,55%,#171717)] bg-[length:200%_100%] px-6 font-medium text-neutral-300 transition-colors hover:scale-105 focus:border-2 focus:border-neutral-400"
              >
                <IconQrcode className="mr-2" size={20} />
                Tạo Mã QR
              </button>
            </>
          )}
        </form>
        {!isMobile && (
          <div className="mb-8 flex flex-1 flex-col items-start justify-center md:mb-0">
            <div className="group relative aspect-square w-full max-w-sm overflow-hidden rounded-xl bg-neutral-700 shadow-lg">
              {qrCodeUrl ? (
                <>
                  <img
                    src={qrCodeUrl}
                    alt="Mã QR Đã Tạo"
                    className="h-full w-full object-contain p-4"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    onContextMenu={handleContextMenu}
                  >
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadQRCode(qrCodeUrl)}
                        className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-neutral-600 bg-[linear-gradient(110deg,#171717,45%,#a3a3a3,55%,#171717)] bg-[length:200%_100%] px-6 py-2 font-medium text-neutral-300 transition-colors hover:scale-105 focus:border-2 focus:border-neutral-400"
                      >
                        <IconDownload className="mr-2 h-5 w-5" />
                        Tải xuống
                      </button>
                      <button
                        onClick={handleCopyImage}
                        className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-neutral-600 bg-[linear-gradient(110deg,#171717,45%,#a3a3a3,55%,#171717)] bg-[length:200%_100%] px-6 py-2 font-medium text-neutral-300 transition-colors hover:scale-105 focus:border-2 focus:border-neutral-400"
                      >
                        <IconCopy className="mr-2 h-5 w-5" />
                        Sao chép
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-neutral-400">
                  <IconQrcode className="mb-4 h-24 w-24" />
                  <p className="text-center text-lg">
                    Mã QR của bạn sẽ xuất hiện ở đây
                  </p>
                  <p className="mt-2 text-center text-sm">
                    Điền vào biểu mẫu và nhấn "Tạo Mã QR"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {showBankList && (
        <BankList
          banks={banks}
          onSelectBank={(bank) => {
            setSelectedBank(bank);
            setShowBankList(false);
          }}
          onClose={() => setShowBankList(false)}
        />
      )}
      {showQRModal && (
        <QRCodeModal
          qrCodeUrl={qrCodeUrl}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
};

export default CreateQr;
