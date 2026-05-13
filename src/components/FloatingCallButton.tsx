import { Phone, MessageCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HOTLINE_DISPLAY, HOTLINE_TEL, ZALO_LINK } from "@/lib/contact";

export const FloatingCallButton = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 animate-pulse hover:animate-none"
          aria-label="Liên hệ hotline"
        >
          <Phone size={24} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={12}
        className="w-64 p-2 mr-1"
      >
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">Hotline</p>
          <p className="text-sm font-semibold text-foreground">{HOTLINE_DISPLAY}</p>
        </div>
        <div className="h-px bg-border my-1" />
        <a
          href={HOTLINE_TEL}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-accent transition-colors"
        >
          <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Phone size={18} />
          </span>
          <span className="text-sm font-medium text-foreground">Gọi trực tiếp</span>
        </a>
        <a
          href={ZALO_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-accent transition-colors"
        >
          <span className="w-9 h-9 rounded-full bg-[hsl(var(--primary)/0.1)] text-primary flex items-center justify-center">
            <MessageCircle size={18} />
          </span>
          <span className="text-sm font-medium text-foreground">Nhắn tin Zalo</span>
        </a>
      </PopoverContent>
    </Popover>
  );
};
