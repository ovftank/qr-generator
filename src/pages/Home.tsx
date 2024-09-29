import { Spotlight } from "@components/Spotlight";
import { TypewriterEffect } from "@components/TypewriterEffect";
import { IconList, IconQrcode } from "@tabler/icons-react";
import { motion } from "framer-motion";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const handleShare = async () => {
    const shareData = {
      title: "QR Generator",
      text: "Tạo - Lưu Trữ - Chia Sẻ mã QR!",
      url: window.location.href,
    };

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    if (isMobile && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        openFacebookShare(shareData.url);
      }
    } else {
      openFacebookShare(shareData.url);
    }
  };
  const openFacebookShare = (url: string) => {
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookShareUrl, "_blank", "width=600,height=400");
  };

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden">
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <TypewriterEffect
            words={[
              { text: "QR", className: "text-red-500" },
              { text: "Generator", className: "text-white" },
            ]}
            className="text-4xl font-bold sm:text-5xl md:text-6xl"
          />
        </motion.div>

        <motion.p
          className="text-center text-lg font-medium text-neutral-300 md:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Link
            to="/qr"
            className="cursor-pointer text-neutral-400 hover:underline"
          >
            Tạo
          </Link>{" "}
          -{" "}
          <Link
            to="/images"
            className="cursor-pointer text-neutral-400 hover:underline"
          >
            Lưu Trữ
          </Link>{" "}
          -{" "}
          <span
            onClick={handleShare}
            className="cursor-pointer text-neutral-400 hover:underline"
          >
            Chia Sẻ
          </span>{" "}
          mã QR!
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-neutral-600 bg-[linear-gradient(110deg,#171717,45%,#a3a3a3,55%,#171717)] bg-[length:200%_100%] px-6 py-2 font-medium text-neutral-300 transition-colors hover:scale-105 hover:text-white focus:border-2 focus:border-neutral-400"
            onClick={() => navigate("/qr")}
          >
            <IconQrcode className="mr-2 h-5 w-5" />
            <span className="relative">Tạo mã QR</span>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border-2 border-neutral-500 bg-transparent px-6 font-medium text-neutral-300 transition-all hover:text-white"
            onClick={() => navigate("/images")}
          >
            <span className="absolute inset-0 flex h-full w-full -translate-x-full animate-shimmer items-center justify-center bg-[linear-gradient(110deg,#171717,45%,#a3a3a3,55%,#171717)] bg-[length:200%_100%] text-white duration-300 group-hover:translate-x-0">
              <IconList className="h-5 w-5" />
            </span>
            <span className="relative transition-transform duration-300 group-hover:-translate-x-full group-hover:opacity-0">
              Xem danh sách
            </span>
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        className="mt-4 text-center text-sm text-neutral-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        Made with ❤️ by{" "}
        <a
          href="https://github.com/ovftank"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-300 hover:underline"
        >
          ovftank
        </a>
      </motion.div>
    </div>
  );
};

export default Home;
