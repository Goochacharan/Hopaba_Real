
import React from 'react';
import { cn } from '@/lib/utils';
import { Coffee, Utensils, Scissors, ShoppingBag, HeartPulse, Briefcase, BookOpen, Home, Users, MoreHorizontal, Dumbbell } from 'lucide-react';

export type CategoryType = 
  | 'all' 
  | 'restaurants' 
  | 'cafes' 
  | 'salons' 
  | 'shopping' 
  | 'health' 
  | 'services' 
  | 'education' 
  | 'real-estate' 
  | 'community' 
  | 'fitness'  // Added 'fitness' category
  | 'more';

interface CategoryFilterProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  className?: string;
}

const categories: { id: CategoryType; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <div className="w-5 h-5 rounded-full bg-primary opacity-70"></div> },
  { id: 'restaurants', label: 'Restaurants', icon: <Utensils className="w-5 h-5" /> },
  { id: 'cafes', label: 'Cafes', icon: <Coffee className="w-5 h-5" /> },
  { id: 'salons', label: 'Salons', icon: <Scissors className="w-5 h-5" /> },
  { id: 'shopping', label: 'Shopping', icon: <ShoppingBag className="w-5 h-5" /> },
  { id: 'health', label: 'Health', icon: <HeartPulse className="w-5 h-5" /> },
  { id: 'services', label: 'Services', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'education', label: 'Education', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'real-estate', label: 'Real Estate', icon: <Home className="w-5 h-5" /> },
  { id: 'community', label: 'Community', icon: <Users className="w-5 h-5" /> },
  { id: 'fitness', label: 'Fitness', icon: <Dumbbell className="w-5 h-5" /> }, // Added fitness category with Dumbbell icon
  { id: 'more', label: 'More', icon: <MoreHorizontal className="w-5 h-5" /> },
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  selectedCategory, 
  onSelectCategory, 
  className 
}) => {
  return (
    <div className={cn("w-full overflow-auto py-2", className)}>
      <div className="flex gap-2 min-w-max pb-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all-200",
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/80 backdrop-blur-xs text-muted-foreground hover:bg-secondary"
            )}
          >
            <span className={cn(
              "transition-all-200",
              selectedCategory === category.id
                ? "text-primary-foreground"
                : "text-muted-foreground"
            )}>
              {category.icon}
            </span>
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
