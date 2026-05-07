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
        <div className="bg-card rounded-2xl overflow-hidden border border-border card-hover flex flex-col">
          <div className="flex flex-row sm:flex-col gap-3 sm:gap-0 p-2 sm:p-0">
          <div className="relative w-[42%] shrink-0 aspect-[4/3] sm:w-full sm:aspect-[3/2] overflow-hidden bg-muted rounded-xl sm:rounded-none">
            {!imgLoaded && (
              <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
            )}
            <img
              src={imageUrl}
              alt={data?.title || ""}
              className={`block object-cover w-full h-full group-hover:scale-105 transition-all duration-500 will-change-transform ${imgLoaded ? "opacity-100" : "opacity-0"}`}
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
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const wasSaved = isSaved(data?.uuid);
                toggleSave(data?.uuid);
                toast(wasSaved ? "Đã bỏ lưu phòng" : "Đã lưu phòng thành công!", { duration: 2000 });
              }}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/90 backdrop-blur flex items-center justify-center transition-colors hover:bg-card"
            >
              <Heart
                size={18}
                className={isSaved(data?.uuid) ? "fill-destructive text-destructive" : "text-muted-foreground"}
              />
            </button>
            <div className="absolute top-3 left-3 bg-card/90 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-foreground">
              {typeName}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent pt-8 pb-3 px-4">
              <span className="text-white font-bold text-lg drop-shadow-sm">
                {formatVNPrice(data?.price ?? 0)}
                <span className="text-white/80 text-sm font-normal">{t("listing.perMonth")}</span>
              </span>
            </div>
          </div>

          <div className="py-1 sm:p-4 space-y-1.5 sm:space-y-2 flex-1 min-w-0 sm:flex-initial">
            <p className="text-muted-foreground text-sm flex items-center gap-1.5">
              <MapPin size={14} className="shrink-0 text-primary" />
              <span className="truncate">{locationText}</span>
            </p>



            {showMeta && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
              <div className="bg-secondary rounded-lg px-3 py-2 text-xs text-muted-foreground font-medium">
                {statsParts.join(" • ")}
                {apt?.avgStars != null && apt.avgStars > 0 && (
                  <span className="float-right text-yellow-500">★ {apt.avgStars}</span>
                )}
              </div>
            )}

            {/* Deposit info */}
            {data?.deposit != null && data.deposit > 0 && (
              <p className="text-xs text-muted-foreground">
                {t("listing.deposit")}: {formatVNPrice(data.deposit)}
              </p>
            )}

          </div>
          </div>

            {/* Action buttons - row 3, full width below */}
            <div className="flex flex-row gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
              {/* Schedule button */}
              <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <DialogTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setScheduleOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-primary/30 text-primary text-xs font-medium hover:bg-primary/5 transition-colors"
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

              {/* Deposit button */}
              <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                <DialogTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDepositOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
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

