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
    // Extract words and phrases from the query
    const words = processedQuery.split(/\s+/);
    console.log('Extracted words:', words);
    
    // Check for category keywords
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
    
    console.log(`Inferred category: ${inferredCategory}`);
  }
  
  // We are keeping the original query to ensure all words are included in the search
  return { processedQuery, inferredCategory };
};

/**
 * Utility function to check if a string contains a word or phrase
 */
export const containsWordOrPhrase = (text: string, wordOrPhrase: string): boolean => {
  if (!text || !wordOrPhrase) return false;
  
  const normalizedText = text.toLowerCase();
  const normalizedWord = wordOrPhrase.toLowerCase();
  
  // Check for exact match first
  if (normalizedText.includes(normalizedWord)) {
    return true;
  }
  
  // If it's a multi-word phrase, check for each word separately
  if (normalizedWord.includes(' ')) {
    const words = normalizedWord.split(/\s+/);
    return words.every(word => normalizedText.includes(word));
  }
  
  return false;
};

/**
 * Extract tags from query
 */
export const extractTagsFromQuery = (query: string): string[] => {
  if (!query) return [];
  
  const words = query.toLowerCase().split(/\s+/);
  console.log('Extracting tags from words:', words);
  
  // Extract potential multi-word tags (2-3 word combinations)
  const potentialTags: string[] = [];
  
  // Add single words
  words.forEach(word => {
    if (word.length > 2) {
      potentialTags.push(word);
    }
  });
  
  // Add 2-word combinations
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i].length > 2 || words[i+1].length > 2) {
      potentialTags.push(`${words[i]} ${words[i+1]}`);
    }
  }
  
  // Add 3-word combinations
  for (let i = 0; i < words.length - 2; i++) {
    potentialTags.push(`${words[i]} ${words[i+1]} ${words[i+2]}`);
  }
  
  console.log('Extracted potential tags:', potentialTags);
  return potentialTags;
};
