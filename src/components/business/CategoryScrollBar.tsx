
import React from "react";
import { cn } from "@/lib/utils";

// Categories from Add Business/Service Listing section SERVICE_CATEGORIES (see BusinessListingForm and BasicInfoSection)
const SERVICE_CATEGORIES = [
  "Education", "Healthcare", "Food & Dining", "Home Services", "Beauty & Wellness",
  "Professional Services", "Auto Services", "Technology", "Financial Services",
  "Entertainment", "Travel & Transport", "Fitness", "Real Estate", "Retail", "Other"
];

// A matching color for each category (loop if needed)
const bgColors = [
  "bg-gradient-to-br from-[#9b87f5] to-[#7E69AB]",
  "bg-gradient-to-br from-[#1EAEDB] to-[#33C3F0]",
  "bg-gradient-to-br from-[#FFA99F] to-[#FF719A]",
  "bg-gradient-to-br from-[#FFE29F] to-[#FFA99F]",
  "bg-gradient-to-br from-[#abecd6] to-[#fbed96]",
  "bg-gradient-to-br from-[#D7D2CC] to-[#304352]",
  "bg-gradient-to-br from-[#FFC3A0] to-[#FFAFBD]",
  "bg-gradient-to-br from-[#e6b980] to-[#eacda3]",
  "bg-gradient-to-br from-[#e6e9f0] to-[#eef1f5]",
  "bg-gradient-to-br from-[#8B5CF6] to-[#7E69AB]",
  "bg-gradient-to-br from-[#33C3F0] to-[#1EAEDB]",
  "bg-gradient-to-br from-[#E5DEFF] to-[#9b87f5]",
  "bg-gradient-to-br from-[#FFA99F] to-[#FF719A]",
  "bg-gradient-to-br from-[#e6e9f0] to-[#EEF1F5]"
];

// A subtle border color for each (loop if needed)
const borderColors = [
  "border-[#E5DEFF]", "border-[#6E59A5]", "border-[#FFE29F]", "border-[#FF719A]",
  "border-[#aaadb0]", "border-[#517fa4]", "border-[#e2d1c3]", "border-[#e7f0fd]",
  "border-[#d299c2]", "border-[#E5DEFF]", "border-[#6E59A5]", "border-[#E5DEFF]",
  "border-[#FF719A]", "border-[#d299c2]"
];

interface CategoryScrollBarProps {
  selected: string;
  onSelect: (category: string) => void;
  className?: string;
}

// Buttons are rectangular, white bold text, nice depth, and highlight when selected.
const CategoryScrollBar: React.FC<CategoryScrollBarProps> = ({ selected, onSelect, className }) => {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto scrollbar-none flex gap-3 py-2 px-2",
        className
      )}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="flex gap-3 min-w-max">
        {SERVICE_CATEGORIES.map((cat, idx) => (
          <button
            key={cat}
            className={cn(
              "flex-shrink-0 px-5 py-2 rounded-[10px] text-base font-bold select-none cursor-pointer min-w-[148px] h-12 shadow-[0_2px_14px_0_rgba(146,132,199,0.19)] border transition-all duration-150 flex items-center justify-center",
              bgColors[idx % bgColors.length],
              borderColors[idx % borderColors.length],
              selected && selected.toLowerCase() === cat.toLowerCase()
                ? "ring-2 ring-[#F97316] border-[#F97316] text-white scale-105"
                : "opacity-90 text-white hover:ring-2 hover:scale-105 hover:opacity-100",
              "break-words"
            )}
            onClick={() => onSelect(cat)}
            type="button"
            aria-label={cat}
            style={{
              boxShadow: "0px 4px 12px rgba(144, 127, 221, 0.13)",
            }}
          >
            <span className="block truncate">{cat}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryScrollBar;
