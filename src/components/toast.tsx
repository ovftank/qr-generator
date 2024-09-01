import { IconCheck, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
  isPwa?: boolean;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 3000,
  onClose,
  isPwa = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icon =
    type === "success" ? <IconCheck size={20} /> : <IconX size={20} />;
  const bgColor =
    type === "success"
      ? "bg-[linear-gradient(110deg,#171717,45%,#a3a3a3,55%,#171717)] bg-[length:200%_100%]"
      : "bg-neutral-500";
  const positionClasses = isPwa ? "top-16 right-4" : "top-8 right-8";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed ${positionClasses} ${bgColor} z-50 flex animate-shimmer items-center space-x-2 rounded-lg border-2 border-neutral-500 px-4 py-2 text-white shadow-lg`}
        >
          {icon}
          <span>{message}</span>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <IconX size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
