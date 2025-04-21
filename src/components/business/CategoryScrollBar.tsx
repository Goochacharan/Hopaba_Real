
import React from "react";
import { cn } from "@/lib/utils";

// List of categories as per business/services listing
const categories = [
  { label: "All", value: "all", color: "bg-gradient-to-br from-[#9b87f5] to-[#7E69AB]", border: "border-[#E5DEFF]" },
  { label: "Restaurants", value: "restaurants", color: "bg-gradient-to-br from-[#FFA99F] to-[#FF719A]", border: "border-[#FFE29F]" },
  { label: "Cafes", value: "cafes", color: "bg-gradient-to-br from-[#33C3F0] to-[#1EAEDB]", border: "border-[#E5DEFF]" },
  { label: "Salons", value: "salons", color: "bg-gradient-to-br from-[#E5DEFF] to-[#9b87f5]", border: "border-[#6E59A5]" },
  { label: "Shopping", value: "shopping", color: "bg-gradient-to-br from-[#FFE29F] to-[#FFA99F]", border: "border-[#FF719A]" },
  { label: "Health", value: "health", color: "bg-gradient-to-br from-[#abecd6] to-[#fbed96]", border: "border-[#aaadb0]" },
  { label: "Services", value: "services", color: "bg-gradient-to-br from-[#D7D2CC] to-[#304352]", border: "border-[#517fa4]" },
  { label: "Education", value: "education", color: "bg-gradient-to-br from-[#FFC3A0] to-[#FFAFBD]", border: "border-[#e2d1c3]" },
  { label: "Real Estate", value: "real-estate", color: "bg-gradient-to-br from-[#e6b980] to-[#eacda3]", border: "border-[#e7f0fd]" },
  { label: "Community", value: "community", color: "bg-gradient-to-br from-[#e6e9f0] to-[#eef1f5]", border: "border-[#d299c2]" },
  { label: "Fitness", value: "fitness", color: "bg-gradient-to-br from-[#8B5CF6] to-[#7E69AB]", border: "border-[#E5DEFF]" },
  { label: "More", value: "more", color: "bg-gradient-to-br from-[#1EAEDB] to-[#33C3F0]", border: "border-[#6E59A5]" }
];

interface Props {
  selected: string;
  onSelect: (cat: string) => void;
  className?: string;
}

// Makes a horizontally scrollable bar of category buttons with colored backgrounds and light border/shadow.
const CategoryScrollBar: React.FC<Props> = ({ selected, onSelect, className }) => {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto scrollbar-none flex gap-3 py-2 px-2",
        className
      )}
      style={{ WebkitOverflowScrolling: "touch" }}
      tabIndex={0}
    >
      <div className="flex gap-2 min-w-max">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium select-none cursor-pointer min-w-[112px] h-10 shadow-[0_1px_8px_0_rgba(146,132,199,0.09)] transition-all",
              cat.color,
              cat.border,
              "border",
              selected === cat.value
                ? "ring-2 ring-primary text-white"
                : "text-neutral-800 hover:ring-2 hover:ring-secondary-foreground/60",
              "break-words"
            )}
            onClick={() => onSelect(cat.value)}
            style={{ boxShadow: "0px 2px 10px rgba(144, 127, 221, 0.09)" }}
            aria-label={cat.label}
            type="button"
          >
            <span className="block truncate">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryScrollBar;
