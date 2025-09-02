import { useState, useEffect } from 'react';
import { Camera, Plane, Home, Map } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [activeCategory, setActiveCategory] = useState('all');
  const [collections, setCollections] = useState<GalleryCollection[]>([]);
  const [loading, setLoading] = useState(true);

  // Load gallery collections from Supabase
  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true); // Ensure loading state is set
      const { data, error } = await supabase
        .from('gallery_collections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
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
      // Use setTimeout to ensure state update completes
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  };

  const categories = [
    { id: 'all', name: 'All Work', icon: Camera },
    { id: 'photography', name: 'Photography', icon: Camera },
    { id: 'aerial_photography', name: 'Aerial', icon: Plane },
    { id: 'floor_plans', name: 'Floor Plans', icon: Map },
    { id: 'virtual_tour', name: 'Virtual Tours', icon: Home }
  ];

  const getDisplayImage = (collection: GalleryCollection): string => {
    if (collection.cover_image) return collection.cover_image;
    
    const imageItem = collection.media_items?.find(item => item.type === 'image');
    return imageItem?.url || '';
  };

  const getCategoryFromServiceType = (serviceType: string): string => {
    switch (serviceType) {
      case 'photography':
        return 'photography';
      case 'aerial_photography':
        return 'aerial_photography';
      case 'floor_plans':
        return 'floor_plans';
      case 'virtual_tour':
        return 'virtual_tour';
      default:
        return 'all';
    }
  };

  const filteredCollections = activeCategory === 'all' 
    ? collections 
    : collections.filter(collection => getCategoryFromServiceType(collection.service_type) === activeCategory);

  if (loading) {
    return (
      <section id="gallery" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d0a97] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading gallery...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#020817] mb-4">
            Our Portfolio
          </h2>
          <p className="text-xl text-[#374151] max-w-3xl mx-auto">
            Explore our collection of professional real estate photography and see the quality that sets us apart
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-[#4d0a97] text-white shadow-lg'
                    : 'bg-white text-[#374151] hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCollections.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No gallery items available for this category.</p>
            </div>
          ) : (
            filteredCollections.map((collection) => {
              const displayImage = getDisplayImage(collection);
              return (
                <div
                  key={collection.id}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-square overflow-hidden">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={collection.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          console.error(`Failed to load image: ${displayImage}`);
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Camera className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-semibold text-lg mb-1">{collection.title}</h3>
                      <p className="text-sm text-white/80">{collection.location}</p>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm text-[#4d0a97] px-2 py-1 rounded-full text-xs font-medium capitalize">
                      {collection.service_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <a 
            href="/gallery"
            className="bg-[#4d0a97] hover:bg-[#a044e3] text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 inline-block"
          >
            View Complete Portfolio
          </a>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: '500+', label: 'Properties Photographed' },
            { number: '200+', label: 'Appraisals Completed' },
            { number: '50+', label: 'Real Estate Agents' },
            { number: '5★', label: 'Average Rating' }
          ].map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-3xl font-bold text-[#4d0a97]">{stat.number}</div>
              <div className="text-[#374151]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;