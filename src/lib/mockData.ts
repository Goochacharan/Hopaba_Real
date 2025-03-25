
export interface Recommendation {
  id: string;
  name: string;
  image: string;
  images?: string[];
  category: string;
  description: string;
  address: string;
  rating: number;
  price?: string;
  priceLevel?: string;
  price_level?: string; // Adding this for backward compatibility
  price_range_min?: number;
  price_range_max?: number;
  price_unit?: string;
  phone?: string;
  website?: string;
  openNow?: boolean;
  hours?: string;
  availability?: string;
  distance?: string;
  tags: string[];
  city?: string;
  instagram?: string;
  created_at?: string;
  reviewCount?: number;
  map_link?: string;
  area?: string;
}

// Mock recommendations data
export const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    name: 'Chic Cuts & Styles',
    category: 'Salons',
    tags: ['Unisex', 'Trendy', 'Walk-ins'],
    rating: 4.8,
    address: '123 Style Avenue, Indiranagar, Bangalore',
    distance: '0.5 miles away',
    phone: '+919876543210',
    image: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=1932&auto=format&fit=crop',
    description: 'Modern unisex salon offering premium haircuts, styling, and coloring services in a relaxed atmosphere.',
    openNow: true,
    hours: 'Until 8:00 PM',
    priceLevel: '$$',
    instagram: '@chiccuts'
  },
  {
    id: '2',
    name: 'Harmony Hair Studio',
    category: 'Salons',
    tags: ['Unisex', 'Organic', 'Appointment'],
    rating: 4.6,
    address: '456 Beauty Lane, San Francisco',
    distance: '0.8 miles away',
    phone: '+919876543211',
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=1972&auto=format&fit=crop',
    description: 'Eco-friendly salon focusing on sustainable beauty practices and personalized haircare treatments.',
    openNow: true,
    hours: 'Until 7:00 PM',
    priceLevel: '$$$',
    instagram: 'harmonyhair'
  },
  {
    id: '3',
    name: 'Urban Mane',
    category: 'Salons',
    tags: ['Unisex', 'Boutique', 'Trending'],
    rating: 4.5,
    address: '789 Fashion Street, San Francisco',
    distance: '1.2 miles away',
    phone: '+919876543212',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1969&auto=format&fit=crop',
    description: 'Boutique salon specializing in contemporary cuts and styles for all genders in an upscale environment.',
    openNow: false,
    hours: 'Opens tomorrow at 9:00 AM',
    priceLevel: '$$',
    instagram: '@urbanmane'
  },
  {
    id: '4',
    name: 'Craft Coffee House',
    category: 'Cafes',
    tags: ['Specialty Coffee', 'Pastries', 'Wifi'],
    rating: 4.7,
    address: '321 Brew Street, San Francisco',
    distance: '0.3 miles away',
    phone: '+919876543213',
    image: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=2070&auto=format&fit=crop',
    description: 'Artisanal coffee shop serving single-origin espresso drinks and house-made pastries in a cozy atmosphere.',
    openNow: true,
    hours: 'Until 6:00 PM',
    priceLevel: '$$',
    instagram: 'craftcoffee'
  },
  {
    id: '5',
    name: 'Fusion Restaurant',
    category: 'Restaurants',
    tags: ['Asian Fusion', 'Dinner', 'Cocktails'],
    rating: 4.4,
    address: '567 Flavor Road, San Francisco',
    distance: '1.5 miles away',
    phone: '+919876543214',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1174&q=80',
    description: 'Creative restaurant blending Asian and Western flavors with an extensive craft cocktail menu.',
    openNow: true,
    hours: 'Until 10:00 PM',
    priceLevel: '$$$'
  },
  {
    id: '6',
    name: 'Elite Barber Shop',
    category: 'Salons',
    tags: ['Men', 'Traditional', 'Premium'],
    rating: 4.9,
    address: '890 Classic Avenue, San Francisco',
    distance: '2.0 miles away',
    phone: '+919876543215',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    description: 'Traditional barbershop offering classic men\'s cuts, hot towel shaves, and grooming services.',
    openNow: false,
    hours: 'Opens tomorrow at 10:00 AM',
    priceLevel: '$$'
  },
  {
    id: '7',
    name: 'Wellness Spa & Salon',
    category: 'Health',
    tags: ['Unisex', 'Spa', 'Haircare'],
    rating: 4.7,
    address: '654 Relaxation Road, San Francisco',
    distance: '1.7 miles away',
    phone: '+919876543216',
    image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    description: 'Comprehensive wellness center combining salon services with spa treatments for a complete self-care experience.',
    openNow: true,
    hours: 'Until 9:00 PM',
    priceLevel: '$$$'
  },
  {
    id: '8',
    name: 'Melodious Flute Academy',
    category: 'Music',
    tags: ['Flute', 'Beginner-Friendly', 'Classical'],
    rating: 4.9,
    address: '123 Music Lane, Nagarbhavi, Bangalore',
    distance: '0.3 miles away',
    phone: '+919876543217',
    image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    description: 'Premier flute learning center with highly qualified teachers offering personalized lessons for all age groups and skill levels.',
    openNow: true,
    hours: 'Until 8:00 PM',
    priceLevel: '$$'
  },
  {
    id: '9',
    name: 'Nagarbhavi Music School',
    category: 'Music',
    tags: ['Flute', 'All Instruments', 'Workshops'],
    rating: 4.7,
    address: '456 Harmony Road, Nagarbhavi, Bangalore',
    distance: '0.7 miles away',
    phone: '+919876543218',
    image: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    description: 'Comprehensive music school offering flute lessons along with various other instruments. Regular workshops and recitals for students.',
    openNow: true,
    hours: 'Until 7:30 PM',
    priceLevel: '$$'
  },
  {
    id: '10',
    name: 'Classical Flute Guru',
    category: 'Music',
    tags: ['Flute', 'Carnatic', 'Private Lessons'],
    rating: 4.8,
    address: '789 Raaga Street, Nagarbhavi, Bangalore',
    distance: '1.2 miles away',
    phone: '+919876543219',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1167&q=80',
    description: 'Specialized in Carnatic flute teaching with an experienced guru who has performed internationally. One-on-one personalized lessons.',
    openNow: false,
    hours: 'Opens tomorrow at 9:00 AM',
    priceLevel: '$$$'
  },
  {
    id: '11',
    name: 'Spice Garden Restaurant',
    category: 'Restaurants',
    tags: ['Indian', 'Vegetarian', 'Buffet'],
    rating: 4.6,
    address: '123 Culinary Avenue, Koramangala, Bangalore',
    distance: '0.4 miles away',
    phone: '+919876543220',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    description: 'Authentic Indian restaurant with a wide variety of vegetarian and non-vegetarian dishes served in a warm, welcoming atmosphere.',
    openNow: true,
    hours: 'Until 11:00 PM',
    priceLevel: '$$',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      'https://images.unsplash.com/photo-1542528180-a1208c5169a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1277&q=80'
    ]
  },
  {
    id: '12',
    name: 'Ocean Blue Seafood',
    category: 'Restaurants',
    tags: ['Seafood', 'Fine Dining', 'Cocktails'],
    rating: 4.8,
    address: '456 Harbor Drive, Indiranagar, Bangalore',
    distance: '0.9 miles away',
    phone: '+919876543221',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    description: 'Premium seafood restaurant featuring fresh catch of the day, expertly prepared with global flavors and accompanied by signature cocktails.',
    openNow: true,
    hours: 'Until 10:30 PM',
    priceLevel: '$$$',
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80'
    ]
  }
];

// Function to filter recommendations based on search query
export const searchRecommendations = (
  query: string, 
  category: string = 'all'
): Recommendation[] => {
  // If no query, return all recommendations or filter by category
  if (!query) {
    return category === 'all' 
      ? mockRecommendations 
      : mockRecommendations.filter(item => 
          item.category.toLowerCase() === category.toLowerCase());
  }
  
  const lowercaseQuery = query.toLowerCase();
  
  // Handle spelling variations - "salon" vs "saloon"
  const normalizedQuery = lowercaseQuery
    .replace('saloon', 'salon')
    .replace('salon', 'salon'); // This ensures both "salon" and "saloon" are normalized
  
  // Check for location mentions
  const locationTerms = ['indiranagar', 'koramangala', 'jayanagar', 'whitefield', 'richmond', 'nagarbhavi'];
  let hasLocationTerm = false;
  let matchedLocation = '';
  
  // Check if the query contains any location terms
  for (const location of locationTerms) {
    if (lowercaseQuery.includes(location)) {
      hasLocationTerm = true;
      matchedLocation = location;
      break;
    }
  }
  
  // Handle "near me" queries
  const isNearMeQuery = lowercaseQuery.includes('near me');
  
  // For debugging
  console.log('Search query:', query);
  console.log('Normalized query:', normalizedQuery);
  console.log('Has location term:', hasLocationTerm, 'Location:', matchedLocation);
  console.log('Is near me query:', isNearMeQuery);
  
  // Special handling for specific query types
  
  // If this is a specific restaurant query
  if (normalizedQuery.includes('restaurant')) {
    // Only return restaurants
    return mockRecommendations.filter(item => 
      item.category === 'Restaurants' || 
      item.name.toLowerCase().includes('restaurant') ||
      item.description.toLowerCase().includes('restaurant')
    );
  }
  
  // If this is a unisex salon/saloon query
  if (normalizedQuery.includes('salon') || normalizedQuery.includes('saloon')) {
    
    let filteredResults = mockRecommendations.filter(item => 
      (item.category === 'Salons' || category === 'all' || item.category.toLowerCase() === category.toLowerCase()) && 
      (item.tags.some(tag => tag.toLowerCase() === 'unisex') || !normalizedQuery.includes('unisex'))
    );
    
    // If there's a location mentioned, further filter by it
    if (hasLocationTerm) {
      filteredResults = filteredResults.filter(item => 
        item.address.toLowerCase().includes(matchedLocation)
      );
      
      // If no results with exact location match, return salons with the matching location injected
      if (filteredResults.length === 0) {
        const salonResults = mockRecommendations.filter(item => item.category === 'Salons');
        // For the first few results, artificially inject the location
        return salonResults.slice(0, 3).map(salon => ({
          ...salon,
          address: salon.address.replace(/San Francisco|Bangalore/, `${matchedLocation.charAt(0).toUpperCase() + matchedLocation.slice(1)}, Bangalore`)
        }));
      }
    }
    
    return filteredResults.length ? filteredResults : mockRecommendations.filter(item => item.category === 'Salons');
  }

  // Handle cafe queries
  if (normalizedQuery.includes('cafe') || normalizedQuery.includes('coffee')) {
    const cafeResults = mockRecommendations.filter(item => 
      item.category === 'Cafes' || item.name.toLowerCase().includes('coffee') || 
      item.description.toLowerCase().includes('coffee') || item.description.toLowerCase().includes('cafe')
    );
    
    return cafeResults.length ? cafeResults : mockRecommendations.filter(item => item.category === 'Cafes');
  }

  // Handle plumber queries
  if (normalizedQuery.includes('plumber') || normalizedQuery.includes('plumbing')) {
    // Since we don't have real plumber data, create some based on salons
    const baseItems = mockRecommendations.filter(item => item.category === 'Salons').slice(0, 3);
    return baseItems.map(item => ({
      ...item,
      id: `plumber-${item.id}`,
      name: item.name.replace('Salon', 'Plumbing').replace('Cuts', 'Pipes').replace('Hair', 'Pipe'),
      category: 'Services',
      tags: ['Plumber', 'Emergency Service', '24/7'],
      description: `Professional plumbing services including repairs, installations, and emergency fixes.${hasLocationTerm ? ` Available in ${matchedLocation}.` : ''}`,
      address: hasLocationTerm ? item.address.replace(/San Francisco|Bangalore/, `${matchedLocation.charAt(0).toUpperCase() + matchedLocation.slice(1)}, Bangalore`) : item.address
    }));
  }

  // Handle biryani queries
  if (normalizedQuery.includes('biryani')) {
    // Create restaurant listings focused on biryani
    const baseItems = mockRecommendations.filter(item => item.category === 'Restaurants' || item.category === 'Cafes').slice(0, 4);
    return baseItems.map(item => ({
      ...item,
      id: `biryani-${item.id}`,
      name: `${['Royal', 'Paradise', 'Spicy', 'Authentic'][parseInt(item.id) % 4]} Biryani House`,
      category: 'Restaurants',
      tags: ['Biryani', 'Indian', 'Takeout'],
      description: `Famous for authentic biryani varieties including chicken, mutton, and vegetable options.${hasLocationTerm ? ` Located in ${matchedLocation}.` : ''}`,
      address: hasLocationTerm ? item.address.replace(/San Francisco|Bangalore/, `${matchedLocation.charAt(0).toUpperCase() + matchedLocation.slice(1)}, Bangalore`) : item.address
    }));
  }

  // Handle flute teacher searches
  if (normalizedQuery.includes('flute') || 
      (normalizedQuery.includes('music') && normalizedQuery.includes('teacher'))) {
    const filteredResults = mockRecommendations.filter(item => 
      (item.category === 'Music' || category === 'all') &&
      (item.tags.some(tag => tag.toLowerCase() === 'flute') || 
       item.description.toLowerCase().includes('flute'))
    );
    
    // If there's a location mentioned, further filter by location
    if (hasLocationTerm) {
      return filteredResults.filter(item => 
        item.address.toLowerCase().includes(matchedLocation)
      );
    }
    
    return filteredResults;
  }

  // General search
  let filtered = mockRecommendations;
  
  // Apply category filter if not 'all'
  if (category !== 'all') {
    const categoryName = category === 'salons' ? 'Salons' 
                       : category === 'cafes' ? 'Cafes' 
                       : category === 'restaurants' ? 'Restaurants'
                       : category === 'health' ? 'Health'
                       : category === 'music' ? 'Music'
                       : category === 'services' ? 'Services'
                       : category;
    
    filtered = filtered.filter(item => 
      item.category.toLowerCase() === categoryName.toLowerCase()
    );
  }

  // Add special handling for restaurant-related queries
  if (lowercaseQuery.includes('food') || 
      lowercaseQuery.includes('eat') || 
      lowercaseQuery.includes('dining') || 
      lowercaseQuery.includes('dinner') ||
      lowercaseQuery.includes('lunch') ||
      lowercaseQuery.includes('breakfast')) {
    filtered = mockRecommendations.filter(item => item.category === 'Restaurants');
    if (filtered.length === 0) {
      // No restaurant results, create mock restaurants
      const baseItems = mockRecommendations.slice(0, 3);
      return baseItems.map(item => ({
        ...item,
        id: `restaurant-${item.id}`,
        name: `${['Tasty', 'Delicious', 'Gourmet', 'Fine'][parseInt(item.id) % 4]} Dining`,
        category: 'Restaurants',
        tags: ['Dinner', 'Lunch', 'Family-Friendly'],
        description: `Quality restaurant offering a variety of dishes in a pleasant atmosphere.`,
        address: item.address
      }));
    }
    return filtered;
  }
  
  // Apply query filter with more flexible matching
  if (query) {
    // For each item, calculate a score based on how well it matches the query
    const scoredItems = filtered.map(item => {
      let score = 0;
      
      // Check name match
      if (item.name.toLowerCase().includes(normalizedQuery)) score += 5;
      
      // Check description match
      if (item.description.toLowerCase().includes(normalizedQuery)) score += 3;
      
      // Check address match for location queries
      if (hasLocationTerm && item.address.toLowerCase().includes(matchedLocation)) score += 10;
      
      // "Near me" is a special case - give points to all items since we're simulating location
      if (isNearMeQuery) score += 3;
      
      // Check tag matches
      const matchingTags = item.tags.filter(tag => 
        normalizedQuery.includes(tag.toLowerCase()) || tag.toLowerCase().includes(normalizedQuery)
      );
      score += matchingTags.length * 2;
      
      // Check category match
      if (item.category.toLowerCase().includes(normalizedQuery)) score += 4;
      
      // Handle fuzzy matches - even if the exact term isn't found, we can still return
      // results based on partial matches and category relevance
      const queryWords = normalizedQuery.split(' ');
      for (const word of queryWords) {
        if (word.length > 2) { // Only consider substantive words, reduced from 3 to 2
          if (item.name.toLowerCase().includes(word)) score += 2;
          if (item.description.toLowerCase().includes(word)) score += 1;
          if (item.tags.some(tag => tag.toLowerCase().includes(word))) score += 1;
        }
      }
      
      return { item, score };
    });
    
    // Filter items with positive scores and sort by score
    const filteredScored = scoredItems.filter(({ score }) => score > 0);
    filteredScored.sort((a, b) => b.score - a.score);
    
    // Extract just the items
    filtered = filteredScored.map(({ item }) => item);
  }
  
  // If we got no results but this is a "near me" query, make sure we return something
  if (filtered.length === 0 && isNearMeQuery) {
    // Try to figure out what category they're looking for
    let inferredCategory = '';
    
    if (normalizedQuery.includes('cafe') || normalizedQuery.includes('coffee')) {
      inferredCategory = 'Cafes';
    } else if (normalizedQuery.includes('salon') || normalizedQuery.includes('haircut')) {
      inferredCategory = 'Salons';
    } else if (normalizedQuery.includes('restaurant') || normalizedQuery.includes('food') || normalizedQuery.includes('biryani')) {
      inferredCategory = 'Restaurants';
    }
    
    if (inferredCategory) {
      return mockRecommendations
        .filter(item => item.category === inferredCategory)
        .slice(0, 3);
    }
    
    // If we couldn't infer a category, return a mix of results
    return mockRecommendations.slice(0, 3);
  }
  
  // If location term was included but no results matched, return a subset as if they were in that location
  if (hasLocationTerm && filtered.length === 0) {
    const categoryFiltered = mockRecommendations.filter(item => 
      category === 'all' || 
      item.category.toLowerCase() === category.toLowerCase()
    );
    
    // Return the first few items with modified addresses to include the location
    return categoryFiltered.slice(0, 3).map(item => ({
      ...item,
      address: item.address.replace(/San Francisco|Bangalore/, `${matchedLocation.charAt(0).toUpperCase() + matchedLocation.slice(1)}, Bangalore`)
    }));
  }
  
  return filtered;
};

// Add a new function to get a recommendation by ID
export const getRecommendationById = (id: string): Recommendation | undefined => {
  return mockRecommendations.find(rec => rec.id === id);
};
