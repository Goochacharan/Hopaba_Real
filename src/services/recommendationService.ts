
import { mockRecommendations } from '@/lib/mockData';
import { supabase } from '@/integrations/supabase/client';
import { Recommendation } from '@/lib/mockData';
import { Event } from '@/hooks/types/recommendationTypes';

// Define mock events since they're not exported from mockData
const mockEvents: Event[] = [
  {
    id: 'event1',
    title: 'Community Festival',
    date: '2025-06-15',
    time: '10:00 AM - 6:00 PM',
    location: 'Central Park, Indiranagar',
    description: 'Annual community festival with food stalls, games, and live performances.',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
    attendees: 120,
    isHiddenGem: true,
    isMustVisit: false
  },
  {
    id: 'event2',
    title: 'Weekend Food Fair',
    date: '2025-05-28',
    time: '11:00 AM - 9:00 PM',
    location: 'Food Street, Koramangala',
    description: 'Explore local cuisine with special stalls featuring masala puri, badam milk and other local delicacies',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
    attendees: 85,
    isHiddenGem: false,
    isMustVisit: true
  }
];

export const fetchServiceProviders = async (query: string, category: string = 'all'): Promise<Recommendation[]> => {
  try {
    // Attempt to fetch from Supabase first
    let supabaseQuery = supabase.from('service_providers')
      .select('*')
      .eq('approval_status', 'approved');
    
    // Apply category filter if not 'all'
    if (category !== 'all') {
      supabaseQuery = supabaseQuery.eq('category', category);
    }
    
    // Apply search query filters
    if (query) {
      // Create an array with all the search terms
      const searchTerms = query.toLowerCase().split(' ');
      
      // Build a complex OR filter for name, description, and tags
      let filter = '';
      
      searchTerms.forEach((term, index) => {
        if (index > 0) filter += ' & ';
        
        // Search in name, description, or tags
        filter += `(name.ilike.%${term}% | description.ilike.%${term}%)`;
      });
      
      supabaseQuery = supabaseQuery.or(filter);
    }
    
    const { data: serviceProviders, error } = await supabaseQuery;
    
    if (error || !serviceProviders || serviceProviders.length === 0) {
      // Fallback to mock data if no results from Supabase
      console.log('Falling back to mock data for service providers');
      
      // Filter mock data
      return mockRecommendations.filter(rec => {
        // If category filter is active and doesn't match, exclude
        if (category !== 'all' && rec.category !== category) {
          return false;
        }
        
        // If no search query, include all that match the category
        if (!query) return true;
        
        // Search in name, description
        const nameMatch = rec.name.toLowerCase().includes(query.toLowerCase());
        const descMatch = rec.description.toLowerCase().includes(query.toLowerCase());
        
        // Search in tags (if available)
        const tagMatch = Array.isArray(rec.tags) && 
          rec.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
        
        return nameMatch || descMatch || tagMatch;
      });
    }
    
    // Process Supabase results to match the format expected by the app
    const enhancedProviders = serviceProviders.map(provider => {
      // Add tag search score
      const tagMatch = Array.isArray(provider.tags) && 
        provider.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
      // Convert provider to Recommendation type with required fields
      // Create the address from area and city if not directly available
      const address = provider.area && provider.city 
        ? `${provider.area}, ${provider.city}` 
        : provider.area || provider.city || '';
      
      return {
        ...provider,
        id: provider.id,
        name: provider.name,
        category: provider.category,
        description: provider.description,
        image: provider.images?.[0] || 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc',
        rating: 4.5, // Default rating since service_providers doesn't have this field
        address: address, // Constructed address from available fields
        tags: provider.tags || [],
        searchScore: tagMatch ? 10 : 0
      } as Recommendation;
    });
    
    return enhancedProviders;
    
  } catch (error) {
    console.error('Error fetching service providers:', error);
    // Fall back to mock data
    return mockRecommendations.filter(rec => {
      if (category !== 'all' && rec.category !== category) {
        return false;
      }
      if (!query) return true;
      
      const nameMatch = rec.name.toLowerCase().includes(query.toLowerCase());
      const descMatch = rec.description.toLowerCase().includes(query.toLowerCase());
      const tagMatch = Array.isArray(rec.tags) && 
        rec.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
      return nameMatch || descMatch || tagMatch;
    });
  }
};

export const fetchEvents = async (query: string): Promise<Event[]> => {
  try {
    // Simulate API call or database query to fetch events
    // Replace this with your actual data fetching logic
    return mockEvents.filter(event =>
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};
