export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  status: 'draft' | 'published';
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  url: string;
  description?: string;
  location?: string;
  category: 'photography' | 'aerial' | 'floorplans' | 'video';
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  type: 'image' | 'video' | 'iframe';
  url: string;
  name?: string;
}

export interface GalleryPost {
  id: string;
  title: string;
  description: string;
  location?: string;
  category: 'photography' | 'aerial' | 'floorplans' | 'video';
  mediaItems: MediaItem[];
  propertyDetails?: {
    sqft?: string;
    type?: string;
  };
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

class ContentManager {
  private readonly BLOG_POSTS_KEY = 'njreap_blog_posts';
  private readonly GALLERY_IMAGES_KEY = 'njreap_gallery_images';
  private readonly GALLERY_POSTS_KEY = 'njreap_gallery_posts';

  // Mock data for testing
  private getMockPosts(): BlogPost[] {
    return [
      {
        id: '1',
        title: 'The Importance of Professional Real Estate Photography',
        slug: 'importance-professional-real-estate-photography',
        excerpt: 'Learn how professional photography can increase property views by up to 118% and sell homes faster.',
        content: 'Professional real estate photography is crucial for success in today\'s market...',
        author: 'Sarah Chen',
        category: 'Photography Tips',
        status: 'published',
        featuredImage: '/images/blog/photography-tips.jpg',
        publishedAt: '2024-01-15T00:00:00Z',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        title: 'Understanding Real Estate Appraisals in New Jersey',
        slug: 'understanding-real-estate-appraisals-nj',
        excerpt: 'A comprehensive guide to the appraisal process, what affects property values, and what to expect.',
        content: 'Real estate appraisals are a critical part of the buying and selling process...',
        author: 'Michael Rodriguez',
        category: 'Industry Standards',
        status: 'published',
        featuredImage: '/images/blog/appraisal-guide.jpg',
        publishedAt: '2024-01-10T00:00:00Z',
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z'
      },
      {
        id: '3',
        title: 'Market Trends: Northern NJ Real Estate in 2024',
        slug: 'northern-nj-market-trends-2024',
        excerpt: 'Analysis of current market conditions across Bergen, Essex, Hudson, and surrounding counties.',
        content: 'The Northern New Jersey real estate market continues to show resilience...',
        author: 'Jennifer Walsh',
        category: 'Market Analysis',
        status: 'published',
        featuredImage: '/images/blog/market-trends.jpg',
        publishedAt: '2024-01-05T00:00:00Z',
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-05T00:00:00Z'
      }
    ];
  }

  getBlogPosts(): BlogPost[] {
    try {
      const stored = localStorage.getItem(this.BLOG_POSTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Return mock data if no stored posts
      return this.getMockPosts();
    } catch (error) {
      console.error('Error loading blog posts:', error);
      return this.getMockPosts();
    }
  }

  getPublishedBlogPosts(): BlogPost[] {
    return this.getBlogPosts().filter(post => post.status === 'published');
  }

  saveBlogPosts(posts: BlogPost[]): void {
    try {
      localStorage.setItem(this.BLOG_POSTS_KEY, JSON.stringify(posts));
    } catch (error) {
      console.error('Error saving blog posts:', error);
    }
  }

  // Gallery Images Methods
  getAllGalleryImages(): GalleryImage[] {
    try {
      const stored = localStorage.getItem(this.GALLERY_IMAGES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.getMockGalleryImages();
    } catch (error) {
      console.error('Error loading gallery images:', error);
      return this.getMockGalleryImages();
    }
  }

  saveGalleryImages(images: GalleryImage[]): void {
    try {
      localStorage.setItem(this.GALLERY_IMAGES_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Error saving gallery images:', error);
    }
  }

  // Gallery Posts Methods
  getAllGalleryPosts(): GalleryPost[] {
    try {
      const stored = localStorage.getItem(this.GALLERY_POSTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.getMockGalleryPosts();
    } catch (error) {
      console.error('Error loading gallery posts:', error);
      return this.getMockGalleryPosts();
    }
  }

  saveGalleryPosts(posts: GalleryPost[]): void {
    try {
      localStorage.setItem(this.GALLERY_POSTS_KEY, JSON.stringify(posts));
    } catch (error) {
      console.error('Error saving gallery posts:', error);
    }
  }

  // Mock Data
  private getMockGalleryImages(): GalleryImage[] {
    return [
      {
        id: '1',
        title: 'Modern Living Room',
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop',
        description: 'Beautiful modern living space',
        location: 'Jersey City, NJ',
        category: 'photography',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Aerial Property View',
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&h=400&fit=crop',
        description: 'Drone photography of waterfront property',
        location: 'Atlantic City, NJ',
        category: 'aerial',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private getMockGalleryPosts(): GalleryPost[] {
    return [
      {
        id: '1',
        title: 'Luxury Waterfront Home',
        description: 'Complete photography package for a stunning waterfront property',
        location: 'Atlantic City, NJ',
        category: 'photography',
        mediaItems: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop', name: 'Exterior View' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop', name: 'Living Room' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop', name: 'Kitchen' }
        ],
        propertyDetails: {
          sqft: '3,200 sq ft',
          type: 'Single Family'
        },
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  cleanupCorruptedData(): void {
    try {
      const posts = this.getBlogPosts();
      const validPosts = posts.filter(post => 
        post && 
        typeof post === 'object' && 
        post.id && 
        post.title && 
        post.content
      );
      
      if (validPosts.length !== posts.length) {
        this.saveBlogPosts(validPosts);
      }
    } catch (error) {
      console.error('Error cleaning up corrupted data:', error);
      localStorage.removeItem(this.BLOG_POSTS_KEY);
    }
  }
}

export const calculateReadTime = (content: string): number => {
  if (!content) return 1;
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

export const contentManager = new ContentManager();
