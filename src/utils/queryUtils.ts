// Function to process natural language queries and extract intent
// This helps with understanding what the user is looking for

export const processNaturalLanguageQuery = (query: string, currentCategory: string) => {
  let processedQuery = query.trim();
  let inferredCategory = currentCategory;
  
  // Check for specific food items that might be in tags
  const foodItems = [
    { term: 'masala puri', category: 'bakery & chats' },
    { term: 'badam milk', category: 'bakery & chats' },
    { term: 'sweets', category: 'bakery & chats' },
    { term: 'ice cream', category: 'ice cream shop' },
  ];
  
  // Check if the query contains any of the food items
  for (const item of foodItems) {
    if (query.toLowerCase().includes(item.term.toLowerCase())) {
      inferredCategory = item.category;
      // Don't modify the query - we want to search the item in tags
      break;
    }
  }
  
  // Remove location queries but keep food item names for tag matching
  const locationKeywords = ['near', 'around', 'nearby', 'close to', 'vicinity', 'in'];
  const queryParts = processedQuery.split(' ');
  
  for (let i = 0; i < queryParts.length; i++) {
    const word = queryParts[i].toLowerCase();
    if (locationKeywords.includes(word)) {
      // Remove the location keyword and the following word (location name)
      queryParts.splice(i, 2);
      i--; // Adjust the index since we removed elements
    }
  }
  
  processedQuery = queryParts.join(' ').trim();
  
  return {
    processedQuery,
    inferredCategory
  };
};
