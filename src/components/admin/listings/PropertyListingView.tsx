import { Badge } from '@/components/ui/badge';

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

interface PropertyListingViewProps {
  listing: PropertyListing;
}

const PropertyListingView = ({ listing }: PropertyListingViewProps) => {
  return (
    <div className="space-y-6">
      {/* Property Information */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Property Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p className="text-sm">{listing.property_address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Web Slug</p>
            <p className="text-sm">{listing.slug || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge variant={listing.is_public ? 'default' : 'secondary'}>
              {listing.is_public ? 'Public' : 'Private'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Agent Information */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Agent Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-sm">{listing.agent_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Phone</p>
            <p className="text-sm">{listing.agent_phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm">{listing.agent_email || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Brokerage</p>
            <p className="text-sm">{listing.brokerage_name || 'Not provided'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Agent Headshot</p>
            {listing.agent_headshot_url ? (
              <img 
                src={listing.agent_headshot_url} 
                alt="Agent headshot" 
                className="w-24 h-24 rounded-lg object-cover"
              />
            ) : (
              <p className="text-sm text-muted-foreground">No headshot uploaded</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Brokerage Logo</p>
            {listing.brokerage_logo_url ? (
              <img 
                src={listing.brokerage_logo_url} 
                alt="Brokerage logo" 
                className="w-24 h-24 rounded-lg object-cover"
              />
            ) : (
              <p className="text-sm text-muted-foreground">No logo uploaded</p>
            )}
          </div>
        </div>
      </div>

      {/* Services */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Services</h3>
        <div className="flex flex-wrap gap-2">
          {listing.has_photos && <Badge variant="outline">Photos</Badge>}
          {listing.has_videos && <Badge variant="outline">Videos</Badge>}
          {listing.has_floorplans && <Badge variant="outline">Floor Plans</Badge>}
          {listing.has_matterport && <Badge variant="outline">Matterport</Badge>}
          {listing.has_aerial && <Badge variant="outline">Aerial</Badge>}
          {!listing.has_photos && !listing.has_videos && !listing.has_floorplans && !listing.has_matterport && !listing.has_aerial && (
            <p className="text-sm text-muted-foreground">No services selected</p>
          )}
        </div>
      </div>

      {/* Timestamps */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Created/Updated</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Created</p>
            <p className="text-sm">{new Date(listing.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
            <p className="text-sm">{new Date(listing.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyListingView;