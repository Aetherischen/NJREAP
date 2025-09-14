import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSEO } from '@/hooks/useSEO';
import { GetQuoteModal } from '@/components/GetQuoteModal';
import { Building, MapPin, Bed, Bath, Maximize, Calendar } from 'lucide-react';

interface PropertyListing {
  id: string;
  property_address: string;
  agent_name: string;
  agent_phone?: string;
  agent_email?: string;
  agent_headshot_url?: string;
  brokerage_name?: string;
  brokerage_logo_url?: string;
  primary_photo_url?: string;
  slug?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  year_built?: number;
  property_city?: string;
  property_state?: string;
  has_photos: boolean;
  has_videos: boolean;
  has_floorplans: boolean;
  has_matterport: boolean;
  has_aerial: boolean;
  created_at: string;
}

const Showcase = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  useSEO({
    title: "Property Showcase - Real Estate Media Portfolio | NJ REAP",
    description: "Browse our collection of professionally photographed and marketed properties. View our real estate media portfolio featuring homes across New Jersey.",
    keywords: "property showcase, real estate portfolio, NJ properties, professional photography, real estate marketing"
  });

  const { data: properties, isLoading } = useQuery({
    queryKey: ['public-properties'],
    queryFn: async () => {
      // Use safer query that excludes sensitive contact data for listing views
      const { data, error } = await supabase
        .from('property_listings')
        .select(`
          id,
          property_address,
          agent_name,
          brokerage_name,
          primary_photo_url,
          slug,
          bedrooms,
          bathrooms,
          sqft,
          year_built,
          property_city,
          property_state,
          has_photos,
          has_videos,
          has_floorplans,
          has_matterport,
          has_aerial,
          created_at
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PropertyListing[];
    }
  });

  const formatAddress = (address: string) => {
    const parts = address.split(',');
    return parts.length > 1 ? parts[0] : address;
  };

  const getDisplayImage = (property: PropertyListing) => {
    if (property.primary_photo_url) {
      return property.primary_photo_url;
    }
    return '/placeholder.svg';
  };

  const getMediaBadges = (property: PropertyListing) => {
    const badges = [];
    if (property.has_photos) badges.push('Photos');
    if (property.has_videos) badges.push('Video');
    if (property.has_matterport) badges.push('3D Tour');
    if (property.has_floorplans) badges.push('Floorplans');
    if (property.has_aerial) badges.push('Aerial');
    return badges;
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        {/* Background Image - hidden on mobile */}
        <div
          className="hidden sm:block absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/pages/bg-services.webp')`,
          }}
        ></div>
        {/* Mobile-only full gradient background */}
        <div
          className="sm:hidden absolute inset-0"
          style={{
            background: `linear-gradient(to right,
              rgba(77, 10, 151, 1.0) 0%,
              rgba(160, 68, 227, 1.0) 100%)`,
          }}
        />

        {/* Gradient Overlay - 100% opacity dropping to 0% at 75% width */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right,
              rgba(77, 10, 151, 1.0) 0%,
              rgba(160, 68, 227, 1.0) 25%,
              rgba(160, 68, 227, 0.8) 50%,
              rgba(160, 68, 227, 0.4) 65%,
              rgba(160, 68, 227, 0.1) 70%,
              transparent 75%)`,
          }}
        ></div>

        <div className="relative z-10 container mx-auto px-4 py-8 sm:py-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge
              variant="outline"
              className="text-white border-white/30 mb-2 sm:mb-4"
            >
              Property Showcase
            </Badge>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6">
              Professional Real Estate Media Portfolio
            </h1>
            <p className="text-lg sm:text-xl text-gray-100 leading-relaxed">
              Explore our collection of professionally photographed and marketed properties. 
              Each property showcases our comprehensive real estate media services.
            </p>
          </div>
        </div>
      </section>

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">

        {/* Properties Grid */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-7xl">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-64 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <div className="flex gap-2 mb-4">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => (
                  <Card key={property.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <div className="relative overflow-hidden">
                      <img
                        src={getDisplayImage(property)}
                        alt={`Property at ${property.property_address}`}
                        className="h-64 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-4 right-4 flex flex-wrap gap-1 max-w-32">
                        {getMediaBadges(property).slice(0, 3).map((badge) => (
                          <Badge key={badge} className="text-xs bg-primary text-white hover:bg-secondary hover:text-white transition-colors">
                            {badge}
                          </Badge>
                        ))}
                        {getMediaBadges(property).length > 3 && (
                          <Badge className="text-xs bg-primary text-white hover:bg-secondary hover:text-white transition-colors">
                            +{getMediaBadges(property).length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-lg leading-tight mb-1">
                            {formatAddress(property.property_address)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {property.property_city}, {property.property_state || 'NJ'}
                          </p>
                        </div>
                      </div>

                      {(property.bedrooms || property.bathrooms || property.sqft) && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          {property.bedrooms && (
                            <div className="flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              <span>{property.bedrooms}</span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center gap-1">
                              <Bath className="h-4 w-4" />
                              <span>{property.bathrooms}</span>
                            </div>
                          )}
                          {property.sqft && (
                            <div className="flex items-center gap-1">
                              <Maximize className="h-4 w-4" />
                              <span>{property.sqft.toLocaleString()} sq ft</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">{property.agent_name}</span>
                          {property.brokerage_name && (
                            <span className="block">{property.brokerage_name}</span>
                          )}
                        </div>
                        {property.year_built && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{property.year_built}</span>
                          </div>
                        )}
                      </div>

                      <Link
                        to={`/showcase/${property.slug || property.id}`}
                        className="block w-full bg-primary text-primary-foreground py-2 px-4 rounded-md text-center font-medium hover:bg-primary/90 transition-colors"
                      >
                        View Property
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Building className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-semibold mb-4">No Properties Available</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We're currently updating our showcase. Check back soon to see our latest property portfolio.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 px-4 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Showcase Your Property?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Let us create stunning media content that helps your property stand out in the market.
            </p>
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors"
            >
              Get Started Today
            </button>
          </div>
        </section>
      </main>

      <GetQuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
      />
    </Layout>
  );
};

export default Showcase;