import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowLeft, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { createSafeJsonLd } from '@/lib/security';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image: string;
  video_url?: string;
  published: boolean;
  read_time: number;
  created_at: string;
  updated_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic SEO based on blog post content
  useSEO({
    title: post ? `${post.title} | NJREAP Blog` : "Blog Post | NJREAP - Real Estate Appraisals & Photography",
    description: post ? post.excerpt || `Read about ${post.title} on the NJREAP blog. Expert insights on real estate appraisals and photography in New Jersey.` : "Read expert insights on real estate appraisals and photography from NJREAP, serving Northern & Central New Jersey.",
    keywords: post ? `${post.category}, real estate appraisal, property valuation, real estate photography, New Jersey, NJREAP, ${post.title.toLowerCase()}` : "real estate blog, appraisal tips, property photography, New Jersey real estate",
    canonical: `https://njreap.com/blog/${slug}`,
    ogImage: post?.featured_image || "/images/pages/bg-blog.jpg",
    ogType: "article",
    noindex: !post?.published
  });

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Blog post not found');
        } else {
          throw error;
        }
        return;
      }

      setPost(data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const getPostDisplayImage = () => {
    if (post?.video_url) {
      const videoId = extractYouTubeVideoId(post.video_url);
      if (videoId) {
        return getYouTubeThumbnail(videoId);
      }
    }
    return post?.featured_image || "/images/pages/bg-blog.jpg";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d0a97] mx-auto mb-4"></div>
            <p>Loading blog post...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The blog post you are looking for does not exist.'}</p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const videoId = post.video_url ? extractYouTubeVideoId(post.video_url) : null;

  return (
    <Layout>
      <article className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-[#4d0a97]">Home</Link></li>
              <li className="text-gray-300">/</li>
              <li><Link to="/blog" className="hover:text-[#4d0a97]">Blog</Link></li>
              <li className="text-gray-300">/</li>
              <li className="text-gray-900">{post.title}</li>
            </ol>
          </nav>

          {/* Back to Blog */}
          <div className="mb-8">
            <Link to="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>

          {/* Featured Media */}
          <div className="mb-8">
            {videoId ? (
              <div className="space-y-4">
                <AspectRatio ratio={16 / 9}>
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={post.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                  />
                </AspectRatio>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Video className="w-4 h-4 mr-2" />
                  Watch this video on YouTube
                </div>
              </div>
            ) : post.featured_image ? (
              <img
                src={post.featured_image}
                alt={`Featured image for ${post.title}`}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
                loading="lazy"
              />
            ) : null}
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Badge variant="outline">{post.category}</Badge>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {post.read_time} min read
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  NJREAP Team
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed">
              {post.content}
            </div>
          </div>

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Published by NJREAP Team</span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: <time dateTime={post.updated_at}>{formatDate(post.updated_at)}</time>
              </div>
            </div>
          </footer>

          {/* Schema.org structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: createSafeJsonLd({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.excerpt,
                "image": getPostDisplayImage(),
                "author": {
                  "@type": "Organization",
                  "name": "NJREAP",
                  "url": "https://njreap.com"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "NJREAP",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://njreap.com/logo.svg"
                  }
                },
                "datePublished": post.created_at,
                "dateModified": post.updated_at,
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": `https://njreap.com/blog/${post.slug}`
                }
              })
            }}
          />

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-gradient-to-r from-[#4d0a97] to-[#a044e3] rounded-lg text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              Need Professional Real Estate Services?
            </h3>
            <p className="text-gray-100 mb-6">
              Get expert appraisal and photography services for your property in Northern & Central New Jersey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" aria-label="Get free property appraisal quote">
                <Button size="lg" className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white hover:text-[#4d0a97]">
                  Get Free Quote
                </Button>
              </Link>
              <Link to="/services" aria-label="View our real estate services">
                <Button size="lg" className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white hover:text-[#4d0a97]">
                  View Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
