
import { searchPatterns, keywordMap } from '@/utils/searchPatterns';
import { CategoryType } from '@/components/CategoryFilter';

export interface ProcessedQueryResult {
  processedQuery: string;
  inferredCategory: CategoryType;
}

export const processNaturalLanguageQuery = (
  rawQuery: string, 
  currentCategory: CategoryType
): ProcessedQueryResult => {
  const lowercaseQuery = rawQuery.toLowerCase();
  let processedQuery = lowercaseQuery;
  let inferredCategory: CategoryType = currentCategory === 'all' ? 'all' : currentCategory;
  
  console.log('Original query:', `"${lowercaseQuery}"`);
  
  if (inferredCategory !== 'all') {
    console.log(`Using provided category: ${inferredCategory}`);
  } 
  else {
    if (lowercaseQuery.includes('yoga')) {
      inferredCategory = 'fitness';
      console.log('Detected yoga in query, setting category to fitness');
    } else if (lowercaseQuery.includes('restaurant')) {
      inferredCategory = 'restaurants';
      console.log('Detected restaurant in query, setting category to restaurants');
    } else if (lowercaseQuery.includes('café') || lowercaseQuery.includes('cafe') || lowercaseQuery.includes('coffee')) {
      inferredCategory = 'cafes';
      console.log('Detected café/coffee in query, setting category to cafes');
    } else {
      for (const { pattern, category } of searchPatterns) {
        if (pattern.test(lowercaseQuery)) {
          inferredCategory = category as CategoryType;
          console.log(`Matched pattern ${pattern}, setting category to ${category}`);
          break;
        }
      }
    }
  }
  
  if (inferredCategory === 'all') {
    if (lowercaseQuery.includes('salon') || lowercaseQuery.includes('haircut')) {
      inferredCategory = 'salons';
    } else if (lowercaseQuery.includes('plumber')) {
      inferredCategory = 'services';
    } else if (lowercaseQuery.includes('biryani') || 
               lowercaseQuery.includes('food') || 
               lowercaseQuery.includes('dinner') || 
               lowercaseQuery.includes('lunch') ||
               lowercaseQuery.includes('breakfast')) {
      inferredCategory = 'restaurants';
    }
  }
  
  if (
    !lowercaseQuery.includes('near') && 
    !lowercaseQuery.includes('in ') &&
    (lowercaseQuery.includes('cafe') || 
     lowercaseQuery.includes('café') ||
     lowercaseQuery.includes('restaurant') || 
     lowercaseQuery.includes('salon') || 
     lowercaseQuery.includes('plumber') ||
     lowercaseQuery.includes('yoga') ||
     lowercaseQuery.includes('biryani'))
  ) {
    processedQuery = `${processedQuery} near me`;
  }
  
  Object.entries(keywordMap).forEach(([key, synonyms]) => {
    synonyms.forEach(synonym => {
      if (lowercaseQuery.includes(synonym)) {
        processedQuery = processedQuery.replace(new RegExp(synonym, 'g'), key);
      }
    });
  });
  
  console.log(`Original query: "${lowercaseQuery}"`);
  console.log(`Processed query: "${processedQuery}"`);
  console.log(`Inferred category: ${inferredCategory}`);
  
  return { processedQuery, inferredCategory };
};
