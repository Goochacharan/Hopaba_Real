
import React from "react";
import { cn } from "@/lib/utils";
import {
  IceCream,
  Scissors,
  MoreHorizontal,
  Coffee,
} from "lucide-react";

// Category definitions aligned with SERVICE_CATEGORIES in the business listing form
const CATEGORY_DETAILS: {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  border: string;
}[] = [
  {
    id: "Education",
    label: "Education",
    icon: <Coffee size={30} className="text-[#0EA5E9]" />, // coffee for study/reading
    color: "bg-[#D3E4FD]",
    border: "border-[#33C3F0]",
  },
  {
    id: "Healthcare",
    label: "Healthcare",
    icon: (
      <span className="w-[30px] h-[30px] flex items-center justify-center bg-[#E5DEFF] rounded-full text-[#6E59A5] border-2 border-[#D6BCFA] text-xl font-bold">
        H
      </span>
    ),
    color: "bg-[#E5DEFF]",
    border: "border-[#D6BCFA]",
  },
  {
    id: "Food & Dining",
    label: "Food & Dining",
    icon: <IceCream size={30} className="text-[#8B5CF6]" />,
    color: "bg-[#F7F0FF]",
    border: "border-[#8B5CF6]",
  },
  {
    id: "Home Services",
    label: "Home Services",
    icon: (
      <span className="w-[30px] h-[30px] flex items-center justify-center bg-[#fbed96] rounded-full text-[#c1c161] border-2 border-[#abecd6] text-xl font-bold">
        HS
      </span>
    ),
    color: "bg-[#FBED96]",
    border: "border-[#ABECD6]",
  },
  {
    id: "Beauty & Wellness",
    label: "Beauty & Wellness",
    icon: <Scissors size={30} className="text-[#7E69AB]" />,
    color: "bg-[#E5DEFF]",
    border: "border-[#7E69AB]",
  },
  {
    id: "Professional Services",
    label: "Professional Services",
    icon: (
      <span className="w-[30px] h-[30px] flex items-center justify-center bg-[#fff0c7] rounded-full text-[#FFA99F] border-2 border-[#FF719A] text-xl font-bold">
        P
      </span>
    ),
    color: "bg-[#FFF0C7]",
    border: "border-[#FF719A]",
  },
  {
    id: "Auto Services",
    label: "Auto Services",
    icon: (
      <span className="w-[30px] h-[30px] flex items-center justify-center bg-[#d3eafd] rounded-full text-[#1EAEDB] border-2 border-[#1EAEDB] text-xl font-bold">
        A
      </span>
    ),
    color: "bg-[#D3EAFD]",
    border: "border-[#1EAEDB]",
  },
  {
    id: "Technology",
    label: "Technology",
    icon: (
      <span className="w-[30px] h-[30px] flex items-center justify-center bg-[#fdfcfb] rounded-full text-[#6E59A5] border-2 border-[#e2d1c3] text-xl font-bold">
        T
      </span>
    ),
    color: "bg-[#FDFCFB]",
    border: "border-[#E2D1C3]",
  },
  {
    id: "Financial Services",
    label: "Financial Services",
    icon: (
      <span className="w-[30px] h-[30px] flex items-center justify-center bg-[#eef1f5] rounded-full text-[#33C3F0] border-2 border-[#304352] text-xl font-bold">
        F
      </span>
    ),
    color: "bg-[#EEF1F5]",
    border: "border-[#33C3F0]",
  },
  {
    id: "Entertainment",
    label: "Entertainment",
    icon: (
      <span className="w-[30px] h-[30px] flex items-center justify-center bg-[#ffdde1] rounded-full text-[#EE9CA7] border-2 border-[#ee9ca7] text-xl font-bold">
        E
      </span>
    ),
    color: "bg-[#FFDDE1]",
    border: "border-[#EE9CA7]",
  },
  {
    id: "Travel & Transport",
    label: "Travel & Transport",
    icon: (
      <span className="w-[30px] h-[30px] flex items-center justify-center bg-[#e7f0fd] rounded-full text-[#0EA5E9] border-2 border-[#8B5CF6] text-xl font-bold">
        TT
      </span>
    ),
    color: "bg-[#E7F0FD]",
    border: "border-[#0EA5E9]",
  },
  {
    id: "Fitness",
    label: "Fitness",
    icon: (
      <span className="w-[30px] h-[30px] flex items-center justify-center bg-[#D3E4FD] rounded-full text-[#8E9196] border-2 border-[#8E9196] text-xl font-bold">
        F
      </span>
    ),
    color: "bg-[#D3E4FD]",
    border: "border-[#8E9196]",
  },
  {
    id: "Real Estate",
    label: "Real Estate",
    icon: (
      <span className="w-[30px] h-[30px] flex items-center justify-center bg-[#eacda3] rounded-full text-[#E6B980] border-2 border-[#E6B980] text-xl font-bold">
        RE
      </span>
    ),
    color: "bg-[#EACDA3]",
    border: "border-[#E6B980]",
  },
  {
    id: "Retail",
    label: "Retail",
    icon: (
      <span className="w-[30px] h-[30px] flex items-center justify-center bg-[#d6bcfa] rounded-full text-[#33C3F0] border-2 border-[#33C3F0] text-xl font-bold">
        R
      </span>
    ),
    color: "bg-[#D6BCFA]",
    border: "border-[#33C3F0]",
  },
  {
    id: "Other",
    label: "Other",
    icon: <MoreHorizontal size={30} className="text-[#aaadb0]" />,
    color: "bg-[#eef1f5]",
    border: "border-[#aaadb0]",
  },
];

export interface CategoryIconBarProps {
  selectedCategory: string;
  onSelect: (id: string) => void;
  className?: string;
}

const CategoryIconBar: React.FC<CategoryIconBarProps> = ({
  selectedCategory,
  onSelect,
  className,
}) => {
  return (
    <nav
      className={cn(
        "w-full py-3 px-1 overflow-x-auto scrollbar-hide",
        className
      )}
      aria-label="Category icons"
    >
      <ul className="flex flex-row gap-5 min-w-max">
        {CATEGORY_DETAILS.map((cat) => (
          <li key={cat.id}>
            <button
              type="button"
              aria-label={cat.label}
              onClick={() => onSelect(cat.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[80px] group hover:scale-105 transition-all py-2 rounded-xl shadow-md",
                cat.color,
                cat.border,
                selectedCategory === cat.id
                  ? "ring-2 ring-[#8B5CF6] border-2"
                  : "border"
              )}
              style={{
                borderColor: selectedCategory === cat.id ? "#8B5CF6" : undefined,
                boxShadow: selectedCategory === cat.id
                  ? "0 4px 16px 0 rgba(139, 92, 246, 0.07)"
                  : "0 2px 8px 0 rgba(0,0,0,0.04)"
              }}
            >
              <span className="mb-1">
                {cat.icon}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold",
                  selectedCategory === cat.id
                    ? "text-[#8B5CF6]"
                    : "text-neutral-700"
                )}
              >
                {cat.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CategoryIconBar;
