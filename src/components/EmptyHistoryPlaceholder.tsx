import { IconQrcode } from "@tabler/icons-react";
import React from "react";

const EmptyHistoryPlaceholder: React.FC = () => {
  return (
    <div className="flex h-64 flex-col items-center justify-center text-neutral-400">
      <IconQrcode size={64} className="mb-4" />
      <h3 className="mb-2 text-xl font-semibold">Chưa có mã QR nào</h3>
      <p className="text-center">
        Hãy tạo mã QR đầu tiên của bạn
        <br />
        và nó sẽ xuất hiện ở đây!
      </p>
    </div>
  );
};

export default EmptyHistoryPlaceholder;
