export interface Recommendation {
  id: string;
  name: string;
  category: string;
  tags: string[];
  rating: number;
  address: string;
  distance: string;
  image: string;
  description: string;
  openNow?: boolean;
  hours?: string;
  priceLevel?: string;
}

// Mock recommendations data
export const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    name: 'Chic Cuts & Styles',
    category: 'Salons',
    tags: ['Unisex', 'Trendy', 'Walk-ins'],
    rating: 4.8,
    address: '123 Style Avenue, San Francisco',
    distance: '0.5 miles away',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    description: 'Modern unisex salon offering premium haircuts, styling, and coloring services in a relaxed atmosphere.',
    openNow: true,
    hours: 'Until 8:00 PM',
    priceLevel: '$$'
  },
  {
    id: '2',
    name: 'Harmony Hair Studio',
    category: 'Salons',
    tags: ['Unisex', 'Organic', 'Appointment'],
    rating: 4.6,
    address: '456 Beauty Lane, San Francisco',
    distance: '0.8 miles away',
    image: 'https://images.unsplash.com/photo-1470259078422-826894b933aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1174&q=80',
    description: 'Eco-friendly salon focusing on sustainable beauty practices and personalized haircare treatments.',
    openNow: true,
    hours: 'Until 7:00 PM',
    priceLevel: '$$$'
  },
  {
    id: '3',
    name: 'Urban Mane',
    category: 'Salons',
    tags: ['Unisex', 'Boutique', 'Trending'],
    rating: 4.5,
    address: '789 Fashion Street, San Francisco',
    distance: '1.2 miles away',
    image: 'https://images.unsplash.com/photo-1532710093739-9470acff878f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    description: 'Boutique salon specializing in contemporary cuts and styles for all genders in an upscale environment.',
    openNow: false,
    hours: 'Opens tomorrow at 9:00 AM',
    priceLevel: '$$'
  },
  {
    id: '4',
    name: 'Craft Coffee House',
    category: 'Cafes',
    tags: ['Specialty Coffee', 'Pastries', 'Wifi'],
    rating: 4.7,
    address: '321 Brew Street, San Francisco',
    distance: '0.3 miles away',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1178&q=80',
    description: 'Artisanal coffee shop serving single-origin espresso drinks and house-made pastries in a cozy atmosphere.',
    openNow: true,
    hours: 'Until 6:00 PM',
    priceLevel: '$$'
  },
  {
    id: '5',
    name: 'Fusion Restaurant',
    category: 'Restaurants',
    tags: ['Asian Fusion', 'Dinner', 'Cocktails'],
    rating: 4.4,
    address: '567 Flavor Road, San Francisco',
    distance: '1.5 miles away',
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
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1167&q=80',
    description: 'Specialized in Carnatic flute teaching with an experienced guru who has performed internationally. One-on-one personalized lessons.',
    openNow: false,
    hours: 'Opens tomorrow at 9:00 AM',
    priceLevel: '$$$'
  },
];

// Function to filter recommendations based on search query
export const searchRecommendations = (
  query: string, 
  category: string = 'all'
): Recommendation[] => {
  const lowercaseQuery = query.toLowerCase();
  
  // Handle spelling variations - "salon" vs "saloon"
  const normalizedQuery = lowercaseQuery
    .replace('saloon', 'salon')
    .replace('salon', 'salon'); // This line ensures both "salon" and "saloon" are normalized
  
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
  
  // If this is a unisex salon query
  if ((normalizedQuery.includes('unisex') && normalizedQuery.includes('salon')) || 
      (normalizedQuery.includes('salon') && !normalizedQuery.includes('unisex'))) {
    const filteredResults = mockRecommendations.filter(item => 
      (item.category === 'Salons' || category === 'all' || item.category.toLowerCase() === category.toLowerCase()) && 
      (item.tags.some(tag => tag.toLowerCase() === 'unisex') || !normalizedQuery.includes('unisex'))
    );
    
    // If there's a location mentioned, filter by it (simulated)
    if (hasLocationTerm) {
      return filteredResults.length ? filteredResults.slice(0, 2) : mockRecommendations.filter(item => item.category === 'Salons');
    }
    
    return filteredResults.length ? filteredResults : mockRecommendations.filter(item => item.category === 'Salons');
  }

  // Handle flute teacher searches
  if (normalizedQuery.includes('flute') || normalizedQuery.includes('music') || normalizedQuery.includes('teacher')) {
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
                       : category;
    
    filtered = filtered.filter(item => 
      item.category.toLowerCase() === categoryName.toLowerCase()
    );
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
        if (word.length > 3) { // Only consider substantive words
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
  
  // If location term was included but no results matched, return a subset as if they were in that location
  if (hasLocationTerm && filtered.length === 0) {
    const categoryFiltered = mockRecommendations.filter(item => 
      category === 'all' || 
      item.category.toLowerCase() === category.toLowerCase()
    );
    
    // Return the first few items as if they matched the location
    return categoryFiltered.slice(0, 3);
  }
  
  return filtered;
};
