
-- Create a function to join business data with reviews
CREATE OR REPLACE FUNCTION public.search_business_with_reviews()
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  description TEXT,
  address TEXT,
  area TEXT,
  city TEXT,
  rating NUMERIC,
  reviews JSONB,
  tags TEXT[],
  source TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  -- First collect data from service_providers
  RETURN QUERY
  SELECT 
    sp.id,
    sp.name,
    sp.category,
    sp.description,
    sp.address,
    sp.area,
    sp.city,
    0::NUMERIC as rating, -- Default rating for service providers
    '[]'::JSONB as reviews,
    sp.tags,
    'service_providers'::TEXT as source
  FROM 
    service_providers sp
  WHERE 
    sp.approval_status = 'approved'
  
  UNION ALL
  
  -- Then collect data from recommendations with their ratings
  SELECT 
    r.id,
    r.name,
    r.category,
    r.description,
    r.address,
    r.city as area, -- Using city as area for recommendations
    r.city,
    COALESCE(r.rating, 0) as rating,
    '[]'::JSONB as reviews, -- No direct reviews for recommendations in this model
    r.tags,
    'recommendations'::TEXT as source
  FROM 
    recommendations r;
  
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.search_business_with_reviews() TO anon, authenticated, service_role;
