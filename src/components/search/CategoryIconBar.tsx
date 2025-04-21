
import React from "react";
import { cn } from "@/lib/utils";
import {
  IceCream,
  Restaurant,
  Scissors,
  MoreHorizontal,
  Coffee,
  Activity,
  ShoppingBag,
  BeautySalon,
} from "lucide-react";

// Mapping icons to categories
const CATEGORY_DETAILS = [
  {
    id: "Education",
    label: "Education",
    icon: <Coffee size={32} strokeWidth={2.2} className="text-[#0EA5E9]" />,
    color: "bg-[#D3E4FD]",
    border: "border-[#33C3F0]",
  },
  {
    id: "Healthcare",
    label: "Healthcare",
    icon: (
      <Activity size={32} strokeWidth={2.2} className="text-[#6E59A5]" />
    ),
    color: "bg-[#E5DEFF]",
    border: "border-[#D6BCFA]",
  },
  {
    id: "Food & Dining",
    label: "Food & Dining",
    icon: <Restaurant size={32} strokeWidth={2.2} className="text-[#8B5CF6]" />,
    color: "bg-[#F7F0FF]",
    border: "border-[#8B5CF6]",
  },
  {
    id: "Home Services",
    label: "Home Services",
    icon: (
      <ShoppingBag size={32} strokeWidth={2.2} className="text-[#c1c161]" />
    ),
    color: "bg-[#FBED96]",
    border: "border-[#ABECD6]",
  },
  {
    id: "Beauty & Wellness",
    label: "Beauty & Wellness",
    icon: <BeautySalon size={32} strokeWidth={2.2} className="text-[#7E69AB]" />,
    color: "bg-[#E5DEFF]",
    border: "border-[#7E69AB]",
  },
  {
    id: "Professional Services",
    label: "Professional Services",
    icon: (
      <Scissors size={32} strokeWidth={2.2} className="text-[#FFA99F]" />
    ),
    color: "bg-[#FFF0C7]",
    border: "border-[#FF719A]",
  },
  {
    id: "Auto Services",
    label: "Auto Services",
    icon: (
      <Activity size={32} strokeWidth={2.2} className="text-[#1EAEDB]" />
    ),
    color: "bg-[#D3EAFD]",
    border: "border-[#1EAEDB]",
  },
  {
    id: "Technology",
    label: "Technology",
    icon: (
      <Activity size={32} strokeWidth={2.2} className="text-[#6E59A5]" />
    ),
    color: "bg-[#FDFCFB]",
    border: "border-[#E2D1C3]",
  },
  {
    id: "Financial Services",
    label: "Financial Services",
    icon: (
      <ShoppingBag size={32} strokeWidth={2.2} className="text-[#33C3F0]" />
    ),
    color: "bg-[#EEF1F5]",
    border: "border-[#33C3F0]",
  },
  {
    id: "Entertainment",
    label: "Entertainment",
    icon: (
      <IceCream size={32} strokeWidth={2.2} className="text-[#EE9CA7]" />
    ),
    color: "bg-[#FFDDE1]",
    border: "border-[#EE9CA7]",
  },
  {
    id: "Travel & Transport",
    label: "Travel & Transport",
    icon: (
      <Activity size={32} strokeWidth={2.2} className="text-[#0EA5E9]" />
    ),
    color: "bg-[#E7F0FD]",
    border: "border-[#0EA5E9]",
  },
  {
    id: "Fitness",
    label: "Fitness",
    icon: (
      <Activity size={32} strokeWidth={2.2} className="text-[#8E9196]" />
    ),
    color: "bg-[#D3E4FD]",
    border: "border-[#8E9196]",
  },
  {
    id: "Real Estate",
    label: "Real Estate",
    icon: (
      <ShoppingBag size={32} strokeWidth={2.2} className="text-[#E6B980]" />
    ),
    color: "bg-[#EACDA3]",
    border: "border-[#E6B980]",
  },
  {
    id: "Retail",
    label: "Retail",
    icon: (
      <ShoppingBag size={32} strokeWidth={2.2} className="text-[#33C3F0]" />
    ),
    color: "bg-[#D6BCFA]",
    border: "border-[#33C3F0]",
  },
  {
    id: "Other",
    label: "Other",
    icon: (
      <MoreHorizontal size={32} strokeWidth={2.2} className="text-[#aaadb0]" />
    ),
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
      <ul className="flex flex-row gap-4 min-w-max">
        {CATEGORY_DETAILS.map((cat) => (
          <li key={cat.id}>
            <button
              type="button"
              aria-label={cat.label}
              onClick={() => onSelect(cat.id)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-20 min-w-[70px] max-w-[80px] group hover:scale-105 transition-all rounded-full shadow-md",
                "border",
                cat.color,
                cat.border,
                selectedCategory === cat.id
                  ? "ring-2 ring-[#8B5CF6] border-2"
                  : ""
              )}
              style={{
                borderColor: selectedCategory === cat.id ? "#8B5CF6" : undefined,
                boxShadow:
                  selectedCategory === cat.id
                    ? "0 4px 16px 0 rgba(139, 92, 246, 0.12)"
                    : "0 2px 8px 0 rgba(0,0,0,0.06)",
                aspectRatio: "1/1",
              }}
            >
              <span className="flex items-center justify-center w-16 h-16">
                {cat.icon}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold text-center mt-1 w-16 leading-tight",
                  selectedCategory === cat.id
                    ? "text-[#8B5CF6]"
                    : "text-neutral-700"
                )}
                style={{
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                }}
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
