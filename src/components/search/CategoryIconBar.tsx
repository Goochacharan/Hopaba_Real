
import React from "react";
import { cn } from "@/lib/utils";
import { 
  IceCreamBowl, Restaurant, Scissors, Store, ShoppingCart, Utensils, Cake, Pizza, Spa, Dumbbell 
} from "lucide-react";

type CategoryOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const CATEGORIES: CategoryOption[] = [
  {
    id: "ice-cream",
    label: "Ice Cream",
    icon: <IceCreamBowl size={30} className="text-[#8B5CF6]" />,
  },
  {
    id: "restaurants",
    label: "Restaurants",
    icon: <Utensils size={30} className="text-[#9b87f5]" />,
  },
  {
    id: "beauty-salon",
    label: "Beauty Salon",
    icon: <Spa size={30} className="text-[#6E59A5]" />,
  },
  {
    id: "salons",
    label: "Salons",
    icon: <Scissors size={30} className="text-[#7E69AB]" />,
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: <ShoppingCart size={30} className="text-[#1EAEDB]" />,
  },
  {
    id: "stores",
    label: "Stores",
    icon: <Store size={30} className="text-[#33C3F0]" />,
  },
  {
    id: "cakes",
    label: "Cakes",
    icon: <Cake size={30} className="text-[#D6BCFA]" />,
  },
  {
    id: "pizza",
    label: "Pizza",
    icon: <Pizza size={30} className="text-[#8B5CF6]" />,
  },
  {
    id: "fitness",
    label: "Fitness",
    icon: <Dumbbell size={30} className="text-[#8E9196]" />,
  },
  {
    id: "more",
    label: "More",
    icon: <Restaurant size={30} className="text-[#aaadb0]" />,
  },
];

interface CategoryIconBarProps {
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
        {CATEGORIES.map((cat) => (
          <li key={cat.id}>
            <button
              type="button"
              aria-label={cat.label}
              onClick={() => onSelect(cat.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[65px] group hover:scale-105 transition-all",
                selectedCategory === cat.id ? "bg-pink-100 ring-2 ring-[#8B5CF6]" : "bg-white"
              )}
            >
              <span
                className={cn(
                  "rounded-full bg-opacity-30 mb-1 p-2",
                  selectedCategory === cat.id
                    ? "bg-[#E5DEFF] shadow-md"
                    : ""
                )}
              >
                {cat.icon}
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
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
