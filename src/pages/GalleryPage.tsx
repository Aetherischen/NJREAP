import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Map,
  Camera,
  Plane,
  Video,
  Eye,
  Play,
  ExternalLink,
  Download,
  Maximize,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MediaItem {
  type: 'image' | 'video' | 'iframe';
  url: string;
  name?: string;
}

interface GalleryCollection {
  id: string;
  title: string;
  description: string;
  location: string;
  service_type: string;
  media_items: MediaItem[];
  cover_image: string;
  property_type: string;
  featured: boolean;
}

const Gallery = () => {
  // SEO optimization
  useSEO({
    title: "Gallery: Professional Real Estate Photography & Virtual Tours in NJ",
    description: "View our portfolio of professional real estate photography, aerial drone shots, virtual tours, and floor plans for properties across Northern and Central New Jersey.",
    keywords: "real estate photography gallery NJ, aerial photography portfolio, virtual tours New Jersey, floor plans gallery, property photography examples, drone photography portfolio Bergen County, real estate videography samples",
    canonical: "https://njreap.com/gallery",
    ogImage: "/images/pages/bg-contact.webp"
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("photography");
  const [collections, setCollections] = useState<GalleryCollection[]>([]);
  const [loading, setLoading] = useState(true);

  // Load gallery collections from Supabase
  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true); // Ensure loading state is set
      // Fetch only essential data first, limit to featured/recent items
      const { data, error } = await supabase
        .from('gallery_collections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Limit initial load

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Transform the data to match our interface with proper type conversion
      const transformedData: GalleryCollection[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        location: item.location || '',
        service_type: item.service_type || '',
        cover_image: item.cover_image || '',
        property_type: item.property_type || '',
        featured: item.featured || false,
        media_items: Array.isArray(item.media_items) 
          ? (item.media_items as any[]).map((mediaItem: any) => ({
              type: mediaItem.type || 'image',
              url: mediaItem.url || '',
              name: mediaItem.name
            })) as MediaItem[]
          : []
      }));
      
      console.log('Loaded collections:', transformedData);
      setCollections(transformedData);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setCollections([]); // Set empty array on error
    } finally {
      // Use setTimeout to ensure state update completes in production
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  };

  // Handle URL tab parameter and support service-specific routing
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["photography", "floorplans", "aerial", "video"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const getCategoryDisplayType = (category: string) => {
    switch (category) {
      case "photography":
        return "Professional Photography";
      case "floorplans":
        return "2D & 3D Floor Plans";
      case "aerial":
        return "Aerial Photography";
      case "video":
        return "Virtual Tours & Video";
      default:
        return "Gallery";
    }
  };

  // Create dynamic collections from loaded data - simplified to prevent infinite loops
  const groupCollectionsByCategory = (category: string) => {
    return collections
      .filter(collection => {
        if (category === 'photography') {
          return collection.service_type === 'photography';
        }
        if (category === 'floorplans') {
          return collection.service_type === 'floor_plans';
        }
        if (category === 'aerial') {
          return collection.service_type === 'aerial_photography';
        }
        if (category === 'video') {
          return collection.service_type === 'virtual_tour' ||
                 collection.media_items?.some(item => item.type === 'video' || item.type === 'iframe');
        }
        return false;
      })
      .map(collection => ({
        title: collection.title,
        type: getCategoryDisplayType(category),
        description: collection.description,
        location: collection.location,
        images: collection.media_items?.filter(item => item.type === 'image').map(item => item.url) || [collection.cover_image].filter(Boolean),
        sqft: collection.property_type,
        propertyType: collection.property_type,
        mediaItems: collection.media_items || [],
        isVideo: collection.media_items?.some(item => item.type === 'video' || item.type === 'iframe') || collection.service_type === 'virtual_tour',
        duration: '3:00'
      }));
  };

  // Dynamic collections based on database data - simplified without complex memoization
  const floorPlanCollections = groupCollectionsByCategory("floorplans");
  const photographyCollections = groupCollectionsByCategory("photography");
  const aerialCollections = groupCollectionsByCategory("aerial");
  const videoCollections = groupCollectionsByCategory("video");

  // Component for static cover images with lazy loading
  const StaticCover = ({
    images,
    title,
  }: {
    images: string[];
    title: string;
  }) => {
    if (!images.length) {
      return (
        <div className="h-64 bg-gray-200 rounded-t-lg flex items-center justify-center">
          <Camera className="w-12 h-12 text-gray-400" />
        </div>
      );
    }

    // Lazy load images with proper dimensions to prevent layout shift
    return (
      <div className="relative h-64 overflow-hidden rounded-t-lg bg-gray-100">
        <img
          src={images[0]}
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
          width="400"
          height="256"
          decoding="async"
        />
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="text-xs">
              +{images.length - 1} more
            </Badge>
          </div>
        )}
      </div>
    );
  };

  // Carousel component for collections
  const CollectionCarousel = ({
    collections,
    onCollectionClick,
  }: {
    collections: any[];
    onCollectionClick: (collection: any) => void;
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerView = 4;
    const maxIndex = Math.max(0, collections.length - itemsPerView);

    const nextSlide = () => {
      setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    };

    const prevSlide = () => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    };

    if (collections.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No collections available for this category yet.</p>
        </div>
      );
    }

    if (collections.length <= itemsPerView) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {collections.map((collection, index) => (
            <CollectionCard
              key={index}
              collection={collection}
              onClick={() => onCollectionClick(collection)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out gap-8"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {collections.map((collection, index) => (
              <div key={index} className="flex-none w-1/4">
                <CollectionCard
                  collection={collection}
                  onClick={() => onCollectionClick(collection)}
                />
              </div>
            ))}
          </div>
        </div>

        {currentIndex > 0 && (
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {currentIndex < maxIndex && (
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    );
  };

  // Individual collection card component
  const CollectionCard = ({
    collection,
    onClick,
  }: {
    collection: any;
    onClick: () => void;
  }) => (
    <Card
      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
      onClick={onClick}
    >
      <div className="relative">
        <StaticCover images={collection.images} title={collection.title} />
        {collection.isVideo && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        )}
        <Badge
          className={`absolute top-3 right-3 ${collection.badgeClass || "bg-[#4d0a97] hover:bg-[#4d0a97]"}`}
        >
          {collection.badge ||
            (collection.mediaItems
              ? `${collection.mediaItems.length} Items`
              : `${collection.images.length} Photos`)}
        </Badge>
      </div>
      <CardContent className="p-4 sm:p-6">
        <h4 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">
          {collection.title}
        </h4>
        <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">{collection.location}</p>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {collection.description}
        </p>
        {collection.sqft && (
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline">{collection.sqft}</Badge>
            <Badge variant="outline">{collection.images.length} items</Badge>
          </div>
        )}
        {collection.isVideo && (
          <div className="mt-4">
            <Button className="w-full bg-[#4d0a97] hover:bg-[#a044e3] text-sm sm:text-base py-2 sm:py-3">
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              View{" "}
              {collection.type && collection.type.includes("Virtual")
                ? "Tour"
                : "Video"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Component for expanded media viewer (supports images, videos, and iframes)
  const ImageViewer = ({
    collection,
    isOpen,
    onClose,
  }: {
    collection: any;
    isOpen: boolean;
    onClose: () => void;
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Reset currentIndex when collection changes
    useEffect(() => {
      setCurrentIndex(0);
    }, [collection]);

    // Get all media items (images, videos, iframes) or fall back to images
    const mediaItems =
      collection?.mediaItems ||
      collection?.images?.map((url: string) => ({ type: "image", url })) ||
      [];

    const nextMedia = () => {
      if (mediaItems.length > 1) {
        setCurrentIndex((prev) =>
          prev === mediaItems.length - 1 ? 0 : prev + 1,
        );
      }
    };

    const prevMedia = () => {
      if (mediaItems.length > 1) {
        setCurrentIndex((prev) =>
          prev === 0 ? mediaItems.length - 1 : prev - 1,
        );
      }
    };

    if (!isOpen || !collection || mediaItems.length === 0) return null;

    const currentMedia = mediaItems[currentIndex];

    // Helper function to check if URL is a Matterport URL and extract the model ID
    const getMatterportEmbedUrl = (url: string) => {
      // Check if it's already an embed URL
      if (url.includes('/show/?m=')) {
        return url;
      }
      
      // Extract model ID from various Matterport URL formats
      const modelMatch = url.match(/[?&]m=([^&]+)/);
      if (modelMatch) {
        return `https://my.matterport.com/show/?m=${modelMatch[1]}`;
      }
      
      return url; // Return original if no match
    };

    const renderMedia = () => {
      if (currentMedia.type === "iframe") {
        const embedUrl = getMatterportEmbedUrl(currentMedia.url);
        return (
          <div className="w-full h-full min-h-[500px] flex items-center justify-center">
            <iframe
              src={embedUrl}
              title={`${collection.title} - Virtual Tour`}
              className="w-full h-[500px] border-0 rounded-lg"
              allowFullScreen
              allow="autoplay; fullscreen; web-share; xr-spatial-tracking;"
              frameBorder="0"
            />
          </div>
        );
      } else if (currentMedia.type === "video") {
        // Handle YouTube URLs
        if (currentMedia.url.includes('youtube.com/watch') || currentMedia.url.includes('youtu.be/')) {
          let videoId = '';
          if (currentMedia.url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(currentMedia.url.split('?')[1]);
            videoId = urlParams.get('v') || '';
          } else if (currentMedia.url.includes('youtu.be/')) {
            videoId = currentMedia.url.split('youtu.be/')[1].split('?')[0];
          }
          
          if (videoId) {
            return (
              <div className="w-full h-full min-h-[500px] flex items-center justify-center">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={`${collection.title} - Video`}
                  className="w-full h-[500px] border-0 rounded-lg"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                  frameBorder="0"
                />
              </div>
            );
          }
        }
        
        // Fallback to regular video element
        return (
          <video
            src={currentMedia.url}
            controls
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: "70vh" }}
          />
        );
      } else {
        return (
          <img
            src={currentMedia.url}
            alt={`${collection.title} - Item ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            loading="lazy"
            decoding="async"
          />
        );
      }
    };

    const getMediaTypeLabel = (media: any) => {
      if (media.type === "iframe") return "Virtual Tour";
      if (media.type === "video") return "Video";
      return "Image";
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[85vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{collection.title}</DialogTitle>
            <DialogDescription>
              {collection.description}
              {collection.location && ` • ${collection.location}`}
            </DialogDescription>
          </DialogHeader>

          <div className="relative flex-1 flex items-center justify-center bg-gray-100 mx-6 rounded-lg">
            {renderMedia()}

            {/* Only show navigation arrows if there are multiple items */}
            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="p-6 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {getMediaTypeLabel(currentMedia)} {currentIndex + 1} of{" "}
                {mediaItems.length}
                {currentMedia.name && ` • ${currentMedia.name}`}
              </span>
              {/* Only show dots navigation if there are multiple items */}
              {mediaItems.length > 1 && (
                <div className="flex space-x-2">
                  {mediaItems.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentIndex
                          ? "bg-[#4d0a97]"
                          : "bg-gray-300"
                      }`}
                      title={getMediaTypeLabel(media)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Custom Tab Button Component with fixed NJREAP colors
  const TabButton = ({
    value,
    children,
    isActive,
    onClick,
  }: {
    value: string;
    children: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center px-8 py-4 text-base font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${
        isActive
          ? "bg-gradient-to-r from-[#4d0a97] to-[#a044e3] text-white shadow-lg"
          : "bg-gray-50 text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
      }`}
    >
      {children}
    </button>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d0a97] mx-auto mb-4"></div>
            <p>Loading gallery...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section with Static Background */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        {/* Static Background Image - hidden on mobile */}
        <div 
          className="hidden sm:block absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/pages/bg-contact.webp')`,
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

        {/* Gradient Overlay */}
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

        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge
              variant="outline"
              className="text-white border-white/30 mb-2 sm:mb-4"
            >
              Our Work Portfolio
            </Badge>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6">
              Photography & Videography Gallery
            </h1>
            <p className="text-lg sm:text-xl text-gray-100 leading-relaxed">
              Explore examples of our professional real estate photography,
              videography, and visualization services across New Jersey.
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Tabs */}
      <section className="bg-gradient-to-b from-gray-100 to-white py-6 sm:py-12">
        <div className="container mx-auto px-4">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-12 p-2 sm:p-4 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
            <TabButton
              value="photography"
              isActive={activeTab === "photography"}
              onClick={() => setActiveTab("photography")}
            >
              <Camera className="w-5 h-5 mr-2" />
              Photography
            </TabButton>
            <TabButton
              value="floorplans"
              isActive={activeTab === "floorplans"}
              onClick={() => setActiveTab("floorplans")}
            >
              <Map className="w-5 h-5 mr-2" />
              Floor Plans
            </TabButton>
            <TabButton
              value="aerial"
              isActive={activeTab === "aerial"}
              onClick={() => setActiveTab("aerial")}
            >
              <Plane className="w-5 h-5 mr-2" />
              Aerial
            </TabButton>
            <TabButton
              value="video"
              isActive={activeTab === "video"}
              onClick={() => setActiveTab("video")}
            >
              <Video className="w-5 h-5 mr-2" />
              Video & Tours
            </TabButton>
          </div>

          {/* Tab Content */}
          <div className="w-full">
            {activeTab === "photography" && (
              <div>
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Professional Photography Collections
                  </h3>
                  <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    High-resolution, expertly composed images that showcase
                    properties' best features
                  </p>
                </div>
                <CollectionCarousel
                  collections={photographyCollections}
                  onCollectionClick={setSelectedCollection}
                />
              </div>
            )}

            {activeTab === "floorplans" && (
              <div>
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Floor Plans & Layouts
                  </h3>
                  <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    Detailed 2D and 3D floor plans for clear space visualization
                    and property marketing
                  </p>
                </div>
                <CollectionCarousel
                  collections={floorPlanCollections.map((collection) => ({
                    ...collection,
                    badge: collection.type,
                    badgeClass: "bg-[#a044e3] hover:bg-[#a044e3]",
                  }))}
                  onCollectionClick={setSelectedCollection}
                />
              </div>
            )}

            {activeTab === "aerial" && (
              <div>
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Aerial Photography Collections
                  </h3>
                  <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    Stunning drone photography showcasing property surroundings
                    and unique perspectives
                  </p>
                </div>
                <CollectionCarousel
                  collections={aerialCollections.map((collection) => ({
                    ...collection,
                    badge: "Drone",
                    badgeClass: "bg-blue-500 hover:bg-blue-600",
                  }))}
                  onCollectionClick={setSelectedCollection}
                />
              </div>
            )}

            {activeTab === "video" && (
              <div>
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Video & Virtual Tours
                  </h3>
                  <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    Cinematic property tours and immersive virtual experiences
                  </p>
                </div>
                <div className="max-w-6xl mx-auto">
                  <CollectionCarousel
                    collections={videoCollections.map((collection) => ({
                      ...collection,
                      isVideo: true,
                      badge: collection.duration,
                      badgeClass: "bg-red-500 hover:bg-red-600",
                    }))}
                    onCollectionClick={setSelectedCollection}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Image Viewer Modal */}
      <ImageViewer
        collection={selectedCollection}
        isOpen={!!selectedCollection}
        onClose={() => setSelectedCollection(null)}
      />

      {/* CTA Section with proper background */}
      <section className="py-16 bg-gradient-to-r from-[#4d0a97] to-[#a044e3] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Showcase Your Property?
            </h2>
            <p className="text-xl text-gray-100 mb-8">
              Let NJREAP create stunning visuals that help your property stand
              out in the market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white hover:text-[#4d0a97] transition-all"
                >
                  Get Photography Quote
                </Button>
              </Link>
              <Link to="/services">
                <Button
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white hover:text-[#4d0a97] transition-all"
                >
                  View All Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
