
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserMarketplaceListings } from '@/hooks/useUserMarketplaceListings';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Edit2, Eye, Loader2, Plus, Trash2, ArrowUpDown, Tag, MapPin, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import MarketplaceListingForm from './MarketplaceListingForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserMarketplaceListingsProps {
  onEdit?: (listing: MarketplaceListing) => void;
  refresh?: boolean;
}

const UserMarketplaceListings: React.FC<UserMarketplaceListingsProps> = ({ 
  onEdit,
  refresh 
}) => {
  const navigate = useNavigate();
  const { listings, loading, error, refetch, deleteListing } = useUserMarketplaceListings();
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [listingToEdit, setListingToEdit] = useState<MarketplaceListing | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortBy, setSortBy] = useState<'newest' | 'price-high' | 'price-low'>('newest');
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  // Format price to Indian Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleDeleteConfirm = async () => {
    if (listingToDelete) {
      await deleteListing(listingToDelete);
      setListingToDelete(null);
    }
  };

  const handleEdit = (listing: MarketplaceListing) => {
    if (onEdit) {
      onEdit(listing);
    } else {
      setListingToEdit(listing);
      setShowAddForm(true);
    }
  };

  const handleListingSaved = () => {
    setShowAddForm(false);
    setListingToEdit(null);
    refetch();
  };

  const filteredListings = listings
    .filter(listing => categoryFilter === 'all' || listing.category === categoryFilter)
    .filter(listing => conditionFilter === 'all' || listing.condition === conditionFilter)
    .filter(listing => locationFilter === 'all' || listing.location === locationFilter)
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'price-high') {
        return b.price - a.price;
      } else {
        return a.price - b.price;
      }
    });

  // Extract unique values for filter options
  const categories = ['all', ...new Set(listings.map(listing => listing.category))];
  const conditions = ['all', ...new Set(listings.map(listing => listing.condition))];
  const locations = ['all', ...new Set(listings.map(listing => listing.location))];

  const userCanAddMore = listings.length < 10;

  if (showAddForm) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {listingToEdit ? 'Edit Listing' : 'Add New Listing'}
          </h3>
          <Button variant="outline" size="sm" onClick={() => {
            setShowAddForm(false);
            setListingToEdit(null);
          }}>
            Back to Listings
          </Button>
        </div>
        <MarketplaceListingForm 
          listing={listingToEdit || undefined} 
          onSaved={handleListingSaved} 
          onCancel={() => {
            setShowAddForm(false);
            setListingToEdit(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Your Marketplace Listings</h3>
          <p className="text-muted-foreground text-sm">
            {listings.length} of 10 listings used
          </p>
        </div>
        {userCanAddMore && (
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="flex items-center gap-1.5 shadow-[0_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[3px] transition-all"
          >
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && listings.length > 0 && (
        <div className="space-y-4">
          {/* Sort Tab - Stacked vertically */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-3 border-b">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Sort By</h4>
              </div>
            </div>
            <div className="p-2">
              <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'price-high' | 'price-low')}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="newest" className="text-xs">Newest</TabsTrigger>
                  <TabsTrigger value="price-high" className="text-xs">Price: High to Low</TabsTrigger>
                  <TabsTrigger value="price-low" className="text-xs">Price: Low to High</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Category Tab - Stacked vertically */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-3 border-b">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Category</h4>
              </div>
            </div>
            <div className="p-2">
              <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
                <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)` }}>
                  {categories.map(category => (
                    <TabsTrigger key={category} value={category} className="text-xs capitalize">
                      {category === 'all' ? 'All' : category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Condition Tab - Stacked vertically */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-3 border-b">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Condition</h4>
              </div>
            </div>
            <div className="p-2">
              <Tabs value={conditionFilter} onValueChange={setConditionFilter}>
                <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${Math.min(conditions.length, 4)}, 1fr)` }}>
                  {conditions.map(condition => (
                    <TabsTrigger key={condition} value={condition} className="text-xs capitalize">
                      {condition === 'all' ? 'All' : condition}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Location Tab - Stacked vertically */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-3 border-b">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Location</h4>
              </div>
            </div>
            <div className="p-2">
              <Tabs value={locationFilter} onValueChange={setLocationFilter}>
                <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${Math.min(locations.length, 3)}, 1fr)` }}>
                  {locations.map(location => (
                    <TabsTrigger key={location} value={location} className="text-xs capitalize">
                      {location === 'all' ? 'All' : location}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              {listing.images && listing.images.length > 0 && (
                <div className="w-full h-48 overflow-hidden">
                  <img 
                    src={listing.images[0]} 
                    alt={listing.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <Badge variant="outline" className="mb-2">
                    {listing.category.charAt(0).toUpperCase() + listing.category.slice(1)}
                  </Badge>
                  <Badge variant="secondary">
                    {listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                <CardDescription className="text-lg font-semibold text-primary">
                  {formatPrice(listing.price)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {listing.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/marketplace/${listing.id}`)}
                  className="shadow-[0_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[3px] transition-all"
                >
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(listing)}
                    className="shadow-[0_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[3px] transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setListingToDelete(listing.id)}
                        className="shadow-[0_4px_0px_0px_rgba(239,68,68,0.4)] hover:shadow-[0_2px_0px_0px_rgba(239,68,68,0.4)] active:shadow-none active:translate-y-[3px] transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this listing? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
          <h3 className="text-lg font-medium mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first marketplace listing to start selling.
          </p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="shadow-[0_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[3px] transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Listing
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserMarketplaceListings;
