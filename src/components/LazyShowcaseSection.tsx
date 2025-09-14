import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Camera, Video, Layout, Plane } from "lucide-react";
import { Link } from "react-router-dom";

interface PropertyListing {
  id: string;
  property_address: string;
  agent_name: string;
  primary_photo_url: string | null;
  photos_urls: string[];
  has_photos: boolean;
  has_videos: boolean;
  has_floorplans: boolean;
  has_matterport: boolean;
  has_aerial: boolean;
  slug: string;
}

const LazyShowcaseSection = () => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["public-property-listings-homepage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_listings")
        .select(`
          id,
          property_address,
          agent_name,
          primary_photo_url,
          photos_urls,
          has_photos,
          has_videos,
          has_floorplans,
          has_matterport,
          has_aerial,
          slug
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as PropertyListing[];
    },
  });

  const getDisplayImage = (property: PropertyListing): string => {
    // Try primary_photo_url first, then fallback to photos_urls array
    if (property.primary_photo_url) {
      return property.primary_photo_url;
    }
    if (property.photos_urls && property.photos_urls.length > 0) {
      return property.photos_urls[0];
    }
    return "/placeholder.svg";
  };

  const getMediaBadges = (property: PropertyListing): string[] => {
    const badges: string[] = [];
    if (property.has_photos) badges.push("Photos");
    if (property.has_videos) badges.push("Video");
    if (property.has_floorplans) badges.push("Floor Plans");
    if (property.has_matterport) badges.push("Virtual Tour");
    if (property.has_aerial) badges.push("Aerial");
    return badges;
  };

  const formatAddress = (address: string): string => {
    return address.split(",")[0] || address;
  };

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-6">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="text-[#4d0a97] border-[#4d0a97]/30 mb-4">
            Featured Work
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Recent Property Showcase
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our latest professional photography and media work showcasing 
            properties across New Jersey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {properties.map((property) => (
            <Card 
              key={property.id} 
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100 hover:border-[#4d0a97]/20"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={getDisplayImage(property)}
                  alt={`Property at ${formatAddress(property.property_address)}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center text-white mb-2">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {formatAddress(property.property_address)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getMediaBadges(property).slice(0, 3).map((badge, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Agent</p>
                    <p className="font-semibold text-gray-900">{property.agent_name}</p>
                  </div>
                  
                  <Link 
                    to={`/showcase/${property.slug || property.id}`}
                    className="block"
                  >
                    <Button className="w-full bg-[#4d0a97] hover:bg-[#a044e3] transition-colors">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/showcase">
            <Button 
              variant="outline" 
              size="lg"
              className="border-[#4d0a97] text-[#4d0a97] hover:bg-[#4d0a97] hover:text-white"
            >
              View All Showcase Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LazyShowcaseSection;