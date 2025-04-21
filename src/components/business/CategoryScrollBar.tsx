
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Extended category list to match Add Business page
const DEFAULT_SERVICE_CATEGORIES = [
  "All",
  "Bakery",
  "Ice Cream Shops",
  "Cafes",
  "Restaurants",
  "Caterers",
  "Grocery & Vegetable Shops",
  "Electronics Repair",
  "Electricians",
  "Plumbers",
  "Home Cleaning",
  "Carpenters",
  "Home Decor",
  "Tutoring",
  "Music Teachers",
  "Dance Classes",
  "Language Tutors",
  "Art & Craft",
  "Sports & Fitness",
  "Gyms",
  "Yoga Instructors",
  "Hair Salons",
  "Spas",
  "Beauticians",
  "Massage Therapists",
  "Tailors",
  "Dry Cleaners",
  "Laundry Services",
  "Travel Agents",
  "Packers & Movers",
  "Auto Services",
  "Real Estate Agents",
  "Boutiques",
  "Florists",
  "Bookstores",
  "Medical Clinics",
  "Dentists",
  "Pharmacies",
  "Veterinarians",
  "Photographers",
  "Event Planners",
  "Financial Consultants",
  "Legal Advisors",
  "Tech Services",
  "Other"
];

// Array of bold, vibrant Tailwind background color classes
const categoryButtonColors = [
  "bg-[#ea384c]",  // Red
  "bg-[#9b87f5]",  // Primary Purple
  "bg-[#7E69AB]",  // Secondary Purple
  "bg-[#12b981]",  // Emerald Green
  "bg-[#F97316]",  // Bright Orange
  "bg-[#0EA5E9]",  // Ocean Blue
  "bg-[#8B5CF6]",  // Vivid Purple
  "bg-[#D946EF]",  // Magenta Pink
  "bg-[#22d3ee]",  // Cyan
  "bg-[#34d399]",  // Soft Green
  "bg-[#FBBF24]",  // Yellow
  "bg-[#ec4899]",  // Fuchsia
  "bg-[#6366f1]",  // Indigo
  "bg-[#ef4444]",  // Soft Red
  "bg-[#FDBA74]",  // Soft Orange
  "bg-[#38bdf8]",  // Light Blue
  "bg-[#a3e635]",  // Lime Green
  "bg-[#f43f5e]",  // Rose
  "bg-[#c084fc]",  // Light Purple
  "bg-[#14b8a6]",  // Teal
  "bg-[#bbf7d0]",  // Mint
  "bg-[#facc15]",  // Gold
  "bg-[#eab308]",  // Mustard
  "bg-[#fde68a]",  // Pale Yellow
  "bg-[#60a5fa]",  // Blue
  "bg-[#d1fae5]",  // Pale Green
  "bg-[#fef08a]",  // Light Yellow
  "bg-[#fda4af]",  // Pink
  "bg-[#f59e42]",  // Orange
  "bg-[#7dd3fc]",  // Sky Blue
  "bg-[#b91c1c]",  // Deep Red
  "bg-[#7c3aed]",  // Deep Indigo
  "bg-[#e879f9]",  // Light Magenta
  "bg-[#86efac]",  // Pale Mint
  "bg-[#6366f1]",  // Dark Indigo
  "bg-[#065f46]",  // Forest Green
  "bg-[#f472b6]",  // Bubblegum Pink
  "bg-[#c7d2fe]",  // Periwinkle
  "bg-[#3b82f6]",  // Medium Blue
  "bg-[#0d9488]",  // Dark Teal
  "bg-[#1e40af]",  // Navy Blue
  "bg-[#f3e8ff]",  // Lavender
  "bg-[#f1f5f9]"   // Off White (for "Other")
];

// "All" button background: white, gray bold font for contrast
const allButtonBg = "bg-white";
const allButtonText = "text-[#555] font-bold";
const categoryButtonText = "text-white font-bold";

// Unified subtle border
const borderStyle = "border border-[#eaeaea]";
// Shadow for depth
const depthShadow = "shadow-[0_2px_14px_0_rgba(22,25,34,0.13)]";

// Rectangular shape & spacing
const buttonShapeStyles =
  "flex-shrink-0 px-5 py-2.5 rounded-[11px] text-base select-none cursor-pointer min-w-[156px] h-12 transition-all duration-150 flex items-center justify-center";

// Selected and idle states
const selectedStyles = "ring-2 ring-[#ea384c] border-[#ea384c] scale-105";
const idleStyles = "opacity-95 hover:opacity-100 hover:scale-105";

// Main component
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
  const [categories, setCategories] = useState<string[]>(DEFAULT_SERVICE_CATEGORIES);
  
  useEffect(() => {
    // Log the selected category for debugging
    console.log("Selected category in CategoryScrollBar:", selected);
  }, [selected]);
  
  return (
    <div
      className={cn(
        "w-full overflow-x-auto scrollbar-none flex gap-3 py-2 px-2",
        className
      )}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="flex gap-3 min-w-max">
        {categories.map((cat, idx) => {
          // "All" button and color assignment for categories
          const isAll = cat === "All";
          const bgColor = isAll
            ? allButtonBg
            : categoryButtonColors[(idx - 1 + categoryButtonColors.length) % categoryButtonColors.length];
          // Make font dark for very light backgrounds ("All" and "Other" buttons)
          const isVeryLight =
            (isAll || cat === "Other" || bgColor === "bg-[#f1f5f9]" || bgColor === "bg-[#fde68a]");
          const textColor = isVeryLight ? "text-[#555] font-bold" : categoryButtonText;
          
          // Fix the category comparison logic - make it case-insensitive
          const isSelected = isAll 
            ? selected.toLowerCase() === "all" || !selected
            : selected && cat.toLowerCase() === selected.toLowerCase();

          console.log(`Button: ${cat}, Selected: ${isSelected}`, { 
            buttonCat: cat.toLowerCase(), 
            selected: selected.toLowerCase(), 
            match: cat.toLowerCase() === selected.toLowerCase() 
          });
          
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
                boxShadow: "0px 4px 18px rgba(22,25,34,0.11)",
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
