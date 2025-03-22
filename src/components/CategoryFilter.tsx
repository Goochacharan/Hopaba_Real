
import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export type CategoryType = 'all' | 'restaurants' | 'cafes' | 'salons' | 'fitness' | 'health' | 'shopping' | 'education' | 'services' | string;

export interface CategoryFilterProps {
  activeCategory?: CategoryType;
  onCategoryChange?: (category: CategoryType) => void;
}

const categories = [
  { id: 'all', name: 'All', icon: '🌟' },
  { id: 'restaurants', name: 'Restaurants', icon: '🍽️' },
  { id: 'cafes', name: 'Cafes', icon: '☕' },
  { id: 'salons', name: 'Salons', icon: '✂️' },
  { id: 'fitness', name: 'Fitness', icon: '🏋️' },
  { id: 'health', name: 'Health', icon: '🏥' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'services', name: 'Services', icon: '🔧' },
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  activeCategory = 'all', 
  onCategoryChange = () => {}
}) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-2 p-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id as CategoryType)}
            className={`
              inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors
              ${activeCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'}
            `}
          >
            <span className="mr-1.5">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CategoryFilter;
