
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

// Improved utility function to extract potential tags from a search query
export const extractTagsFromQuery = (query: string): string[] => {
  if (!query || query.trim() === '') return [];
  
  console.log("Extracting tags from query:", query);
  
  // Normalize the query - convert to lowercase and trim
  const normalizedQuery = query.toLowerCase().trim();
  
  // Split the query into individual words
  const words = normalizedQuery.split(/\s+/);
  console.log("Individual words:", words);
  
  // Create potential tags with different levels of granularity
  const potentialTags: string[] = [];
  
  // Add the full query as a potential tag
  potentialTags.push(normalizedQuery);
  
  // Add individual words as potential tags (if longer than 2 characters)
  words.forEach(word => {
    if (word.length > 2) {
      potentialTags.push(word);
    }
  });
  
  // Add potential bigrams (pairs of adjacent words)
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`.trim();
    if (bigram.length > 3) {
      potentialTags.push(bigram);
    }
  }
  
  // For queries with 3+ words, try trimming from either end
  if (words.length >= 3) {
    // Remove first word
    potentialTags.push(words.slice(1).join(' '));
    // Remove last word
    potentialTags.push(words.slice(0, -1).join(' '));
  }
  
  // Remove duplicates
  const uniqueTags = [...new Set(potentialTags)];
  
  console.log("Extracted potential tags:", uniqueTags);
  return uniqueTags;
};
