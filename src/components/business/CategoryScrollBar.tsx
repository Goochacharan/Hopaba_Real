
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Array of distinct dark, rich background color classes for variety 
const darkBgColors = [
  "bg-[#1A1F2C]",  // Deep navy
  "bg-[#403E43]",  // Charcoal gray
  "bg-[#222222]",  // Blackish gray
  "bg-[#7E69AB]",  // Deep purple
  "bg-[#000000e6]", // Black
  "bg-[#555555]",  // Mid dark gray
  "bg-[#333333]",  // Very dark gray
  "bg-[#221F26]",  // Almost black purple
  "bg-[#302D46]",  // Rich deep indigo
  "bg-[#2e3742]",  // Space gray
  "bg-[#292933]",  // Shadowy black
  "bg-[#45465c]",  // Muted dark indigo
  "bg-[#18181B]", // Extra dark
  "bg-[#222]",     // Short hex dark gray
  "bg-[#333]",     // Short hex
  "bg-[#3B3B3B]",  // Gray-black
];

// "All" button styling
const allButtonBg = "bg-white";
const allButtonText = "text-[#555] font-bold";

// Others: white bold font
const categoryButtonText = "text-white font-bold";

// Button shape/styles
const buttonShapeStyles =
  "flex-shrink-0 px-5 py-2 rounded-[10px] text-base select-none cursor-pointer min-w-[148px] h-12 transition-all duration-150 flex items-center justify-center";

// Selected state
const selectedStyles = "ring-2 ring-[#F97316] border-[#F97316] scale-105";
const idleStyles = "opacity-95 hover:opacity-100 hover:scale-105";

// Unified border — subtle and consistent for all
const borderStyle = "border border-[#161922]";

// Feather shadow for depth
const depthShadow = "shadow-[0_2px_10px_0_rgba(22,25,34,0.17)]";

// Component props
interface CategoryScrollBarProps {
  selected: string;
  onSelect: (category: string) => void;
  className?: string;
}

const CategoryScrollBar: React.FC<CategoryScrollBarProps> = ({
  selected,
  onSelect,
  className,
}) => {
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch category list from Supabase, distinct categories from service_providers
  useEffect(() => {
    const fetchCategories = async () => {
      // Avoid refetch if already loaded
      if (categories.length > 0) return;
      const { data, error } = await supabase
        .from("service_providers")
        .select("category")
        .neq("category", "")
        .order("category", { ascending: true });
      if (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
        return;
      }
      // Safely collect all unique categories (no empty and no duplicates, trim whitespace)
      const uniqueCategories = Array.from(
        new Set(
          (data || [])
            .map((row) => (row.category ? row.category.trim() : null))
            .filter((v): v is string => Boolean(v))
        )
      );
      setCategories(uniqueCategories);
    };

    fetchCategories();
    // No deps, run once (or else add [supabase] if using instance context)
    // eslint-disable-next-line
  }, []);

  // Final categories to display: All button + unique category list (removed "Other")
  const displayCategories = ["All", ...categories];

  return (
    <div
      className={cn(
        "w-full overflow-x-auto scrollbar-none flex gap-3 py-2 px-2",
        className
      )}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="flex gap-3 min-w-max">
        {displayCategories.map((cat, idx) => {
          const isAll = cat === "All";
          // Assign a dark color to each category, cycling through the list for >16 categories
          const bgColor = isAll
            ? allButtonBg
            : darkBgColors[(idx - 1) % darkBgColors.length];

          // Font color: gray on white, white otherwise
          const textColor = isAll ? allButtonText : categoryButtonText;

          // Selected logic: match case-insensitive
          const isSelected = selected
            ? cat.toLowerCase() === selected.toLowerCase()
            : isAll;

          return (
            <button
              key={cat}
              className={cn(
                buttonShapeStyles,
                bgColor,
                borderStyle,
                textColor,
                depthShadow,
                isSelected ? selectedStyles : idleStyles,
                "break-words"
              )}
              onClick={() => onSelect(cat)}
              type="button"
              aria-label={cat}
              style={{
                boxShadow: "0px 4px 18px rgba(22,25,34,0.20)",
              }}
            >
              <span className="block truncate">{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryScrollBar;
