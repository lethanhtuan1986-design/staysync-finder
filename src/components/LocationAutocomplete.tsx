import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  searchNominatim,
  NominatimResult,
  nominatimResultToBounds,
  GeoBounds,
  DEFAULT_RADIUS_KM,
} from "@/lib/geocoding";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: NominatimResult, bounds: GeoBounds) => void;
  enrichSuffix?: string;
  radiusKm?: number;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  /** Kept for backward compatibility — no longer used (Google Places removed). */
  biasLat?: number;
  biasLng?: number;
  biasRadiusKm?: number;
}

interface DropdownItem {
  id: string;
  main: string;
  secondary: string;
  raw: NominatimResult;
}

const NOMINATIM_DEBOUNCE_MS = 500;

export const LocationAutocomplete = ({
  value,
  onChange,
  onSelect,
  enrichSuffix = "",
  radiusKm = DEFAULT_RADIUS_KM,
  placeholder = "Tìm kiếm địa điểm...",
  className,
  inputClassName,
}: LocationAutocompleteProps) => {
  const [items, setItems] = useState<DropdownItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setItems([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const query = enrichSuffix ? `${value} ${enrichSuffix}`.trim() : value;
      const data = await searchNominatim(query, 5);
      const mapped: DropdownItem[] = data.map((r, idx) => {
        const parts = r.display_name.split(",").map((s) => s.trim());
        return {
          id: `${r.lat}-${r.lon}-${idx}`,
          main: parts[0] || r.display_name,
          secondary: parts.slice(1).join(", "),
          raw: r,
        };
      });
      setItems(mapped);
      setIsOpen(mapped.length > 0);
      setLoading(false);
    }, NOMINATIM_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, enrichSuffix]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = useCallback(
    (item: DropdownItem) => {
      onChange(item.main);
      setIsOpen(false);
      const bounds = nominatimResultToBounds(item.raw, radiusKm);
      onSelect(item.raw, bounds);
      setItems([]);
    },
    [onChange, onSelect, radiusKm],
  );

  const handleClear = () => {
    onChange("");
    setItems([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => items.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className={cn(
          "w-full pl-9 pr-9 h-11 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow",
          inputClassName,
        )}
      />
      {loading && (
        <Loader2
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
        />
      )}
      {!loading && value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Xoá"
        >
          <X size={14} />
        </button>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-popover border border-border rounded-2xl shadow-xl max-h-80 overflow-y-auto animate-in fade-in-0 slide-in-from-top-1">
          {items.length > 0 ? (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent focus:bg-accent focus:outline-none transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                <span className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground leading-snug truncate">
                    {item.main}
                  </span>
                  {item.secondary && (
                    <span className="block text-xs text-muted-foreground leading-snug truncate mt-0.5">
                      {item.secondary}
                    </span>
                  )}
                </span>
              </button>
            ))
          ) : (
            !loading &&
            value.trim() && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Không tìm thấy địa điểm
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
