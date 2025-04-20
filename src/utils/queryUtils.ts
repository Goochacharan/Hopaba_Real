
import { CategoryType } from '@/components/CategoryFilter';

export const processNaturalLanguageQuery = (
  lowercaseQuery: string,
  category: CategoryType
): { processedQuery: string; inferredCategory: CategoryType } => {
  let processedQuery = lowercaseQuery;
  let inferredCategory: CategoryType = category === 'all' ? 'all' : category;
  
  console.log('Original query:', `"${lowercaseQuery}"`);
  
  if (inferredCategory !== 'all') {
    console.log(`Using provided category: ${inferredCategory}`);
  } 
  else {
    if (lowercaseQuery.includes('yoga')) {
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
