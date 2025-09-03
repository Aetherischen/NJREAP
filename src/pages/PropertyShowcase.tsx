import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { User, Building, Phone, Mail, MapPin, Play, FileText, Maximize, Camera, FileImage, Download, Eye, Facebook, Instagram, Twitter, Linkedin, Youtube, Home, Calendar, DollarSign, X, ChevronLeft, ChevronRight, ChevronDown, Bed, Bath, Square, MousePointer2 } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import PDFPreviewModal from '@/components/PDFPreviewModal';
import ShowcaseFooter from '@/components/ShowcaseFooter';

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
  photos_urls?: string[];
  video_urls?: string[];
  floorplan_urls?: string[];
  floorplan_image_urls?: string[];
  floorplan_pdf_urls?: string[];
  matterport_urls?: string[];
  aerial_urls?: string[];
  agent_facebook?: string | null;
  agent_instagram?: string | null;
  agent_x?: string | null;
  agent_linkedin?: string | null;
  agent_youtube?: string | null;
  agent_pinterest?: string | null;
  property_city?: string | null;
  property_state?: string | null;
  property_zip?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  acreage?: number | null;
  year_built?: number | null;
  block?: string | null;
  lot?: string | null;
  qual?: string | null;
  tax_assessment?: number | null;
  tax_assessment_year?: number | null;
  primary_photo_url?: string | null;
  primary_photos_urls?: string[];
};

const PropertyShowcase = () => {
  const { slug } = useParams<{ slug: string }>();
  const [property, setProperty] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; title: string } | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; alt: string; index: number } | null>(null);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const { toast } = useToast();

  useSEO({
    title: property ? `${property.property_address} - Property Showcase` : 'Property Showcase',
    description: property ? `View photos, videos, and details for ${property.property_address}. Agent: ${property.agent_name}` : 'Property showcase with photos, videos, and agent information.',
    canonical: `https://njreap.com/showcase/${slug}`,
  });

  useEffect(() => {
    const fetchProperty = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('property_listings')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;

        if (data) {
          setProperty(data);
        } else {
          toast({
            title: "Property not found",
            description: "The requested property could not be found.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast({
          title: "Error",
          description: "Failed to load property details.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [slug, toast]);

  // Cycle through hero images
  useEffect(() => {
    if (!property?.primary_photos_urls || property.primary_photos_urls.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % property.primary_photos_urls!.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [property?.primary_photos_urls]);

  const getHeroImages = () => {
    if (property?.primary_photos_urls && property.primary_photos_urls.length > 0) {
      return property.primary_photos_urls;
    }
    return property?.primary_photo_url ? [property.primary_photo_url] : [];
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!property?.photos_urls || !selectedPhoto) return;
    
    const currentIndex = selectedPhoto.index;
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : property.photos_urls.length - 1;
    } else {
      newIndex = currentIndex < property.photos_urls.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedPhoto({
      url: property.photos_urls[newIndex],
      alt: `Property photo ${newIndex + 1}`,
      index: newIndex
    });
  };

  const renderSocialMediaIcons = () => {
    if (!property) return null;
    
    const socialMedia = [
      { key: 'agent_facebook', icon: Facebook, url: property.agent_facebook, name: 'Facebook' },
      { key: 'agent_instagram', icon: Instagram, url: property.agent_instagram, name: 'Instagram' },
      { key: 'agent_x', icon: Twitter, url: property.agent_x, name: 'X' },
      { key: 'agent_linkedin', icon: Linkedin, url: property.agent_linkedin, name: 'LinkedIn' },
      { key: 'agent_youtube', icon: Youtube, url: property.agent_youtube, name: 'YouTube' },
    ];

    const availableSocial = socialMedia.filter(social => social.url);
    
    if (availableSocial.length === 0) return null;

    return (
      <div className="flex gap-2 pt-3 border-t">
        <span className="text-xs text-muted-foreground flex-shrink-0 mt-1">Follow:</span>
        <div className="flex gap-2 flex-wrap">
          {availableSocial.map(({ key, icon: Icon, url, name }) => (
            <a
              key={key}
              href={url!}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200 flex items-center justify-center hover:scale-110"
              title={`Follow on ${name}`}
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderPropertyInfo = () => {
    if (!property) return null;

    const hasPropertyInfo = property.bedrooms || property.bathrooms || property.sqft || 
                           property.acreage || property.year_built || property.block || 
                           property.lot || property.qual || property.tax_assessment;

    if (!hasPropertyInfo) return null;

    return (
      <Card className="bg-background/80 backdrop-blur-md border-primary/30 shadow-2xl pointer-events-auto">
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            Property Details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {property.bedrooms && (
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Bedrooms:</span>
                <span className="text-sm">{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Bathrooms:</span>
                <span className="text-sm">{property.bathrooms}</span>
              </div>
            )}
            {property.sqft && (
              <div className="flex items-center gap-2">
                <Square className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Square Feet:</span>
                <span className="text-sm">{property.sqft.toLocaleString()}</span>
              </div>
            )}
            {property.acreage && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Acreage:</span>
                <span className="text-sm">{property.acreage}</span>
              </div>
            )}
            {property.year_built && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Year Built:</span>
                <span className="text-sm">{property.year_built}</span>
              </div>
            )}
            {(property.block || property.lot || property.qual) && (
              <div className="flex items-center gap-2 col-span-2">
                <Building className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Block/Lot:</span>
                <span className="text-sm">
                  {[property.block, property.lot, property.qual].filter(Boolean).join('/')}
                </span>
              </div>
            )}
            {property.tax_assessment && property.tax_assessment_year && (
              <div className="flex items-center gap-2 pt-2 border-t col-span-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Tax Assessment ({property.tax_assessment_year}):</span>
                <span className="text-sm">${property.tax_assessment.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Data provided by njpropertyrecords.com and is deemed reliable but accuracy is not guaranteed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderMediaSection = () => {
    if (!property) return null;

    const sections = [
      { key: 'photos' as const, label: 'Photos', icon: <FileImage className="w-4 h-4" />, available: property.has_photos },
      { key: 'videos' as const, label: 'Videos', icon: <Play className="w-4 h-4" />, available: property.has_videos },
      { key: 'floorplans' as const, label: 'Floor Plans', icon: <FileText className="w-4 h-4" />, available: property.has_floorplans },
      { key: 'matterport' as const, label: 'Virtual Tour', icon: <Maximize className="w-4 h-4" />, available: property.has_matterport },
      { key: 'aerial' as const, label: 'Aerial Views', icon: <Camera className="w-4 h-4" />, available: property.has_aerial },
    ];

    const availableSections = sections.filter(section => section.available);

    return (
      <div className="w-full">
        {/* Desktop Floating Navigation - More Opaque */}
        <div className="hidden lg:block fixed top-24 left-1/2 transform -translate-x-1/2 z-50 opacity-60 hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-wrap gap-2 justify-center">
            {availableSections.map((section) => (
              <Button
                key={section.key}
                variant="ghost"
                className="flex items-center gap-2 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-primary-foreground"
                onClick={() => scrollToSection(section.key)}
              >
                {section.icon}
                {section.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile Navigation - Above Mobile Footer */}
        <div className="lg:hidden fixed bottom-20 left-0 right-0 z-41 bg-background/90 backdrop-blur-sm border-t border-primary/10">
          <div className="flex justify-center gap-2 p-2">
            {availableSections.map((section) => (
              <Button
                key={section.key}
                variant="ghost"
                size="sm"
                className="flex items-center justify-center w-10 h-10 transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                onClick={() => scrollToSection(section.key)}
                title={section.label}
              >
                {section.icon}
              </Button>
            ))}
          </div>
        </div>

        {/* Desktop Sticky Agent and Property Info */}
        <div className="hidden lg:block fixed top-8 right-8 z-40 max-w-sm space-y-4 pointer-events-none">
          {/* Agent Info - Larger */}
          <Card className="bg-background/80 backdrop-blur-md border-primary/30 shadow-2xl pointer-events-auto">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                {property.agent_headshot_url ? (
                  <img 
                    src={property.agent_headshot_url} 
                    alt={property.agent_name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
                  />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center border-2 border-primary/30">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xl text-foreground mb-3">{property.agent_name}</h3>
                  {property.brokerage_logo_url && (
                    <div className="mb-2">
                      <img 
                        src={property.brokerage_logo_url} 
                        alt={property.brokerage_name || 'Brokerage logo'}
                        className="h-10 w-auto max-w-32 object-contain"
                      />
                    </div>
                  )}
                  {property.brokerage_name && (
                    <p className="text-sm text-muted-foreground mb-3">{property.brokerage_name}</p>
                  )}
                  <div className="space-y-3">
                    {property.agent_phone && (
                      <a 
                        href={`tel:${property.agent_phone}`}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {property.agent_phone}
                      </a>
                    )}
                    {property.agent_email && (
                      <a 
                        href={`mailto:${property.agent_email}`}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {property.agent_email}
                      </a>
                    )}
                  </div>
                  {renderSocialMediaIcons()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details - Directly Under Agent */}
          {renderPropertyInfo()}
        </div>

        {/* Mobile Sticky Footer */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-primary/20 shadow-2xl transform transition-transform duration-300" style={{
          transform: 'translateY(0)',
        }}>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              {property.agent_headshot_url ? (
                <img 
                  src={property.agent_headshot_url} 
                  alt={property.agent_name}
                  className="w-12 h-12 rounded-full object-cover border border-primary/30"
                />
              ) : (
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center border border-primary/30">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground mb-2">{property.agent_name}</h3>
                {property.brokerage_logo_url && (
                  <div className="mb-1">
                    <img 
                      src={property.brokerage_logo_url} 
                      alt={property.brokerage_name || 'Brokerage logo'}
                      className="h-6 w-auto max-w-20 object-contain"
                    />
                  </div>
                )}
                {property.brokerage_name && (
                  <p className="text-xs text-muted-foreground">{property.brokerage_name}</p>
                )}
              </div>
              <div className="flex gap-2">
                {property.agent_phone && (
                  <a 
                    href={`tel:${property.agent_phone}`}
                    className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/80 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
                {property.agent_email && (
                  <a 
                    href={`mailto:${property.agent_email}`}
                    className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/80 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            
            {/* Compact Property Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <Home className="w-3 h-3 text-primary" />
                  <span>{property.bedrooms} bed</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <span>{property.bathrooms} bath</span>
                </div>
              )}
              {property.sqft && (
                <div className="flex items-center gap-1">
                  <span>{property.sqft.toLocaleString()} sq ft</span>
                </div>
              )}
              {property.year_built && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" />
                  <span>Built {property.year_built}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Primary Photo Hero */}
        <section id="photos" className="relative w-full h-screen">
          {getHeroImages().length > 0 && (
            <div className="relative w-full h-full">
              {/* Background Images with Crossfade */}
              {getHeroImages().map((url, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img 
                    src={url} 
                    alt={`Property photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30" />
              
              {/* Property Address Overlay - Enhanced */}
              <div className="absolute top-8 left-8 z-30 max-w-2xl">
                <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl mb-2">
                    {property.property_address}
                  </h1>
                  {(property.property_city || property.property_state || property.property_zip) && (
                    <p className="text-lg md:text-2xl text-white/90 drop-shadow-lg">
                      {[property.property_city, property.property_state, property.property_zip]
                        .filter(Boolean)
                        .join(', ')
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 animate-bounce">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30">
                  <ChevronDown className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-sm mt-2 text-center font-medium drop-shadow-lg">
                  Scroll to explore
                </p>
              </div>

              {/* Hero Image Navigation */}
              {getHeroImages().length > 1 && (
                <div className="absolute bottom-4 right-4 z-30 flex gap-2">
                  {getHeroImages().map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full border border-white/50 transition-all ${
                        index === currentHeroIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                      onClick={() => setCurrentHeroIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Photo Gallery */}
        {property.has_photos && property.photos_urls && property.photos_urls.length > 0 && (
          <section className="w-full bg-background py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                  <FileImage className="w-8 h-8 text-primary" />
                  Photo Gallery
                </h2>
                <p className="text-muted-foreground text-lg">Explore this beautiful property</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {property.photos_urls.map((url, index) => (
                  <div 
                    key={index}
                    className="relative aspect-square cursor-pointer group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500"
                    onClick={() => setSelectedPhoto({ url, alt: `Property photo ${index + 1}`, index })}
                  >
                    <img 
                      src={url} 
                      alt={`Property photo ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Maximize className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Videos Section */}
        {property.has_videos && (
          <section id="videos" className="w-full bg-muted/30 py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                  <Play className="w-8 h-8 text-primary" />
                  Property Videos
                </h2>
                <p className="text-muted-foreground text-lg">Watch property walkthrough videos</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2">
                {property.video_urls?.map((url, index) => (
                  <div key={index} className="aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-lg">
                    <iframe
                      src={url.includes('youtube.com/watch') 
                        ? url.replace('youtube.com/watch?v=', 'youtube.com/embed/') 
                        : url
                      }
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`Property video ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Floor Plans Section */}
        {property.has_floorplans && (
          <section id="floorplans" className="w-full bg-background py-16 relative overflow-hidden">
            {/* Decorative SVGs */}
            <img 
              src="/images/misc/bg-top.svg" 
              alt="" 
              className="absolute top-0 left-0 w-full h-16 object-cover opacity-20"
            />
            <img 
              src="/images/misc/bg-bottom.svg" 
              alt="" 
              className="absolute bottom-0 left-0 w-full h-16 object-cover opacity-20"
            />
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  Floor Plans
                </h2>
                <p className="text-muted-foreground text-lg">Detailed property layouts and plans</p>
              </div>
              
              <div className="space-y-12">
                {/* Image Floorplans */}
                {property.floorplan_image_urls && property.floorplan_image_urls.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                      <FileImage className="w-6 h-6 text-primary" />
                      Floor Plan Images
                    </h3>
                    <div className="grid gap-8 md:grid-cols-2">
                      {property.floorplan_image_urls.map((url, index) => (
                        <div key={`image-${index}`} className="relative group">
                          <div 
                            className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                            onClick={() => setSelectedPhoto({ url, alt: `Floor plan image ${index + 1}` })}
                          >
                            <img 
                              src={url} 
                              alt={`Floor plan image ${index + 1}`}
                              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Maximize className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PDF Floorplans */}
                {property.floorplan_pdf_urls && property.floorplan_pdf_urls.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-primary" />
                      Floor Plan Documents
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {property.floorplan_pdf_urls.map((url, index) => (
                        <div key={`pdf-${index}`} className="bg-muted/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-primary/20">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl">
                              <FileText className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">Floor Plan {index + 1}</h4>
                              <p className="text-sm text-muted-foreground">PDF Document</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => setPdfPreview({ url, title: `Floor Plan ${index + 1}` })}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                            <Button
                              variant="outline"
                              asChild
                            >
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Virtual Tour Section */}
        {property.has_matterport && (
          <section id="matterport" className="w-full bg-muted/30 py-16 relative overflow-hidden">
            {/* Decorative SVGs */}
            <img 
              src="/images/misc/bg-top.svg" 
              alt="" 
              className="absolute top-0 left-0 w-full h-16 object-cover opacity-20"
            />
            <img 
              src="/images/misc/bg-bottom.svg" 
              alt="" 
              className="absolute bottom-0 left-0 w-full h-16 object-cover opacity-20"
            />
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                  <Maximize className="w-8 h-8 text-primary" />
                  Virtual Tour
                </h2>
                <p className="text-muted-foreground text-lg">Experience the property in 3D</p>
              </div>
              <div className="space-y-8">
                {property.matterport_urls?.map((url, index) => (
                  <div key={index} className="aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-lg">
                    <iframe
                      src={url}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      title={`Matterport tour ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Aerial Views Section - Unique Panoramic Display */}
        {property.has_aerial && (
          <section id="aerial" className="w-full bg-gradient-to-br from-background via-muted/20 to-background py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                  <Camera className="w-8 h-8 text-primary" />
                  Aerial Perspectives
                </h2>
                <p className="text-muted-foreground text-lg">Experience breathtaking bird's eye views</p>
              </div>
              
              {/* Main Aerial Photo */}
              {property.aerial_urls && property.aerial_urls.length > 0 && (
                <div className="mb-12">
                  <div 
                    className="relative w-full h-96 cursor-pointer group overflow-hidden rounded-2xl shadow-2xl"
                    onClick={() => setSelectedPhoto({ url: property.aerial_urls![0], alt: 'Main aerial view', index: -1 })}
                  >
                    <img 
                      src={property.aerial_urls[0]} 
                      alt="Main aerial view"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">Property Overview</h3>
                      <p className="text-white/80">Click to explore in full resolution</p>
                    </div>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-4">
                        <Maximize className="w-8 h-8 text-black" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Additional Aerial Photos in Horizontal Scroll */}
              {property.aerial_urls && property.aerial_urls.length > 1 && (
                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-6 min-w-max">
                    {property.aerial_urls.slice(1).map((url, index) => (
                      <div 
                        key={index + 1}
                        className="relative w-80 h-48 cursor-pointer group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 flex-shrink-0"
                        onClick={() => setSelectedPhoto({ url, alt: `Aerial view ${index + 2}` })}
                      >
                        <img 
                          src={url} 
                          alt={`Aerial view ${index + 2}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-white text-sm font-medium">Angle {index + 2}</p>
                        </div>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Maximize className="w-6 h-6 text-white drop-shadow-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">Loading property details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Property Not Found</h1>
            <p className="text-muted-foreground">The requested property could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {renderMediaSection()}

        {/* Enhanced Photo Modal */}
        {selectedPhoto && (
          <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
            <DialogContent className="max-w-[98vw] max-h-[98vh] p-0 border-0 bg-transparent">
              <div className="relative w-full h-[95vh] flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg">
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-50 text-foreground hover:bg-background/20"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="w-6 h-6" />
                </Button>

                {/* Navigation Arrows - Only for photo gallery */}
                {property?.photos_urls && selectedPhoto.index >= 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 text-foreground hover:bg-background/20"
                      onClick={() => navigatePhoto('prev')}
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 text-foreground hover:bg-background/20"
                      onClick={() => navigatePhoto('next')}
                    >
                      <ChevronRight className="w-8 h-8" />
                    </Button>
                  </>
                )}

                {/* Main Image */}
                <img 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.alt}
                  className="max-w-full max-h-[70vh] object-contain"
                />

                {/* Photo Thumbnails - Only for photo gallery */}
                {property?.photos_urls && selectedPhoto.index >= 0 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-background/80 backdrop-blur-sm rounded-full p-3 max-w-[90vw] overflow-x-auto">
                    <div className="flex gap-2">
                      {property.photos_urls.map((url, index) => (
                        <button
                          key={index}
                          className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            index === selectedPhoto.index ? 'border-primary ring-2 ring-primary/30' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          onClick={() => setSelectedPhoto({ url, alt: `Property photo ${index + 1}`, index })}
                        >
                          <img
                            src={url}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* PDF Preview Modal */}
        {pdfPreview && (
          <PDFPreviewModal
            isOpen={!!pdfPreview}
            onClose={() => setPdfPreview(null)}
            pdfUrl={pdfPreview.url}
            title={pdfPreview.title}
          />
        )}
      </div>
      
      {/* Add Footer */}
      <ShowcaseFooter />
    </>
  );
};

export default PropertyShowcase;