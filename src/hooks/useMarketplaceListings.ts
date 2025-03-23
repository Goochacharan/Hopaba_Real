import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  condition: string;
  location: string;
  created_at: string;
  seller_id: string;
  seller_name: string;
  seller_rating: number;
  seller_phone?: string;
  seller_whatsapp?: string;
  seller_instagram?: string;
  category?: string;
}

// Mock listings with some recently created items
const mockListings: MarketplaceListing[] = [
  {
    id: '1',
    title: 'Antique Wooden Table',
    description: 'Beautiful antique wooden table in excellent condition. Perfect for a dining room or large kitchen.',
    price: 12500,
    images: [
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80',
    ],
    condition: 'Like New',
    location: 'Indiranagar, Bangalore',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (within a week)
    seller_id: 'user123',
    seller_name: 'Ramesh K',
    seller_rating: 4.8,
    seller_phone: '+919876543210',
    seller_whatsapp: '+919876543210',
    seller_instagram: '@rameshk',
    category: 'Furniture'
  },
  {
    id: '2',
    title: 'Professional Camera Setup',
    description: 'Complete professional camera setup including Canon EOS R5, three prime lenses, and accessories.',
    price: 250000,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80',
      'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1296&q=80',
    ],
    condition: 'Excellent',
    location: 'Koramangala, Bangalore',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago (outside a week)
    seller_id: 'user456',
    seller_name: 'Priya M',
    seller_rating: 4.9,
    seller_phone: '+919876543211',
    seller_whatsapp: '+919876543211',
    category: 'Electronics'
  },
  {
    id: '3',
    title: 'Mountain Bike - Hardly Used',
    description: 'High-end mountain bike in excellent condition. Only used a few times on paved trails.',
    price: 35000,
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1103&q=80',
    ],
    condition: 'Like New',
    location: 'HSR Layout, Bangalore',
    created_at: new Date().toISOString(), // Today (within a week)
    seller_id: 'user789',
    seller_name: 'Vikram S',
    seller_rating: 4.7,
    seller_whatsapp: '+919876543212',
    seller_instagram: '@vikrams',
    category: 'Sports'
  }
];

export const useMarketplaceListings = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredListings, setFilteredListings] = useState<MarketplaceListing[]>([]);
  const { toast } = useToast();

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate fetching listings from a database or API
      // In a real application, you would replace this with an actual API call
      setTimeout(() => {
        setListings(mockListings);
        setFilteredListings(mockListings);
        setLoading(false);
      }, 500);
    } catch (err: any) {
      console.error('Error fetching marketplace listings:', err);
      setError('Failed to fetch listings. Please try again later.');
      setLoading(false);
    }
  };

  const searchListings = (query: string) => {
    const normalizedQuery = query.toLowerCase();
    const results = listings.filter(listing =>
      listing.title.toLowerCase().includes(normalizedQuery) ||
      listing.description.toLowerCase().includes(normalizedQuery) ||
      listing.location.toLowerCase().includes(normalizedQuery) ||
      listing.category?.toLowerCase().includes(normalizedQuery)
    );
    setFilteredListings(results);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return {
    listings: filteredListings,
    loading,
    error,
    searchListings,
  };
};
