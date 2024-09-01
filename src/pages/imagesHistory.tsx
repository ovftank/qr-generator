import EmptyHistoryPlaceholder from "@components/emptyHistoryPlaceholder";
import {
  IconBuildingBank,
  IconCalendar,
  IconCheck,
  IconCheckbox,
  IconChevronDown,
  IconCopy,
  IconCreditCard,
  IconDownload,
  IconFileDescription,
  IconMoneybag,
  IconPin,
  IconPinnedOff,
  IconSearch,
  IconSquare,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import {
  deleteQRImage,
  getCachedQRImages,
  QRCodeEntry,
  updateQRImage,
} from "@utils/cacheUtils";
import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

type SortOption = "time" | "bankName";

interface LayoutContext {
  showToast: (message: string, type: "success" | "error") => void;
}

const ImagesHistory: React.FC = () => {
  const { showToast } = useOutletContext<LayoutContext>();
  const [cachedImages, setCachedImages] = useState<QRCodeEntry[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("time");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);

  useEffect(() => {
    const fetchCachedImages = async () => {
      const images = await getCachedQRImages();
      setCachedImages(images);
    };
    fetchCachedImages();
  }, []);

  const sortImages = (images: QRCodeEntry[]) => {
    return images.sort((a, b) => {
      if (sortOption === "time") {
        return b.timestamp - a.timestamp;
      } else {
        return a.bankName.localeCompare(b.bankName);
      }
    });
  };

  const togglePin = async (id: number) => {
    const image = cachedImages.find((img) => img.id === id);
    if (image) {
      await updateQRImage(id, { isPinned: !image.isPinned });
      setCachedImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, isPinned: !img.isPinned } : img,
        ),
      );
      showToast(
        image.isPinned ? "Đã bỏ ghim mã QR" : "Đã ghim mã QR",
        "success",
      );
    }
  };

  const deleteImage = async (id: number) => {
    await deleteQRImage(id);
    setCachedImages((prev) => prev.filter((img) => img.id !== id));
    showToast("Đã xóa mã QR", "success");
  };

  const downloadImage = async (url: string, bankName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `QR_${bankName}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Đã tải xuống mã QR", "success");
    } catch (error) {
      console.error("Error downloading image:", error);
      showToast("Có lỗi xảy ra khi tải xuống mã QR", "error");
    }
  };

  const toggleImageSelection = (id: number) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((imgId) => imgId !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedImages.length === cachedImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(cachedImages.map((img) => img.id!));
    }
  };

  const showSuccessToast = (action: string, count: number) => {
    showToast(`Đã ${action} ${count} mã QR thành công`, "success");
  };

  const showErrorToast = (action: string) => {
    showToast(`Có lỗi xảy ra khi ${action} mã QR`, "error");
  };

  const handleBulkAction = async (action: "pin" | "delete" | "download") => {
    try {
      switch (action) {
        case "pin":
          await Promise.all(
            selectedImages.map((id) => updateQRImage(id, { isPinned: true })),
          );
          showSuccessToast("ghim", selectedImages.length);
          break;
        case "delete":
          await Promise.all(selectedImages.map((id) => deleteQRImage(id)));
          showSuccessToast("xóa", selectedImages.length);
          break;
        case "download":
          selectedImages.forEach((id) => {
            const image = cachedImages.find((img) => img.id === id);
            if (image) {
              downloadImage(image.url, image.bankName);
            }
          });
          showSuccessToast("tải xuống", selectedImages.length);
          break;
      }
      setCachedImages(await getCachedQRImages());
      setSelectedImages([]);
    } catch (error) {
      console.error("Error performing bulk action:", error);
      const actionText = getActionText(action);
      showErrorToast(actionText);
    }
  };

  const getActionText = (action: "pin" | "delete" | "download"): string => {
    switch (action) {
      case "pin":
        return "ghim";
      case "delete":
        return "xóa";
      case "download":
        return "tải xuống";
    }
  };

  const filteredImages = cachedImages.filter(
    (image) =>
      image.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.accountNo.includes(searchTerm),
  );

  const sortedImages = sortImages(filteredImages);
  const pinnedImages = sortedImages.filter((img) => img.isPinned);
  const unpinnedImages = sortedImages.filter((img) => !img.isPinned);

  return (
    <div className="mx-auto max-w-4xl rounded-xl p-8 shadow-2xl">
      <h1 className="mb-6 text-center text-3xl font-bold text-white">
        Lịch sử ảnh đã tạo
      </h1>

      {cachedImages.length > 0 ? (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Tìm kiếm ngân hàng hoặc số tài khoản"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-3 pl-10 text-white placeholder-neutral-500 transition-colors focus:border-blue-500"
              />
              <IconSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-neutral-500"
                size={20}
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="flex w-full items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white transition-colors hover:border-neutral-700 sm:w-auto"
              >
                <span>
                  {sortOption === "time"
                    ? "Sắp xếp theo thời gian"
                    : "Sắp xếp theo tên ngân hàng"}
                </span>
                <IconChevronDown
                  size={20}
                  className={`ml-2 transition-transform ${showSortOptions ? "rotate-180" : ""}`}
                />
              </button>
              {showSortOptions && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 bg-opacity-50 shadow-lg">
                  <button
                    onClick={() => {
                      setSortOption("time");
                      setShowSortOptions(false);
                    }}
                    className="w-full bg-opacity-50 px-4 py-2 text-left text-white transition-colors hover:bg-neutral-800"
                  >
                    Sắp xếp theo thời gian
                  </button>
                  <button
                    onClick={() => {
                      setSortOption("bankName");
                      setShowSortOptions(false);
                    }}
                    className="w-full bg-opacity-50 px-4 py-2 text-left text-white transition-colors hover:bg-neutral-800"
                  >
                    Sắp xếp theo tên ngân hàng
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="sticky top-4 z-10 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-neutral-900 bg-opacity-50 p-4 shadow-2xl">
            <button
              onClick={toggleSelectAll}
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-white transition-colors hover:bg-neutral-800"
            >
              {selectedImages.length === cachedImages.length ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">Bỏ chọn tất cả</span>
                  <IconCheckbox size={20} className="text-white" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">Chọn tất cả</span>
                  <IconSquare size={20} className="text-white" />
                </div>
              )}
            </button>

            {selectedImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkAction("pin")}
                  className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 transition-colors hover:bg-neutral-800"
                >
                  <IconPin size={20} className="-rotate-45 transform" />
                  <span className="hidden sm:inline">
                    Ghim ({selectedImages.length})
                  </span>
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 transition-colors hover:bg-neutral-800"
                >
                  <IconTrash size={20} />
                  <span className="hidden sm:inline">
                    Xóa ({selectedImages.length})
                  </span>
                </button>
                <button
                  onClick={() => handleBulkAction("download")}
                  className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 transition-colors hover:bg-neutral-800"
                >
                  <IconDownload size={20} />
                  <span className="hidden sm:inline">
                    Tải xuống ({selectedImages.length})
                  </span>
                </button>
              </div>
            )}
          </div>

          {pinnedImages.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-white">Đã ghim</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {pinnedImages.map((image) => (
                  <QRCodeCard
                    key={image.id}
                    image={image}
                    onPin={togglePin}
                    onDelete={deleteImage}
                    onDownload={downloadImage}
                    isSelected={selectedImages.includes(image.id!)}
                    onSelect={toggleImageSelection}
                  />
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {unpinnedImages.map((image) => (
                <QRCodeCard
                  key={image.id}
                  image={image}
                  onPin={togglePin}
                  onDelete={deleteImage}
                  onDownload={downloadImage}
                  isSelected={selectedImages.includes(image.id!)}
                  onSelect={toggleImageSelection}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <EmptyHistoryPlaceholder />
      )}
    </div>
  );
};

interface QRCodeCardProps {
  image: QRCodeEntry;
  onPin: (id: number) => void;
  onDelete: (id: number) => void;
  onDownload: (url: string, bankName: string) => void;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

const QRCodeCard: React.FC<QRCodeCardProps> = ({
  image,
  onPin,
  onDelete,
  onDownload,
  isSelected,
  onSelect,
}) => {
  const { showToast } = useOutletContext<LayoutContext>();
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = async (url: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const item = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([item]);
      showToast("Đã sao chép mã QR", "success");
    } catch (error) {
      console.error("Failed to copy image:", error);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg border bg-neutral-900 ${
        isSelected ? "border-blue-500" : "border-neutral-800"
      } transition-shadow duration-300 hover:shadow-lg focus:shadow-lg`}
    >
      {isSelected && (
        <div className="absolute left-2 top-2 z-10 rounded-full border border-neutral-800 bg-neutral-900 p-1 hover:bg-neutral-800">
          <IconCheck size={20} className="text-white" />
        </div>
      )}
      <div
        className="relative cursor-pointer"
        onClick={() => onSelect(image.id!)}
        role="button"
        aria-pressed={isSelected}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onSelect(image.id!);
          }
        }}
      >
        <img
          src={image.url}
          alt="Cached QR Code"
          className="h-auto w-full transition-opacity duration-300 hover:opacity-90"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 transition-opacity duration-300 hover:opacity-100">
          <button
            onClick={(e) => copyToClipboard(image.url, e)}
            className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-neutral-600 bg-[linear-gradient(110deg,#171717,45%,#a3a3a3,55%,#171717)] bg-[length:200%_100%] px-6 py-2 font-medium text-neutral-300 transition-colors hover:scale-105 focus:border-2 focus:border-neutral-400"
          >
            <IconCopy className="mr-2 h-5 w-5" />
            Sao chép
          </button>
        </div>
      </div>
      <div className="relative p-4">
        <p className="font-semibold text-white">
          <IconBuildingBank size={16} className="mr-1 inline-block" /> Ngân
          hàng: {image.bankName}
        </p>
        <p className="text-sm text-neutral-400">
          <IconCreditCard size={16} className="mr-1 inline-block" /> STK:{" "}
          {image.accountNo}
        </p>
        {image.accountName && (
          <p className="text-sm text-neutral-400">
            <IconUser size={16} className="mr-1 inline-block" />
            Tên: {image.accountName}
          </p>
        )}
        {image.amount && (
          <p className="text-sm text-neutral-400">
            <IconMoneybag size={16} className="mr-1 inline-block" />
            Số tiền: {image.amount}
          </p>
        )}
        {image.description && (
          <p className="text-sm text-neutral-400">
            <IconFileDescription size={16} className="mr-1 inline-block" />
            Mô tả: {image.description}
          </p>
        )}
        <p className="mt-2 text-xs text-neutral-500">
          <IconCalendar size={16} className="mr-1 inline-block" />{" "}
          {formatDate(image.timestamp)}
        </p>
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => onPin(image.id!)}
            className="transition-colors hover:text-blue-500 focus:text-blue-500"
          >
            {image.isPinned ? (
              <IconPin size={20} className="-rotate-45 transform" />
            ) : (
              <IconPinnedOff size={20} />
            )}
          </button>
          <button
            onClick={() => onDelete(image.id!)}
            className="transition-colors hover:text-red-500 focus:text-red-500"
          >
            <IconTrash size={20} />
          </button>
          <button
            onClick={() => onDownload(image.url, image.bankName)}
            className="transition-colors hover:text-green-500 focus:text-green-500"
          >
            <IconDownload size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagesHistory;
