import { IconDownload, IconShare, IconX } from "@tabler/icons-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface QRCodeModalProps {
  qrCodeUrl: string;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ qrCodeUrl, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleDownload = () => {
    fetch(qrCodeUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "qr-code.png";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((error) => console.error("Error downloading QR code:", error));
  };

  const handleShare = useCallback(async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], "qr-code.png", { type: "image/png" });

      if (isMobile && navigator.share) {
        await navigator.share({
          files: [file],
          title: "QR Generator",
          text: "QR Generator - Quản Lý Mã QR Thông Minh | OVF Team",
        });
      } else {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${qrCodeUrl}`;
        window.open(facebookUrl, "_blank");
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
    }
  }, [qrCodeUrl, isMobile]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-sm rounded-xl bg-neutral-800 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-700 p-4">
          <h2 className="text-xl font-semibold text-white">Mã QR của bạn</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 transition-colors hover:text-white"
            aria-label="Đóng"
          >
            <IconX size={24} />
          </button>
        </div>
        <div className="p-4">
          <img
            src={qrCodeUrl}
            alt="Mã QR Đã Tạo"
            className="h-auto w-full object-contain"
          />
          <div className="mt-4 flex justify-center space-x-2">
            <button
              onClick={handleDownload}
              className="inline-flex h-12 w-full animate-shimmer items-center justify-center rounded-md border border-neutral-600 bg-[linear-gradient(110deg,#171717,45%,#a3a3a3,55%,#171717)] bg-[length:200%_100%] px-6 font-medium text-neutral-300 transition-colors hover:scale-105 focus:border-2 focus:border-neutral-400"
            >
              <IconDownload className="mr-2" size={20} />
              Tải xuống
            </button>
            <button
              onClick={handleShare}
              className="inline-flex h-12 w-full animate-shimmer items-center justify-center rounded-md border border-neutral-600 bg-[linear-gradient(110deg,#171717,45%,#a3a3a3,55%,#171717)] bg-[length:200%_100%] px-6 font-medium text-neutral-300 transition-colors hover:scale-105 focus:border-2 focus:border-neutral-400"
            >
              <IconShare className="mr-2" size={20} />
              Chia sẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
