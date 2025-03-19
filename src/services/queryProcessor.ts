
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
  
  // Clean up the query - remove extra spaces and normalize characters
  processedQuery = processedQuery.trim().replace(/\s+/g, ' ');
  
  if (inferredCategory !== 'all') {
    console.log(`Using provided category: ${inferredCategory}`);
  } 
  else {
    // Check for specific keywords that would indicate categories
    if (lowercaseQuery.includes('yoga')) {
      inferredCategory = 'fitness';
      console.log('Detected yoga in query, setting category to fitness');
    } else if (lowercaseQuery.includes('restaurant') || 
               lowercaseQuery.includes('food') || 
               lowercaseQuery.includes('cuisine') ||
               lowercaseQuery.includes('fusion') ||
               lowercaseQuery.includes('seafood')) {
      inferredCategory = 'restaurants';
      console.log('Detected restaurant/food term in query, setting category to restaurants');
    } else if (lowercaseQuery.includes('café') || 
               lowercaseQuery.includes('cafe') || 
               lowercaseQuery.includes('coffee')) {
      inferredCategory = 'cafes';
      console.log('Detected café/coffee in query, setting category to cafes');
    } else {
      // Check against patterns
      for (const { pattern, category } of searchPatterns) {
        if (pattern.test(lowercaseQuery)) {
          inferredCategory = category as CategoryType;
          console.log(`Matched pattern ${pattern}, setting category to ${category}`);
          break;
        }
      }
    }
  }
  
  // Additional category inference for terms that don't fit patterns
  if (inferredCategory === 'all') {
    if (lowercaseQuery.includes('salon') || lowercaseQuery.includes('haircut')) {
      inferredCategory = 'salons';
    } else if (lowercaseQuery.includes('plumber')) {
      inferredCategory = 'services';
    } else if (lowercaseQuery.includes('biryani') || 
               lowercaseQuery.includes('food') || 
               lowercaseQuery.includes('dinner') || 
               lowercaseQuery.includes('lunch') ||
               lowercaseQuery.includes('breakfast') ||
               lowercaseQuery.includes('spice') ||
               lowercaseQuery.includes('garden') ||
               lowercaseQuery.includes('fusion') ||
               lowercaseQuery.includes('ocean') ||
               lowercaseQuery.includes('seafood')) {
      inferredCategory = 'restaurants';
    }
  }
  
  // If the query doesn't include location context and is about a specific place type,
  // add "near me" to help with contextual searching
  if (
    !lowercaseQuery.includes('near') && 
    !lowercaseQuery.includes('in ') &&
    (lowercaseQuery.includes('cafe') || 
     lowercaseQuery.includes('café') ||
     lowercaseQuery.includes('restaurant') || 
     lowercaseQuery.includes('salon') || 
     lowercaseQuery.includes('plumber') ||
     lowercaseQuery.includes('yoga') ||
     lowercaseQuery.includes('biryani') ||
     lowercaseQuery.includes('fusion') ||
     lowercaseQuery.includes('ocean') ||
     lowercaseQuery.includes('seafood') ||
     lowercaseQuery.includes('spice') ||
     lowercaseQuery.includes('garden'))
  ) {
    processedQuery = `${processedQuery} near me`;
  }
  
  // Map synonyms to canonical terms
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
