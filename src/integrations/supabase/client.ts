
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pswgsxyxhdhhpvugkdqa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd2dzeHl4aGRoaHB2dWdrZHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMDU5MjUsImV4cCI6MjA1Nzc4MTkyNX0.IiJhneDLCqOqrDRnf6xarWnlGucKJ1qcY8Kh1WbGT6M";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});

/**
 * Helper function to get the currently logged in user
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Helper function to check if a user is authenticated
 */
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

/**
 * Helper function to get the seller name for a listing
 * If the seller_id exists, use it to lookup the user's full name
 * Otherwise, fall back to the stored seller_name
 */
export const getSellerName = async (sellerId?: string, fallbackName?: string) => {
  if (!sellerId) return fallbackName || "Anonymous Seller";
  
  try {
    // Use auth.getUser instead of trying to access the profiles table directly
    const { data, error } = await supabase.auth.getUser(sellerId);
    
    if (error || !data.user) {
      console.error("Error fetching user:", error);
      return fallbackName || "Anonymous Seller";
    }
    
    return data.user.user_metadata?.full_name || fallbackName || "Anonymous Seller";
  } catch (err) {
    console.error("Error fetching seller name:", err);
    return fallbackName || "Anonymous Seller";
  }
};

/**
 * Helper function to set a user as admin
 * This should only be used by super admins or in development
 */
export const setUserAsAdmin = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('admin_users')
      .insert({ id: userId });
      
    return { success: !error, error };
  } catch (err) {
    console.error("Error setting user as admin:", err);
    return { success: false, error: err };
  }
};
