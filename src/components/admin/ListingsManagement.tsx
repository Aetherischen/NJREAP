import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Eye, Edit, Trash2, Search, ImageIcon, BarChart3 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PropertyListingView from './listings/PropertyListingView';
import PropertyListingEdit from './listings/PropertyListingEdit';
import CreatePropertyDialog from './listings/CreatePropertyDialog';
import PropertyAnalytics from '../PropertyAnalytics';

type PropertyListing = {
  id: string;
  property_address: string;
  agent_name: string;
  agent_phone: string | null;
  agent_email: string | null;
  agent_headshot_url: string | null;
  brokerage_name: string | null;
  brokerage_logo_url: string | null;
  has_photos: boolean;
  has_videos: boolean;
  has_floorplans: boolean;
  has_matterport: boolean;
  has_aerial: boolean;
  is_public: boolean;
  slug: string | null;
  created_at: string;
  updated_at: string;
};

const ListingsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<PropertyListing | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'view' | 'edit' | 'analytics'>('list');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('=== LISTINGS MANAGEMENT STATE INITIALIZED ===');

  // Fetch property listings
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['property-listings'],
    queryFn: async () => {
      console.log('=== FETCHING PROPERTY LISTINGS ===');
      const { data, error } = await supabase
        .from('property_listings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('=== PROPERTY LISTINGS FETCH ERROR ===', error);
        throw error;
      }
      console.log('=== PROPERTY LISTINGS FETCHED ===', data);
      return data as PropertyListing[];
    },
  });

  console.log('=== LISTINGS MANAGEMENT QUERY RESULT ===', { listings, isLoading });

  // Delete property mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('property_listings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-listings'] });
      toast({
        title: "Success",
        description: "Property listing deleted successfully",
      });
      setDeleteListingId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete property listing",
        variant: "destructive",
      });
      console.error('Delete error:', error);
    },
  });

  const filteredListings = listings.filter(listing =>
    listing.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.agent_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (listing: PropertyListing) => {
    setSelectedListing(listing);
    setViewMode('view');
  };

  const handleEdit = (listing: PropertyListing) => {
    setSelectedListing(listing);
    setViewMode('edit');
  };

  const handleAnalytics = (listing: PropertyListing) => {
    setSelectedListing(listing);
    setViewMode('analytics');
  };

  const handleBackToList = () => {
    setSelectedListing(null);
    setViewMode('list');
  };

  const handleDelete = (id: string) => {
    setDeleteListingId(id);
  };

  const confirmDelete = () => {
    if (deleteListingId) {
      deleteMutation.mutate(deleteListingId);
    }
  };

  if (viewMode === 'view' && selectedListing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={handleBackToList}>
            ← Back to Listings
          </Button>
          <div>
            <h2 className="text-2xl font-semibold">View Property Listing</h2>
            <p className="text-muted-foreground">{selectedListing.property_address}</p>
          </div>
        </div>
        <PropertyListingView listing={selectedListing} />
      </div>
    );
  }

  if (viewMode === 'edit' && selectedListing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={handleBackToList}>
            ← Back to Listings
          </Button>
          <div>
            <h2 className="text-2xl font-semibold">Edit Property Listing</h2>
            <p className="text-muted-foreground">{selectedListing.property_address}</p>
          </div>
        </div>
        <PropertyListingEdit
          listing={selectedListing}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['property-listings'] });
            handleBackToList();
          }}
        />
      </div>
    );
  }

  if (viewMode === 'analytics' && selectedListing) {
    return (
      <PropertyAnalytics
        propertyId={selectedListing.id}
        propertyAddress={selectedListing.property_address}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Property Listings</CardTitle>
            <CardDescription>Manage property listings for realtor photography services</CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties or agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {listing.has_photos ? (
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-blue-600" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{listing.property_address}</h3>
                          {listing.is_public && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Public
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Agent: {listing.agent_name}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {listing.has_photos && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Photos</span>}
                          {listing.has_videos && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Videos</span>}
                          {listing.has_floorplans && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">Floorplans</span>}
                          {listing.has_matterport && <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded">Matterport</span>}
                          {listing.has_aerial && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Aerial</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(listing)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(listing)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {listing.is_public && (
                        <Button variant="outline" size="sm" onClick={() => handleAnalytics(listing)}>
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleDelete(listing.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredListings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No property listings found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Property Dialog */}
      <CreatePropertyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['property-listings'] });
          setIsCreateDialogOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteListingId} onOpenChange={() => setDeleteListingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property listing
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListingsManagement;