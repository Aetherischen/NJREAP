import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneNumber, unformatPhoneNumber } from '@/utils/phoneFormatter';
import { Upload, Plus, X, FileImage, FileText, Video, Camera, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';

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
  created_at: string;
  updated_at: string;
  photos_urls?: string[];
  video_urls?: string[];
  floorplan_urls?: string[];
  matterport_urls?: string[];
  aerial_urls?: string[];
  primary_photos_urls?: string[];
};

interface PropertyListingEditProps {
  listing: PropertyListing;
  onSuccess: () => void;
}

const PropertyListingEdit: React.FC<PropertyListingEditProps> = ({ listing, onSuccess }) => {
  // Safe initialization to prevent iteration errors
  const safeArrayInit = (arr: string[] | null | undefined): string[] => 
    Array.isArray(arr) ? arr : [];

  const [formData, setFormData] = useState({
    property_address: listing?.property_address || '',
    property_city: (listing as any)?.property_city || '',
    property_state: (listing as any)?.property_state || 'NJ',
    property_zip: (listing as any)?.property_zip || '',
    agent_name: listing?.agent_name || '',
    agent_phone: listing?.agent_phone || '',
    agent_email: listing?.agent_email || '',
    agent_headshot_url: listing?.agent_headshot_url || '',
    agent_facebook: (listing as any)?.agent_facebook || '',
    agent_instagram: (listing as any)?.agent_instagram || '',
    agent_x: (listing as any)?.agent_x || '',
    agent_linkedin: (listing as any)?.agent_linkedin || '',
    agent_youtube: (listing as any)?.agent_youtube || '',
    agent_pinterest: (listing as any)?.agent_pinterest || '',
    brokerage_name: listing?.brokerage_name || '',
    brokerage_logo_url: listing?.brokerage_logo_url || '',
    bedrooms: (listing as any)?.bedrooms || '',
    bathrooms: (listing as any)?.bathrooms || '',
    sqft: (listing as any)?.sqft || '',
    acreage: (listing as any)?.acreage || '',
    year_built: (listing as any)?.year_built || '',
    block: (listing as any)?.block || '',
    lot: (listing as any)?.lot || '',
    qual: (listing as any)?.qual || '',
    tax_assessment: (listing as any)?.tax_assessment || '',
    tax_assessment_year: (listing as any)?.tax_assessment_year || '',
    primary_photo_url: (listing as any)?.primary_photo_url || '',
    primary_photos_urls: (listing as any)?.primary_photos_urls || [],
    is_public: listing?.is_public || false,
    slug: listing?.slug || '',
    photos_urls: safeArrayInit(listing?.photos_urls),
    video_urls: safeArrayInit(listing?.video_urls),
    floorplan_urls: safeArrayInit(listing?.floorplan_urls),
    floorplan_image_urls: safeArrayInit((listing as any)?.floorplan_image_urls),
    floorplan_pdf_urls: safeArrayInit((listing as any)?.floorplan_pdf_urls),
    matterport_urls: safeArrayInit(listing?.matterport_urls),
    aerial_urls: safeArrayInit(listing?.aerial_urls),
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newMatterportUrl, setNewMatterportUrl] = useState('');

  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const aerialFileInputRef = useRef<HTMLInputElement>(null);
  const floorplanImageFileInputRef = useRef<HTMLInputElement>(null);
  const floorplanPdfFileInputRef = useRef<HTMLInputElement>(null);
  const headshotFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;
    
    // Format phone number automatically
    if (name === 'agent_phone') {
      processedValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
  };

  const uploadFile = async (file: File, folder: string = ''): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Create property-specific folder structure: {property_address}/{media_type}/{filename}
    const propertyFolder = formData.property_address
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase();
    
    const filePath = folder ? `${propertyFolder}/${folder}/${fileName}` : `${propertyFolder}/${fileName}`;

    console.log('Uploading file to:', filePath, 'for property:', propertyFolder);

    const { data, error: uploadError } = await supabase.storage
      .from('property_media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('Upload successful:', data);

    const { data: { publicUrl } } = supabase.storage
      .from('property_media')
      .getPublicUrl(filePath);

    console.log('Public URL:', publicUrl);
    return publicUrl;
  };

  const handleFileUpload = async (files: FileList | null, type: 'photos' | 'aerial' | 'floorplan_images' | 'floorplan_pdfs' | 'headshot' | 'logo') => {
    console.log('handleFileUpload called with:', { files: files?.length, type });
    
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    const allowedTypes = {
      photos: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      aerial: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      floorplan_images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      floorplan_pdfs: ['application/pdf'],
      headshot: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      logo: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    };

    const maxSize = (type === 'floorplan_pdfs') ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for PDFs, 5MB for images

    // Image compression function
    const compressImage = (file: File): Promise<File> => {
      return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
          resolve(file); // Not an image, return as-is
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // Calculate new dimensions to keep aspect ratio
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          let { width, height } = img;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = (width * MAX_HEIGHT) / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to WebP with quality adjustment
          let quality = 0.8;
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  if (blob.size <= maxSize || quality <= 0.1) {
                    const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                      type: 'image/webp',
                      lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                  } else {
                    quality -= 0.1;
                    tryCompress();
                  }
                } else {
                  reject(new Error('Failed to compress image'));
                }
              },
              'image/webp',
              quality
            );
          };

          tryCompress();
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      });
    };

    setIsUploading(true);
    try {
      console.log('Starting uploads for', files.length, 'files');
      
      const uploadPromises = Array.from(files).map(async (file, index) => {
        console.log(`Processing file ${index + 1}:`, { name: file.name, type: file.type, size: file.size });
        
        // Validate file type
        if (!allowedTypes[type].includes(file.type)) {
          throw new Error(`Invalid file type for ${type}. File: ${file.name}, Type: ${file.type}. Allowed: ${allowedTypes[type].join(', ')}`);
        }

        // Compress image files before size validation
        let processedFile = file;
        if (file.type.startsWith('image/')) {
          console.log(`Compressing image: ${file.name}`);
          processedFile = await compressImage(file);
          console.log(`Compression complete. Original: ${(file.size / 1024 / 1024).toFixed(2)}MB, Compressed: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
        }

        // Validate file size after compression
        if (processedFile.size > maxSize) {
          throw new Error(`File size too large for ${processedFile.name}. Size: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB, Maximum: ${maxSize / 1024 / 1024}MB`);
        }

        return uploadFile(processedFile, type);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      console.log('All uploads completed:', uploadedUrls);

      if (type === 'headshot') {
        setFormData(prev => ({ ...prev, agent_headshot_url: uploadedUrls[0] }));
      } else if (type === 'logo') {
        setFormData(prev => ({ ...prev, brokerage_logo_url: uploadedUrls[0] }));
      } else {
        // Map types to form data keys
        const typeToKey = {
          photos: 'photos_urls',
          aerial: 'aerial_urls',
          floorplan_images: 'floorplan_image_urls',
          floorplan_pdfs: 'floorplan_pdf_urls'
        };
        
        const urlsKey = typeToKey[type] as keyof typeof formData;
        setFormData(prev => {
          const newData = {
            ...prev,
            [urlsKey]: [...(prev[urlsKey] as string[]), ...uploadedUrls]
          };
          console.log('Updated formData:', urlsKey, newData[urlsKey]);
          return newData;
        });
      }

      // Clear the file input to allow selecting the same files again
      if (photoFileInputRef.current) photoFileInputRef.current.value = '';
      if (aerialFileInputRef.current) aerialFileInputRef.current.value = '';
      if (floorplanImageFileInputRef.current) floorplanImageFileInputRef.current.value = '';
      if (floorplanPdfFileInputRef.current) floorplanPdfFileInputRef.current.value = '';
      if (headshotFileInputRef.current) headshotFileInputRef.current.value = '';
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';

      toast({
        title: "Success",
        description: `${uploadedUrls.length} ${type.replace('_', ' ')} uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeMediaItem = (type: 'photos_urls' | 'video_urls' | 'floorplan_urls' | 'floorplan_image_urls' | 'floorplan_pdf_urls' | 'matterport_urls' | 'aerial_urls', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: (prev[type] as string[]).filter((_, i) => i !== index)
    }));
  };

  const removeFile = async (type: 'agent_headshot_url' | 'brokerage_logo_url') => {
    setFormData(prev => ({ ...prev, [type]: '' }));
  };

  const addVideoUrl = () => {
    if (newVideoUrl.trim()) {
      // Basic YouTube URL validation
      const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (!youtubeRegex.test(newVideoUrl)) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid YouTube URL",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        video_urls: [...prev.video_urls, newVideoUrl.trim()]
      }));
      setNewVideoUrl('');
    }
  };

  const addMatterportUrl = () => {
    if (newMatterportUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        matterport_urls: [...prev.matterport_urls, newMatterportUrl.trim()]
      }));
      setNewMatterportUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    console.log('Saving property listing with data:', {
      ...formData,
      photos_urls: formData.photos_urls?.length,
      social_accounts: {
        facebook: formData.agent_facebook,
        instagram: formData.agent_instagram,
        x: formData.agent_x,
        linkedin: formData.agent_linkedin,
        youtube: formData.agent_youtube,
        pinterest: formData.agent_pinterest
      }
    });

    try {
      // Sanitize social media URLs - remove empty strings
      const sanitizedData = {
        property_address: formData.property_address,
        property_city: formData.property_city?.trim() || null,
        property_state: formData.property_state || null,
        property_zip: formData.property_zip?.trim() || null,
        agent_name: formData.agent_name,
        agent_phone: formData.agent_phone?.trim() || null,
        agent_email: formData.agent_email?.trim() || null,
        agent_headshot_url: formData.agent_headshot_url?.trim() || null,
        agent_facebook: formData.agent_facebook?.trim() || null,
        agent_instagram: formData.agent_instagram?.trim() || null,
        agent_x: formData.agent_x?.trim() || null,
        agent_linkedin: formData.agent_linkedin?.trim() || null,
        agent_youtube: formData.agent_youtube?.trim() || null,
        agent_pinterest: formData.agent_pinterest?.trim() || null,
        brokerage_name: formData.brokerage_name?.trim() || null,
        brokerage_logo_url: formData.brokerage_logo_url?.trim() || null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        sqft: formData.sqft ? parseInt(formData.sqft) : null,
        acreage: formData.acreage ? parseFloat(formData.acreage) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        block: formData.block?.trim() || null,
        lot: formData.lot?.trim() || null,
        qual: formData.qual?.trim() || null,
        tax_assessment: formData.tax_assessment ? parseFloat(formData.tax_assessment) : null,
        tax_assessment_year: formData.tax_assessment_year ? parseInt(formData.tax_assessment_year) : null,
        primary_photo_url: formData.primary_photo_url?.trim() || null,
        primary_photos_urls: formData.primary_photos_urls || [],
        is_public: formData.is_public,
        slug: formData.slug?.trim() || null,
        photos_urls: formData.photos_urls || [],
        video_urls: formData.video_urls || [],
        floorplan_urls: formData.floorplan_urls || [],
        floorplan_image_urls: formData.floorplan_image_urls || [],
        floorplan_pdf_urls: formData.floorplan_pdf_urls || [],
        matterport_urls: formData.matterport_urls || [],
        aerial_urls: formData.aerial_urls || [],
      };

      console.log('Sanitized data for update:', sanitizedData);

      const { error } = await supabase
        .from('property_listings')
        .update(sanitizedData)
        .eq('id', listing.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Property listing updated successfully');

      toast({
        title: "Success",
        description: "Property listing updated successfully",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Save error details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update property listing",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
          <CardDescription>Basic property details and listing settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="property_address">Property Address</Label>
              <Input
                id="property_address"
                name="property_address"
                value={formData.property_address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="/showcase/property-name"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_public"
              name="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
            />
            <Label htmlFor="is_public">Make listing public</Label>
          </div>
        </CardContent>
      </Card>

      {/* Agent Information */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
          <CardDescription>Agent contact details and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="agent_name">Agent Name</Label>
              <Input
                id="agent_name"
                name="agent_name"
                value={formData.agent_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="agent_phone">Agent Phone</Label>
              <Input
                id="agent_phone"
                name="agent_phone"
                value={formData.agent_phone}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="agent_email">Agent Email</Label>
              <Input
                id="agent_email"
                name="agent_email"
                type="email"
                value={formData.agent_email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="brokerage_name">Brokerage Name</Label>
              <Input
                id="brokerage_name"
                name="brokerage_name"
                value={formData.brokerage_name}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agent Headshot */}
            <div>
              <Label>Agent Headshot</Label>
              <div className="mt-2">
                {formData.agent_headshot_url ? (
                  <div className="space-y-2">
                    <img
                      src={formData.agent_headshot_url}
                      alt="Agent headshot"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => removeFile('agent_headshot_url')}>
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => headshotFileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Headshot
                    </Button>
                    <input
                      ref={headshotFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files, 'headshot')}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Brokerage Logo */}
            <div>
              <Label>Brokerage Logo</Label>
              <div className="mt-2">
                {formData.brokerage_logo_url ? (
                  <div className="space-y-2">
                    <img
                      src={formData.brokerage_logo_url}
                      alt="Brokerage logo"
                      className="w-32 h-20 object-contain rounded-lg border"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => removeFile('brokerage_logo_url')}>
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoFileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files, 'logo')}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Social Media Links */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Social Media Accounts</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agent_facebook" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Label>
                <Input
                  id="agent_facebook"
                  name="agent_facebook"
                  value={formData.agent_facebook}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/username"
                />
              </div>
              <div>
                <Label htmlFor="agent_instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="agent_instagram"
                  name="agent_instagram"
                  value={formData.agent_instagram}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div>
                <Label htmlFor="agent_x" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  X (Twitter)
                </Label>
                <Input
                  id="agent_x"
                  name="agent_x"
                  value={formData.agent_x}
                  onChange={handleInputChange}
                  placeholder="https://x.com/username"
                />
              </div>
              <div>
                <Label htmlFor="agent_linkedin" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Label>
                <Input
                  id="agent_linkedin"
                  name="agent_linkedin"
                  value={formData.agent_linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <Label htmlFor="agent_youtube" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  YouTube
                </Label>
                <Input
                  id="agent_youtube"
                  name="agent_youtube"
                  value={formData.agent_youtube}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/@username"
                />
              </div>
              <div>
                <Label htmlFor="agent_pinterest" className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  Pinterest
                </Label>
                <Input
                  id="agent_pinterest"
                  name="agent_pinterest"
                  value={formData.agent_pinterest}
                  onChange={handleInputChange}
                  placeholder="https://pinterest.com/username"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>Basic property information and specifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="property_city">City</Label>
              <Input
                id="property_city"
                name="property_city"
                value={formData.property_city}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="property_state">State</Label>
              <Select value={formData.property_state} onValueChange={(value) => setFormData(prev => ({ ...prev, property_state: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NJ">New Jersey</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="PA">Pennsylvania</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="property_zip">ZIP Code</Label>
              <Input
                id="property_zip"
                name="property_zip"
                value={formData.property_zip}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                step="0.5"
                value={formData.bathrooms}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="sqft">Square Feet</Label>
              <Input
                id="sqft"
                name="sqft"
                type="number"
                value={formData.sqft}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="acreage">Acreage</Label>
              <Input
                id="acreage"
                name="acreage"
                type="number"
                step="0.01"
                value={formData.acreage}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="year_built">Year Built</Label>
              <Input
                id="year_built"
                name="year_built"
                type="number"
                value={formData.year_built}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="block">Block</Label>
              <Input
                id="block"
                name="block"
                value={formData.block}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="lot">Lot</Label>
              <Input
                id="lot"
                name="lot"
                value={formData.lot}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="qual">Qualifier</Label>
              <Input
                id="qual"
                name="qual"
                value={formData.qual}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tax_assessment">Tax Assessment ($)</Label>
              <Input
                id="tax_assessment"
                name="tax_assessment"
                type="number"
                step="0.01"
                value={formData.tax_assessment}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="tax_assessment_year">Assessment Year</Label>
              <Input
                id="tax_assessment_year"
                name="tax_assessment_year"
                type="number"
                value={formData.tax_assessment_year}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Content */}
      <Card>
        <CardHeader>
          <CardTitle>Media Content</CardTitle>
          <CardDescription>Upload photos, videos, documents, and other media for this property</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Photo Selection - Enhanced for Multiple Photos */}
          {formData.photos_urls.length > 0 && (
            <div>
              <Label className="text-base font-medium">Primary Photos (Max 5)</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Select up to 5 photos to cycle through on the main showcase. First selected becomes the default.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.photos_urls.map((url, index) => {
                  const isSelected = formData.primary_photos_urls.includes(url);
                  const selectedIndex = formData.primary_photos_urls.indexOf(url);
                  
                  return (
                    <div 
                      key={index} 
                      className={`relative cursor-pointer border-2 rounded-lg transition-all ${
                        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground'
                      }`}
                      onClick={() => {
                        const currentSelected = [...formData.primary_photos_urls];
                        if (isSelected) {
                          // Remove from selection
                          const newSelected = currentSelected.filter(photoUrl => photoUrl !== url);
                          setFormData(prev => ({ ...prev, primary_photos_urls: newSelected }));
                        } else if (currentSelected.length < 5) {
                          // Add to selection (max 5)
                          setFormData(prev => ({ ...prev, primary_photos_urls: [...currentSelected, url] }));
                        }
                      }}
                    >
                      <img
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 rounded-lg flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                            PRIMARY {selectedIndex + 1}
                          </div>
                        </div>
                      )}
                      {formData.primary_photos_urls.length >= 5 && !isSelected && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-medium">MAX REACHED</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {formData.primary_photos_urls.length > 0 && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Selected {formData.primary_photos_urls.length}/5:</strong> These photos will cycle automatically on the showcase page.
                  </p>
                </div>
              )}
            </div>
          )}
          {/* Photos */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileImage className="h-5 w-5" />
              <Label className="text-base font-medium">Photos ({formData.photos_urls.length})</Label>
            </div>
            <div className="space-y-4">
              {formData.photos_urls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.photos_urls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMediaItem('photos_urls', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => photoFileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Photos
              </Button>
              <input
                ref={photoFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files, 'photos')}
                className="hidden"
              />
            </div>
          </div>

          {/* Videos */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-5 w-5" />
              <Label className="text-base font-medium">Videos ({formData.video_urls.length})</Label>
            </div>
            <div className="space-y-4">
              {formData.video_urls.length > 0 && (
                <div className="space-y-2">
                  {formData.video_urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <span className="flex-1 text-sm truncate">{url}</span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMediaItem('video_urls', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter YouTube URL"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                />
                <Button type="button" onClick={addVideoUrl}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Floorplans */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5" />
              <Label className="text-base font-medium">Floorplans</Label>
            </div>

            {/* Floorplan Images */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Images ({formData.floorplan_image_urls.length})</Label>
              <div className="space-y-4 mt-2">
                {formData.floorplan_image_urls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.floorplan_image_urls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Floorplan Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeMediaItem('floorplan_image_urls', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => floorplanImageFileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Floorplan Images
                </Button>
                <input
                  ref={floorplanImageFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files, 'floorplan_images')}
                  className="hidden"
                />
              </div>
            </div>

            {/* Floorplan PDFs */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">PDFs ({formData.floorplan_pdf_urls.length})</Label>
              <div className="space-y-4 mt-2">
                {formData.floorplan_pdf_urls.length > 0 && (
                  <div className="space-y-2">
                    {formData.floorplan_pdf_urls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
                        <FileText className="h-4 w-4 text-red-600" />
                        <span className="flex-1 text-sm">Floorplan PDF {index + 1}</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeMediaItem('floorplan_pdf_urls', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => floorplanPdfFileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Floorplan PDFs
                </Button>
                <input
                  ref={floorplanPdfFileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files, 'floorplan_pdfs')}
                  className="hidden"
                />
              </div>
            </div>

            {/* Legacy Floorplans (for backward compatibility) */}
            {formData.floorplan_urls.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Legacy Floorplans ({formData.floorplan_urls.length})</Label>
                <div className="space-y-2 mt-2">
                  {formData.floorplan_urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <FileText className="h-4 w-4" />
                      <span className="flex-1 text-sm">Legacy Floorplan {index + 1}</span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMediaItem('floorplan_urls', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Matterport */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 border rounded" />
              <Label className="text-base font-medium">Matterport ({formData.matterport_urls.length})</Label>
            </div>
            <div className="space-y-4">
              {formData.matterport_urls.length > 0 && (
                <div className="space-y-2">
                  {formData.matterport_urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <span className="flex-1 text-sm truncate">{url}</span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMediaItem('matterport_urls', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Matterport URL or iframe"
                  value={newMatterportUrl}
                  onChange={(e) => setNewMatterportUrl(e.target.value)}
                />
                <Button type="button" onClick={addMatterportUrl}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Aerial */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Camera className="h-5 w-5" />
              <Label className="text-base font-medium">Aerial Photos ({formData.aerial_urls.length})</Label>
            </div>
            <div className="space-y-4">
              {formData.aerial_urls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.aerial_urls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Aerial ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMediaItem('aerial_urls', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => aerialFileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Aerial Photos
              </Button>
              <input
                ref={aerialFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files, 'aerial')}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving || isUploading}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default PropertyListingEdit;