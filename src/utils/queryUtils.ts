
import { CategoryType } from '@/components/CategoryFilter';

export const processNaturalLanguageQuery = (
  lowercaseQuery: string,
  category: CategoryType
): { processedQuery: string; inferredCategory: CategoryType } => {
  let processedQuery = lowercaseQuery;
  let inferredCategory: CategoryType = category === 'all' ? 'all' : category;
  
  console.log('Original query:', `"${lowercaseQuery}"`);
  
  // Common food items that should map to restaurants
  const foodItems = [
    'masala puri', 'ice cream', 'biryani', 'dosa', 'idli', 'vada', 
    'pav bhaji', 'chaat', 'pani puri', 'samosa', 'chai', 'tandoori', 
    'naan', 'roti', 'curry', 'paneer', 'butter chicken', 'tikka',
    'korma', 'pulao', 'pakora', 'bhaji', 'thali', 'paratha'
  ];
  
  // Check for food items in the query
  const containsFoodItem = foodItems.some(item => 
    lowercaseQuery.includes(item)
  );
  
  if (inferredCategory !== 'all') {
    console.log(`Using provided category: ${inferredCategory}`);
  } 
  else {
    if (containsFoodItem) {
      inferredCategory = 'restaurants';
      console.log(`Inferred category as restaurants due to food item in query`);
    }
    else if (lowercaseQuery.includes('yoga')) {
      inferredCategory = 'fitness';
    } else if (lowercaseQuery.includes('restaurant')) {
      inferredCategory = 'restaurants';
    } else if (lowercaseQuery.includes('café') || lowercaseQuery.includes('cafe') || lowercaseQuery.includes('coffee')) {
      inferredCategory = 'cafes';
    } else if (lowercaseQuery.includes('salon') || lowercaseQuery.includes('haircut')) {
      inferredCategory = 'salons';
    } else if (lowercaseQuery.includes('plumber')) {
      inferredCategory = 'services';
    } else if (lowercaseQuery.includes('fitness') || lowercaseQuery.includes('gym')) {
      inferredCategory = 'fitness';
    } else if (lowercaseQuery.includes('biryani') || 
               lowercaseQuery.includes('food') || 
               lowercaseQuery.includes('dinner') || 
               lowercaseQuery.includes('lunch') ||
               lowercaseQuery.includes('breakfast')) {
      inferredCategory = 'restaurants';
    }
  }
  
  return { processedQuery, inferredCategory };
};

// Utility function to extract potential tags from a search query
export const extractTagsFromQuery = (query: string): string[] => {
  if (!query) return [];
  
  // Split the query into words
  const words = query.toLowerCase().split(/\s+/);
  
  // If we have multiple words, consider the full query as a potential tag too
  const potentialTags = [...words];
  if (words.length > 1) {
    potentialTags.push(query.toLowerCase());
  }
  
  return potentialTags;
};

