import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackToTopButtonProps {
  threshold?: number;
  className?: string;
}

export const BackToTopButton = ({ threshold = 400, className }: BackToTopButtonProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const handleClick = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <Button
      type="button"
      size="icon"
      onClick={handleClick}
      aria-label="Về đầu trang"
      className={cn(
        "fixed right-4 md:right-6 bottom-24 md:bottom-24 z-40 h-11 w-11 rounded-full shadow-lg bg-background/90 backdrop-blur border border-border text-foreground hover:bg-accent transition-all duration-300",
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none",
        className,
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};

export default BackToTopButton;
