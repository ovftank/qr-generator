import { DotBackground } from "@components/dot-background";
import { FloatingDockItem } from "@components/floating-dock";
import { FloatingDock } from "@components/floating-dock.tsx";
import Toast, { ToastType } from "@components/toast";
import {
  IconBrandTelegram,
  IconHome,
  IconPhoto,
  IconQrcode,
  IconSettings,
} from "@tabler/icons-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Outlet, useLocation } from "react-router-dom";

const Layout: React.FC = () => {
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isDockVisible, setIsDockVisible] = useState<boolean>(true);
  const location = useLocation();
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const updateStandalone = (e: MediaQueryListEvent) =>
      setIsStandalone(e.matches);

    setIsStandalone(mediaQuery.matches);
    mediaQuery.addEventListener("change", updateStandalone);

    return () => mediaQuery.removeEventListener("change", updateStandalone);
  }, []);

  const hideDockedTimeout = useRef<NodeJS.Timeout | null>(null);

  const showDock = useCallback(() => {
    setIsDockVisible(true);
    if (hideDockedTimeout.current) {
      clearTimeout(hideDockedTimeout.current);
    }
  }, []);

  const hideDock = useCallback(() => {
    if (!isStandalone && location.pathname !== "/") {
      hideDockedTimeout.current = setTimeout(
        () => setIsDockVisible(false),
        5000,
      );
    }
  }, [isStandalone, location.pathname]);

  useEffect(() => {
    if (location.pathname === "/qr") {
      if (!isStandalone) {
        setIsDockVisible(false);
      }
    } else if (location.pathname === "/") {
      setIsDockVisible(true);
    } else {
      showDock();
      if (!isStandalone) {
        hideDockedTimeout.current = setTimeout(
          () => setIsDockVisible(false),
          5000,
        );
      }
    }

    return () => {
      if (hideDockedTimeout.current) {
        clearTimeout(hideDockedTimeout.current);
      }
    };
  }, [location.pathname, showDock, isStandalone]);

  const items: FloatingDockItem[] = useMemo(
    () => [
      {
        title: "Trang chủ",
        icon: <IconHome />,
        href: "/",
      },
      {
        title: "Tạo mã QR",
        icon: <IconQrcode />,
        href: "/qr",
      },
      {
        title: "Ảnh đã tạo",
        icon: <IconPhoto />,
        href: "/images",
      },
      {
        title: "Cài đặt",
        icon: <IconSettings />,
        href: "/settings",
      },
      {
        title: "Hỗ trợ",
        icon: <IconBrandTelegram />,
        href: "tg://msg?to=ovftank",
        isExternal: false,
      },
    ],
    [],
  );

  const mobileClassName = useMemo(
    () => (isStandalone ? "hidden" : "fixed bottom-4 right-4"),
    [isStandalone],
  );

  const getDesktopClassName = (
    isStandalone: boolean,
    isDockVisible: boolean,
  ) => {
    const baseClasses =
      "fixed left-1/2 -translate-x-1/2 mx-auto h-16 items-end gap-4 rounded-2xl px-4 pb-3 bg-neutral-900 transition-transform duration-300";
    const visibilityClasses = isDockVisible
      ? "translate-y-0"
      : "translate-y-full";

    return isStandalone
      ? `${baseClasses} bottom-8 flex ${visibilityClasses}`
      : `${baseClasses} bottom-4 hidden md:flex ${visibilityClasses}`;
  };

  const desktopClassName = useMemo(
    () => getDesktopClassName(isStandalone, isDockVisible),
    [isStandalone, isDockVisible],
  );

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <DotBackground>
      <Outlet context={{ showToast }} />
      <FloatingDock
        items={items}
        desktopClassName={desktopClassName}
        mobileClassName={mobileClassName}
        onMouseEnter={showDock}
        onMouseLeave={hideDock}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          isPwa={isStandalone}
        />
      )}
    </DotBackground>
  );
};

export default Layout;
