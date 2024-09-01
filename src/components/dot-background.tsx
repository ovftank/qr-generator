import React from "react";

interface DotBackgroundProps {
  children: React.ReactNode;
}

export const DotBackground: React.FC<DotBackgroundProps> = ({ children }) => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black bg-dot-white/[0.2]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="relative z-20 w-full">{children}</div>
    </div>
  );
};
