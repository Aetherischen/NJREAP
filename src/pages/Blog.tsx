import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User, Search, TrendingUp, Home, Camera, Scale, DollarSign, Wrench, History, ArrowRight, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

const Blog = () => {
  // SEO optimization
  useSEO({
    title: "NJREAP Blog: Real Estate Insights & Market Analysis for New Jersey",
    description: "Stay informed with the latest trends in New Jersey real estate, appraisal insights, market analysis, and photography techniques from our expert team.",
    keywords: "New Jersey real estate blog, property market analysis NJ, real estate appraisal insights, Northern NJ market trends, Central NJ property values, real estate photography tips, homeowner advice New Jersey",
    canonical: "https://njreap.com/blog",
    ogImage: "/images/pages/bg-blog.webp"
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visiblePosts, setVisiblePosts] = useState(6);
  const [loading, setLoading] = useState(true);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
      
      // Set featured post (first post or you can add a featured field later)
      if (data && data.length > 0) {
        setFeaturedPost(data[0]);
        setFilteredPosts(data.slice(1)); // Exclude featured post from list
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // When filtering, include ALL posts (including featured post)
    let filtered = posts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // If we're filtering (search or category), show all matching posts
    // If we're not filtering, exclude the featured post from the list
    if (searchTerm || selectedCategory) {
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(filtered.slice(1)); // Exclude featured post when not filtering
    }
    
    setVisiblePosts(6); // Reset visible posts when filters change
  }, [posts, searchTerm, selectedCategory]);

  // Calculate category counts - include ALL posts (including featured)
  const categoryData = [
    { name: "Market Analysis", count: 0, icon: TrendingUp },
    { name: "Homeowner Tips", count: 0, icon: Home },
    { name: "Photography Tips", count: 0, icon: Camera },
    { name: "Industry Standards", count: 0, icon: Scale },
    { name: "Financial Tips", count: 0, icon: DollarSign },
    { name: "Technology", count: 0, icon: Wrench },
    { name: "History", count: 0, icon: History },
  ];

  // Count posts by category - include ALL posts
  posts.forEach((post) => {
    const category = categoryData.find((cat) => cat.name === post.category);
    if (category) category.count++;
  });

  const displayedPosts = filteredPosts.slice(0, visiblePosts);
  const hasMorePosts = filteredPosts.length > visiblePosts;

  const handleLoadMore = () => {
    setVisiblePosts((prev) => prev + 6);
  };

  // Get recent posts (top 3 most recent)
  const recentPosts = posts
    .slice(0, 3)
    .map((post) => ({
      title: post.title,
      date: new Date(post.created_at).toLocaleDateString(),
      slug: post.slug,
    }));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if search or category filter is active
  const isFiltering = searchTerm || selectedCategory;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscribeEmail.trim()) {
      return;
    }

    setIsSubscribing(true);
    
    try {
      const { error } = await supabase
        .from('blog_subscribers')
        .insert([
          {
            email: subscribeEmail.trim(),
            is_active: true
          }
        ]);

      if (error) {
        // Handle duplicate email error gracefully
        if (error.code === '23505') {
          alert('This email is already subscribed!');
        } else {
          throw error;
        }
      } else {
        alert('Successfully subscribed to blog updates!');
        setSubscribeEmail('');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
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

  const getPostDisplayImage = (post: BlogPost) => {
    if (post.video_url) {
      const videoId = extractYouTubeVideoId(post.video_url);
      if (videoId) {
        return getYouTubeThumbnail(videoId);
      }
    }
    return post.featured_image || "/images/blog/default-post.jpg";
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d0a97] mx-auto mb-4"></div>
            <p>Loading blog posts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        {/* Background Image - hidden on mobile */}
        <div
          className="hidden sm:block absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/pages/bg-blog.webp')`,
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

        <div className="relative z-10 container mx-auto px-4 py-8 sm:py-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge
              variant="outline"
              className="text-white border-white/30 mb-2 sm:mb-4"
            >
              NJREAP Blog
            </Badge>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6">
              Real Estate Insights & Updates
            </h1>
            <p className="text-lg sm:text-xl text-gray-100 leading-relaxed mb-4 sm:mb-8">
              Stay informed with the latest trends in New Jersey real estate,
              appraisal insights, and photography techniques from our expert
              team.
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  className="pl-10 bg-white/90 backdrop-blur-sm text-gray-900 placeholder:text-gray-500 focus:bg-white focus:text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post - Hide when filtering */}
      {!isFiltering && (
        <section className="py-8 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-4 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
                Featured Article
              </h2>
            </div>

            {featuredPost && (
              <Card className="overflow-hidden hover:shadow-lg transition-shadow mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-64 lg:h-auto">
                    <img
                      src={getPostDisplayImage(featuredPost)}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-[#4d0a97]">
                      Featured
                    </Badge>
                    {featuredPost.video_url && (
                      <div className="absolute top-4 right-4">
                        <Video className="w-6 h-6 bg-red-600 text-white rounded-full p-1" />
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center space-x-4 mb-4">
                      <Badge variant="outline">{featuredPost.category}</Badge>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(featuredPost.created_at)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {featuredPost.read_time} min read
                        </div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {featuredPost.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">NJREAP Team</span>
                      </div>
                      <Link to={`/blog/${featuredPost.slug}`}>
                        <Button className="bg-[#4d0a97] hover:bg-[#a044e3]">
                          Read Article
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-8 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory
                    ? `${selectedCategory} Articles`
                    : "Latest Articles"}
                  {searchTerm && ` matching "${searchTerm}"`}
                </h2>
                {(selectedCategory || searchTerm) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchTerm("");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {displayedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">
                    No articles found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or category filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {displayedPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="relative h-48 md:h-auto">
                          <img
                            src={getPostDisplayImage(post)}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                          {post.video_url && (
                            <div className="absolute top-2 right-2">
                              <Video className="w-5 h-5 bg-red-600 text-white rounded-full p-1" />
                            </div>
                          )}
                        </div>
                        <div className="md:col-span-2 p-6">
                          <div className="flex items-center space-x-4 mb-3">
                            <Badge variant="outline">{post.category}</Badge>
                            <div className="flex items-center text-sm text-gray-500 space-x-3">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(post.created_at)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {post.read_time} min read
                              </div>
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mb-4 leading-relaxed">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">NJREAP Team</span>
                            </div>
                            <Link to={`/blog/${post.slug}`}>
                              <Button variant="ghost" size="sm">
                                Read More
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Load More */}
              {hasMorePosts && (
                <div className="text-center mt-12">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    size="lg"
                    className="border-[#4d0a97] text-[#4d0a97] hover:bg-[#4d0a97] hover:text-white"
                  >
                    Load More Articles
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryData.map((category, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                          selectedCategory === category.name
                            ? "text-[#4d0a97] bg-[#4d0a97]/5"
                            : "hover:text-[#4d0a97]"
                        }`}
                        onClick={() => {
                          setSelectedCategory(
                            selectedCategory === category.name
                              ? null
                              : category.name,
                          );
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <category.icon className="w-4 h-4" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <Badge variant="secondary">{category.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Posts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPosts.length > 0 ? (
                      recentPosts.map((post, index) => (
                        <div
                          key={index}
                          className="pb-4 border-b border-gray-100 last:border-b-0"
                        >
                          <Link to={`/blog/${post.slug}`}>
                            <h4 className="font-medium text-gray-900 mb-2 hover:text-[#4d0a97] cursor-pointer transition-colors">
                              {post.title}
                            </h4>
                          </Link>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {post.date}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No recent posts available</p>
                        <p className="text-xs mt-1">
                          Check back soon for new content!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card className="bg-gradient-to-br from-[#4d0a97] to-[#a044e3] text-white">
                <CardHeader>
                  <CardTitle className="text-white">Stay Updated</CardTitle>
                  <CardDescription className="text-gray-100">
                    Get the latest real estate insights delivered to your inbox.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Your email address"
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      className="bg-white/20 border-white/30 placeholder:text-gray-200 text-white"
                      required
                    />
                    <Button 
                      type="submit"
                      disabled={isSubscribing}
                      className="w-full bg-white text-[#4d0a97] hover:bg-gray-100"
                    >
                      {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#4d0a97] to-[#a044e3] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Need Professional Real Estate Services?
            </h2>
            <p className="text-xl text-gray-100 mb-8">
              Whether you need an appraisal or professional photography, NJREAP
              is here to help with expert services across New Jersey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white hover:text-[#4d0a97] transition-all"
                >
                  Get Free Quote
                </Button>
              </Link>
              <Link to="/services">
                <Button
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white hover:text-[#4d0a97] transition-all"
                >
                  View Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
