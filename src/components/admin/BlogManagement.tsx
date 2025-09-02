import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Clock, Upload, Calendar, Video, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Predefined categories that match the blog page
const BLOG_CATEGORIES = [
  'Market Analysis',
  'Homeowner Tips', 
  'Photography Tips',
  'Industry Standards',
  'Financial Tips',
  'Technology',
  'History'
];

// Helper function to convert image to WebP
const convertToWebP = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now()
          });
          resolve(webpFile);
        } else {
          reject(new Error('Failed to convert image to WebP'));
        }
      }, 'image/webp', 0.8);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        variant: "destructive",
        title: "Error fetching blog posts",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "The blog post has been successfully deleted.",
      });

      fetchPosts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting post",
        description: error.message,
      });
    }
  };

  const togglePublishStatus = async (post) => {
    try {
      const wasPublished = post.published;
      const willBePublished = !post.published;

      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          published: willBePublished,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (error) throw error;

      // If we're publishing for the first time, send notifications
      if (!wasPublished && willBePublished) {
        console.log('Sending blog notification for newly published post:', post.title);
        try {
          const { error: notificationError } = await supabase.functions.invoke('send-blog-notification', {
            body: {
              post_id: post.id,
              title: post.title,
              content: post.content,
              excerpt: post.excerpt,
              slug: post.slug
            }
          });

          if (notificationError) {
            console.error('Error sending blog notification:', notificationError);
            toast({
              variant: "destructive",
              title: "Post published but notification failed",
              description: "The post was published but email notifications could not be sent.",
            });
          } else {
            toast({
              title: "Post published and notifications sent",
              description: "The blog post has been published and subscribers have been notified.",
            });
          }
        } catch (notificationError) {
          console.error('Error invoking notification function:', notificationError);
          toast({
            variant: "destructive",
            title: "Post published but notification failed",
            description: "The post was published but email notifications could not be sent.",
          });
        }
      } else {
        toast({
          title: `Post ${willBePublished ? 'published' : 'unpublished'}`,
          description: `The blog post has been ${willBePublished ? 'published' : 'unpublished'}.`,
        });
      }

      fetchPosts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating post",
        description: error.message,
      });
    }
  };

  const openCreateDialog = () => {
    setSelectedPost(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (post) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPost(null);
  };

  const handlePostSaved = () => {
    fetchPosts();
    handleDialogClose();
  };

  const extractYouTubeVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading blog posts...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Blog Management</CardTitle>
            <CardDescription>Create and manage blog posts for your website</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <BlogPostDialog
              post={selectedPost}
              onSave={handlePostSaved}
              onClose={handleDialogClose}
              currentUser={user}
              extractYouTubeVideoId={extractYouTubeVideoId}
              getYouTubeThumbnail={getYouTubeThumbnail}
            />
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Read Time</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => {
                const videoId = post.video_url ? extractYouTubeVideoId(post.video_url) : null;
                const displayImage = videoId ? getYouTubeThumbnail(videoId) : post.featured_image;
                
                return (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {displayImage && (
                          <div className="relative">
                            <img
                              src={displayImage}
                              alt={post.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            {videoId && (
                              <Video className="w-4 h-4 absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5" />
                            )}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-sm text-gray-600 line-clamp-1">{post.excerpt}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={post.published ? 'bg-green-100 text-green-800 cursor-pointer' : 'bg-yellow-100 text-yellow-800 cursor-pointer'}
                        onClick={() => togglePublishStatus(post)}
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.read_time} min
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(post)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePost(post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {posts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No blog posts yet. Create your first post!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const BlogPostDialog = ({ post, onSave, onClose, currentUser, extractYouTubeVideoId, getYouTubeThumbnail }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    featured_image: '',
    video_url: '',
    published: false,
    read_time: 5
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'
  const { toast } = useToast();

  useEffect(() => {
    if (post) {
      setFormData(post);
      // Set media type based on existing data
      if (post.video_url) {
        setMediaType('video');
      } else {
        setMediaType('image');
      }
    } else {
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: '',
        featured_image: '',
        video_url: '',
        published: false,
        read_time: 5
      });
      setMediaType('image');
    }
  }, [post]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const handleTitleChange = (title) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content,
      read_time: calculateReadTime(content)
    }));
  };

  const handleVideoUrlChange = (url) => {
    setFormData(prev => ({ ...prev, video_url: url }));
    
    // Auto-generate thumbnail from YouTube URL
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      const thumbnailUrl = getYouTubeThumbnail(videoId);
      setFormData(prev => ({ ...prev, featured_image: thumbnailUrl }));
    }
  };

  const handleMediaTypeChange = (type) => {
    setMediaType(type);
    if (type === 'video') {
      setFormData(prev => ({ ...prev, featured_image: '' }));
    } else {
      setFormData(prev => ({ ...prev, video_url: '' }));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      let fileToUpload = file;
      
      // Convert to WebP
      try {
        fileToUpload = await convertToWebP(file);
      } catch (error) {
        console.warn('Failed to convert to WebP, uploading original:', error);
        // Continue with original file if conversion fails
      }

      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, fileToUpload);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      
      setFormData(prev => ({
        ...prev,
        featured_image: data.publicUrl
      }));

      toast({
        title: "Image uploaded",
        description: "Your featured image has been uploaded successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    console.log('=== BLOG SAVE DEBUG START ===');
    console.log('Form data:', formData);
    console.log('Current user:', currentUser);
    console.log('Post (edit mode):', post);

    // Basic validation
    if (!formData.title?.trim()) {
      console.log('Validation failed: No title');
      toast({
        variant: "destructive",
        title: "Missing title",
        description: "Please enter a title for your blog post.",
      });
      return;
    }

    if (!formData.content?.trim()) {
      console.log('Validation failed: No content');
      toast({
        variant: "destructive",
        title: "Missing content",
        description: "Please enter some content for your blog post.",
      });
      return;
    }

    if (!formData.category?.trim()) {
      console.log('Validation failed: No category');
      toast({
        variant: "destructive",
        title: "Missing category",
        description: "Please select a category for your blog post.",
      });
      return;
    }

    if (!currentUser?.id) {
      console.log('Validation failed: No user');
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to create blog posts.",
      });
      return;
    }

    setLoading(true);
    console.log('Starting database operation...');

    try {
      const wasPublished = post?.published || false;
      const willBePublished = Boolean(formData.published);

      const postData = {
        title: formData.title.trim(),
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt?.trim() || '',
        content: formData.content.trim(),
        category: formData.category.trim(),
        featured_image: formData.featured_image || '',
        video_url: formData.video_url || '',
        published: willBePublished,
        read_time: formData.read_time || calculateReadTime(formData.content),
        author_id: currentUser.id,
        updated_at: new Date().toISOString()
      };

      console.log('Prepared post data:', postData);

      let result;
      if (post?.id) {
        console.log('Updating existing post with ID:', post.id);
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id)
          .select();
      } else {
        console.log('Creating new post...');
        result = await supabase
          .from('blog_posts')
          .insert([postData])
          .select();
      }

      console.log('Database result:', result);

      if (result.error) {
        console.error('Database error:', result.error);
        throw result.error;
      }

      const savedPost = result.data[0];

      // Send notifications if this is a newly published post
      if (!wasPublished && willBePublished) {
        console.log('Sending blog notification for newly published post:', savedPost.title);
        try {
          const { error: notificationError } = await supabase.functions.invoke('send-blog-notification', {
            body: {
              post_id: savedPost.id,
              title: savedPost.title,
              content: savedPost.content,
              excerpt: savedPost.excerpt,
              slug: savedPost.slug
            }
          });

          if (notificationError) {
            console.error('Error sending blog notification:', notificationError);
            toast({
              title: post?.id ? "Post updated" : "Post created",
              description: `Blog post has been ${post?.id ? 'updated' : 'created'} successfully, but email notifications could not be sent.`,
            });
          } else {
            toast({
              title: post?.id ? "Post updated and notifications sent" : "Post created and notifications sent",
              description: `Blog post has been ${post?.id ? 'updated' : 'created'} successfully and subscribers have been notified.`,
            });
          }
        } catch (notificationError) {
          console.error('Error invoking notification function:', notificationError);
          toast({
            title: post?.id ? "Post updated" : "Post created",
            description: `Blog post has been ${post?.id ? 'updated' : 'created'} successfully, but email notifications could not be sent.`,
          });
        }
      } else {
        toast({
          title: post?.id ? "Post updated" : "Post created",
          description: `Blog post has been ${post?.id ? 'updated' : 'created'} successfully.`,
        });
      }

      console.log('Success! Post saved successfully');
      onSave();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        variant: "destructive",
        title: "Error saving post",
        description: error?.message || 'An unexpected error occurred while saving the post.',
      });
    } finally {
      setLoading(false);
      console.log('=== BLOG SAVE DEBUG END ===');
    }
  };

  const videoId = formData.video_url ? extractYouTubeVideoId(formData.video_url) : null;
  const displayImage = videoId ? getYouTubeThumbnail(videoId) : formData.featured_image;

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{post ? 'Edit Post' : 'Create New Post'}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Blog post title"
          />
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="url-slug"
          />
        </div>

        <div>
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            placeholder="Brief description of the post"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {BLOG_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Write your blog post content here..."
            rows={15}
            className="min-h-[300px]"
          />
          <p className="text-sm text-gray-500 mt-1">
            Estimated read time: {formData.read_time} minute{formData.read_time !== 1 ? 's' : ''}
          </p>
        </div>

        <div>
          <Label>Media Type</Label>
          <div className="flex space-x-4 mt-2">
            <Button
              type="button"
              variant={mediaType === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleMediaTypeChange('image')}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Image
            </Button>
            <Button
              type="button"
              variant={mediaType === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleMediaTypeChange('video')}
            >
              <Video className="w-4 h-4 mr-2" />
              YouTube Video
            </Button>
          </div>
        </div>

        {mediaType === 'video' ? (
          <div>
            <Label htmlFor="video-url">YouTube Video URL</Label>
            <Input
              id="video-url"
              value={formData.video_url}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {videoId && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Video Preview:</p>
                <div className="relative w-32 h-20">
                  <img
                    src={getYouTubeThumbnail(videoId)}
                    alt="YouTube thumbnail"
                    className="w-full h-full object-cover rounded border"
                  />
                  <Video className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white bg-red-600 rounded-full p-1" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <Label htmlFor="featured-image">Featured Image</Label>
            <div className="space-y-2">
              {displayImage && (
                <img
                  src={displayImage}
                  alt="Featured"
                  className="w-32 h-20 object-cover rounded border"
                />
              )}
              <div>
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload featured image</p>
                  </div>
                </Label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={formData.published}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
          />
          <Label htmlFor="published">Publish immediately</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || uploading}>
            {loading ? 'Saving...' : uploading ? 'Uploading...' : (post ? 'Update' : 'Create')}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default BlogManagement;
