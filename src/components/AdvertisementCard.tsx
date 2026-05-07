import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Heart, CalendarCheck, Smartphone, Eye, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { AdvertisementData } from "@/services/advertisement.service";
import { formatVNPrice, getImageUrl } from "@/services/index";
import { useSavedRooms } from "@/hooks/useSavedRooms";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScheduleForm } from "@/components/ScheduleForm";
import { AppDownloadButtons } from "@/components/AppDownloadButtons";
import { Skeleton } from "@/components/ui/skeleton";

interface AdvertisementCardProps {
  data: AdvertisementData;
  index?: number;
  showScheduleButton?: boolean;
  /** Eager-load ảnh cho card above-the-fold (vd 6 card đầu trên search). */
  priority?: boolean;
}

const AdvertisementCardImpl = ({ data, index = 0, showScheduleButton = false, priority = false }: AdvertisementCardProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const { isSaved, toggleSave } = useSavedRooms();
  const { t } = useTranslation();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const apt = data?.apartmentUu;
  const firstImage = data?.images?.[0];
  const imageUrl = firstImage ? getImageUrl(firstImage) : "/placeholder.svg";

  const locationParts = [apt?.ward?.fullName, apt?.province?.fullName].filter(Boolean);
  const locationText = locationParts.length > 0 ? locationParts.join(", ") : "Đang cập nhật";

  const typeName = apt?.apartmentTypeUu?.name || t("listing.room");
  const apartmentSize = apt?.apartmentSize;
  const roomCount = apt?.roomCount;

  const statsParts: string[] = [];
  if (apartmentSize != null && apartmentSize > 0) statsParts.push(`${apartmentSize}m²`);
  if (roomCount != null && roomCount > 0) statsParts.push(`${roomCount} ${t("listing.rooms")}`);

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return "Vừa xong";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
    if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)} ngày trước`;
    if (diffSec < 31536000) return `${Math.floor(diffSec / 2592000)} tháng trước`;
    return `${Math.floor(diffSec / 31536000)} năm trước`;
  };

  const viewCount = data?.viewCount;
  const updatedText = formatRelativeTime(data?.startDate);
  const showMeta = (viewCount != null && viewCount > 0) || updatedText;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group"
    >
      <Link to={`/advertisement/${data?.uuid}`} className="block overflow-hidden">
        <div className="bg-card rounded-2xl overflow-hidden border border-border card-hover flex sm:block">
          {/* Image */}
          <div className="relative w-[42%] sm:w-auto shrink-0 sm:aspect-[3/2] aspect-auto overflow-hidden bg-muted">
            {!imgLoaded && (
              <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
            )}
            <img
              src={imageUrl}
              alt={data?.title || ""}
              className={`block object-cover w-full h-full sm:group-hover:scale-105 transition-all duration-500 will-change-transform ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              // @ts-expect-error - fetchpriority is valid HTML, not yet in React types in some versions
              fetchpriority={priority ? "high" : "auto"}
              onLoad={() => setImgLoaded(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
                setImgLoaded(true);
              }}
            />
            {/* Rating badge (mobile) */}
            {apt?.avgStars != null && apt.avgStars > 0 && (
              <div className="sm:hidden absolute top-2 left-2 bg-card/95 backdrop-blur px-2 py-0.5 rounded-md text-[11px] font-semibold text-foreground flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                {apt.avgStars}
              </div>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const wasSaved = isSaved(data?.uuid);
                toggleSave(data?.uuid);
                toast(wasSaved ? "Đã bỏ lưu phòng" : "Đã lưu phòng thành công!", { duration: 2000 });
              }}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-card/90 backdrop-blur flex items-center justify-center transition-colors hover:bg-card"
            >
              <Heart
                size={16}
                className={isSaved(data?.uuid) ? "fill-destructive text-destructive" : "text-muted-foreground"}
              />
            </button>
            {/* Type badge - desktop only at top-left (mobile uses rating) */}
            <div className="hidden sm:block absolute top-3 left-3 bg-card/90 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-foreground">
              {typeName}
            </div>
            {/* Price overlay - desktop only */}
            <div className="hidden sm:block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent pt-8 pb-3 px-4">
              <span className="text-white font-bold text-lg drop-shadow-sm">
                {formatVNPrice(data?.price ?? 0)}
                <span className="text-white/80 text-sm font-normal">{t("listing.perMonth")}</span>
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0 p-3 sm:p-4 space-y-1.5 sm:space-y-2">
            <h3 className="font-semibold text-foreground text-sm line-clamp-2 sm:truncate sm:line-clamp-none" title={data?.title || ""}>
              {data?.title || "Đang cập nhật"}
            </h3>

            <p className="text-muted-foreground text-xs sm:text-sm flex items-center gap-1.5">
              <MapPin size={13} className="shrink-0 text-primary" />
              <span className="truncate">{locationText}</span>
            </p>

            {/* Stats row: type/size/rooms + price (mobile shows price inline) */}
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="truncate">
                {[typeName, ...statsParts].filter(Boolean).join(" • ")}
              </span>
              <span className="sm:hidden text-destructive font-bold text-sm whitespace-nowrap">
                {formatVNPrice(data?.price ?? 0)}
              </span>
            </div>

            {showMeta && (
              <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                {viewCount != null && viewCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {viewCount.toLocaleString("vi-VN")}
                  </span>
                )}
                {updatedText && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {updatedText}
                  </span>
                )}
              </div>
            )}

            {statsParts.length > 0 && (
              <div className="hidden sm:block bg-secondary rounded-lg px-3 py-2 text-xs text-muted-foreground font-medium">
                {statsParts.join(" • ")}
                {apt?.avgStars != null && apt.avgStars > 0 && (
                  <span className="float-right text-yellow-500">★ {apt.avgStars}</span>
                )}
              </div>
            )}

            {/* Deposit info */}
            {data?.deposit != null && data.deposit > 0 && (
              <p className="hidden sm:block text-xs text-muted-foreground">
                {t("listing.deposit")}: {formatVNPrice(data.deposit)}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              {/* Schedule button - desktop only on mobile to save space */}
              <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <DialogTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setScheduleOpen(true);
                    }}
                    className="hidden sm:flex flex-1 items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-primary/30 text-primary text-xs font-medium hover:bg-primary/5 transition-colors"
                  >
                    <CalendarCheck size={14} />
                    {t("schedule.title")}
                  </button>
                </DialogTrigger>
                <DialogContent
                  className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDownOutside={(e) => e.stopPropagation()}
                >
                  <DialogHeader>
                    <DialogTitle>{t("schedule.title")}</DialogTitle>
                  </DialogHeader>
                  <ScheduleForm
                    propertyTitle={data?.title || ""}
                    apartmentUuid={apt?.uuid}
                    advertisementUuid={data?.uuid}
                  />
                </DialogContent>
              </Dialog>

              {/* View detail / Deposit button */}
              <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                {/* Mobile: "Xem chi tiết" link to detail */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/advertisement/${data?.uuid}`;
                  }}
                  className="sm:hidden mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors w-full"
                >
                  <Eye size={14} />
                  Xem chi tiết
                </button>
                {/* Desktop: deposit dialog */}
                <DialogTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDepositOpen(true);
                    }}
                    className="hidden sm:flex flex-1 items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Smartphone size={14} />
                    {t("listing.deposit")}
                  </button>
                </DialogTrigger>
                <DialogContent
                  className="sm:max-w-sm rounded-2xl"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDownOutside={(e) => e.stopPropagation()}
                >
                  <DialogHeader>
                    <DialogTitle>{t("listing.depositNotice")}</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("listing.depositDownloadApp")}
                  </p>
                  <div onClick={(e) => e.stopPropagation()}>
                    <AppDownloadButtons />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export const AdvertisementCard = memo(AdvertisementCardImpl, (prev, next) => {
  return (
    prev.data?.uuid === next.data?.uuid &&
    prev.priority === next.priority &&
    prev.showScheduleButton === next.showScheduleButton
  );
});

