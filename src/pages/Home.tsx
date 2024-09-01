import { Spotlight } from "@components/spotlight";
import { TypewriterEffect } from "@components/typewriter-effect";
import React from "react";

const Home: React.FC = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <Spotlight />
      <TypewriterEffect
        words={[
          { text: "QR", className: "text-red-500" },
          { text: "Generator" },
        ]}
      />
      <p className="text-center text-lg font-medium text-gray-200">
        Tạo mã QR Thanh toán nhanh chóng!
      </p>
      <span className="text-sm text-gray-400">
        Made by{" "}
        <a
          href="https://github.com/ovftank"
          target="_blank"
          className="text-blue-500"
        >
          ovftank
        </a>
      </span>
    </div>
  );
};

export default Home;
