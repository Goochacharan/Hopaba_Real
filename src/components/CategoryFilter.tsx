
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Coffee, Utensils, Scissors, ShoppingBag, HeartPulse, Briefcase, BookOpen, Home, Users, MoreHorizontal, Dumbbell, PlusCircle } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  | 'fitness'
  | 'more'
  | string; // Allow for dynamically added categories

interface CategoryFilterProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  className?: string;
  allowAddCategories?: boolean;
}

const defaultCategories: { id: CategoryType; label: string; icon: React.ReactNode }[] = [
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
  { id: 'fitness', label: 'Fitness', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'more', label: 'More', icon: <MoreHorizontal className="w-5 h-5" /> },
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  selectedCategory, 
  onSelectCategory, 
  className,
  allowAddCategories = false
}) => {
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [customCategories, setCustomCategories] = useState<{ id: string; label: string; icon: React.ReactNode }[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Combine default and custom categories, then alphabetically sort (except 'all' and 'more' which stay at beginning/end)
  const categories = [...defaultCategories, ...customCategories].sort((a, b) => {
    if (a.id === 'all') return -1;
    if (b.id === 'all') return 1;
    if (a.id === 'more') return 1;
    if (b.id === 'more') return -1;
    return a.label.localeCompare(b.label);
  });
  
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: "Category name required",
        description: "Please enter a category name",
        variant: "destructive"
      });
      return;
    }
    
    // Format the category ID (lowercase, hyphenated)
    const categoryId = newCategory.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Check if category already exists
    if (categories.some(cat => cat.id === categoryId)) {
      toast({
        title: "Category already exists",
        description: "This category already exists in the system",
        variant: "destructive"
      });
      return;
    }
    
    // Add the new category
    const newCategoryObj = { 
      id: categoryId, 
      label: newCategory.trim(), 
      icon: <Briefcase className="w-5 h-5" /> 
    };
    
    setCustomCategories([...customCategories, newCategoryObj]);
    setNewCategory('');
    setShowAddForm(false);
    
    toast({
      title: "Category added",
      description: `"${newCategory.trim()}" has been added to the categories list`,
    });
  };
  
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
                ? "bg-blue-600 text-white"
                : "bg-secondary/80 backdrop-blur-xs text-muted-foreground hover:bg-secondary"
            )}
          >
            <span className={cn(
              "transition-all-200",
              selectedCategory === category.id
                ? "text-white"
                : "text-muted-foreground"
            )}>
              {category.icon}
            </span>
            {category.label}
          </button>
        ))}
        
        {isAdmin && allowAddCategories && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all bg-secondary/80 hover:bg-secondary text-muted-foreground"
          >
            <PlusCircle className="w-5 h-5 text-muted-foreground" />
            Add Category
          </button>
        )}
      </div>
      
      {isAdmin && allowAddCategories && showAddForm && (
        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder="Category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleAddCategory} size="sm">Add</Button>
          <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">Cancel</Button>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
