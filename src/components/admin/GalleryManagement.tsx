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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Image as ImageIcon, Upload, X, Calendar } from 'lucide-react';

// Only include service types that generate visual content for galleries
type GalleryServiceType = 'photography' | 'floor_plans' | 'virtual_tour' | 'aerial_photography';

interface MediaItem {
  type: 'image' | 'video' | 'iframe';
  url: string;
  name?: string;
}

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

const GalleryManagement = () => {
  const [collections, setCollections] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_collections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching collections",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCollection = async (collectionId) => {
    if (!confirm('Are you sure you want to delete this collection? This will also delete all images in it.')) return;

    try {
      const { error } = await supabase
        .from('gallery_collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      toast({
        title: "Collection deleted",
        description: "The gallery collection has been successfully deleted.",
      });

      fetchCollections();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting collection",
        description: error.message,
      });
    }
  };

  const openCreateDialog = () => {
    setSelectedCollection(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (collection) => {
    setSelectedCollection(collection);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading gallery collections...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gallery Management</CardTitle>
            <CardDescription>Organize your portfolio into collections with images, videos, and virtual tours</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                New Collection
              </Button>
            </DialogTrigger>
            <CollectionDialog
              collection={selectedCollection}
              onSave={fetchCollections}
              onClose={() => setIsDialogOpen(false)}
            />
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collection</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Media Items</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {collection.cover_image && (
                        <img
                          src={collection.cover_image}
                          alt={collection.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{collection.title}</div>
                        <div className="text-sm text-gray-600 line-clamp-1">{collection.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {collection.service_type && (
                      <Badge variant="secondary">
                        {collection.service_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{collection.location || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <ImageIcon className="w-4 h-4" />
                      <span>{Array.isArray(collection.media_items) ? collection.media_items.length : 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={collection.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
                      {collection.featured ? 'Featured' : 'Normal'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(collection.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(collection)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCollection(collection.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {collections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No gallery collections yet. Create your first collection!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const CollectionDialog = ({ collection, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_image: '',
    property_type: '',
    location: '',
    service_type: '' as GalleryServiceType | '',
    featured: false,
    media_items: [] as MediaItem[]
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (collection) {
      setFormData({
        ...collection,
        media_items: Array.isArray(collection.media_items) ? collection.media_items : []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        cover_image: '',
        property_type: '',
        location: '',
        service_type: '',
        featured: false,
        media_items: []
      });
    }
  }, [collection]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      let fileToUpload = file;
      
      // Convert to WebP if it's an image
      if (file.type.startsWith('image/')) {
        try {
          fileToUpload = await convertToWebP(file);
        } catch (error) {
          console.warn('Failed to convert to WebP, uploading original:', error);
          // Continue with original file if conversion fails
        }
      }

      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, fileToUpload);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('gallery').getPublicUrl(filePath);
      
      const mediaItem: MediaItem = {
        type: fileToUpload.type.startsWith('video/') ? 'video' : 'image',
        url: data.publicUrl,
        name: fileToUpload.name
      };

      setFormData(prev => ({
        ...prev,
        media_items: [...prev.media_items, mediaItem],
        cover_image: prev.cover_image || data.publicUrl
      }));

      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
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

  const addMediaItem = (type: 'image' | 'video' | 'iframe', url: string, name?: string) => {
    const mediaItem: MediaItem = { type, url, name };
    setFormData(prev => ({
      ...prev,
      media_items: [...prev.media_items, mediaItem]
    }));
  };

  const removeMediaItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media_items: prev.media_items.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please enter a collection title.",
      });
      return;
    }

    setLoading(true);

    try {
      const collectionData = {
        title: formData.title,
        description: formData.description,
        cover_image: formData.cover_image,
        property_type: formData.property_type,
        location: formData.location,
        service_type: formData.service_type || null,
        featured: formData.featured,
        media_items: formData.media_items as any, // Cast to Json type
        updated_at: new Date().toISOString()
      };

      if (collection) {
        const { error } = await supabase
          .from('gallery_collections')
          .update(collectionData)
          .eq('id', collection.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('gallery_collections')
          .insert([collectionData]);

        if (error) throw error;
      }

      toast({
        title: collection ? "Collection updated" : "Collection created",
        description: `Gallery collection has been ${collection ? 'updated' : 'created'} successfully.`,
      });

      onSave();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving collection",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{collection ? 'Edit Collection' : 'Create New Collection'}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Collection title"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Collection description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="property_type">Property Type</Label>
            <Input
              id="property_type"
              value={formData.property_type}
              onChange={(e) => setFormData(prev => ({ ...prev, property_type: e.target.value }))}
              placeholder="e.g. Residential, Commercial"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g. Bergen County, NJ"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="service_type">Service Type</Label>
          <Select value={formData.service_type} onValueChange={(value: GalleryServiceType | 'none') => setFormData(prev => ({ ...prev, service_type: value === 'none' ? '' : value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="photography">Photography</SelectItem>
              <SelectItem value="floor_plans">Floor Plans</SelectItem>
              <SelectItem value="virtual_tour">Virtual Tour</SelectItem>
              <SelectItem value="aerial_photography">Aerial Photography</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
          />
          <Label htmlFor="featured">Featured collection</Label>
        </div>

        {/* Media Items Section */}
        <div className="space-y-4">
          <Label>Media Items</Label>
          
          {/* File Upload */}
          <div>
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload images or videos</p>
                <p className="text-xs text-gray-500">Supports JPG, PNG, MP4, etc.</p>
              </div>
            </Label>
            <input
              id="file-upload"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {/* URL Input for external content */}
          <div className="space-y-2">
            <Label>Add External Content</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter URL for Matterport, YouTube, etc."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const url = e.currentTarget.value.trim();
                    if (url) {
                      addMediaItem('iframe', url);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="Enter URL"]') as HTMLInputElement;
                  const url = input?.value.trim();
                  if (url) {
                    addMediaItem('iframe', url);
                    input.value = '';
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Media Items List */}
          {formData.media_items.length > 0 && (
            <div className="space-y-2">
              <Label>Added Media ({formData.media_items.length})</Label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {formData.media_items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{item.type}</Badge>
                      <span className="text-sm truncate">{item.name || item.url}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMediaItem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || uploading}>
            {loading ? 'Saving...' : uploading ? 'Uploading...' : (collection ? 'Update' : 'Create')}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default GalleryManagement;
