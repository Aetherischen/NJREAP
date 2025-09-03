import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreatePropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreatePropertyDialog = ({ open, onOpenChange, onSuccess }: CreatePropertyDialogProps) => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      toast({
        title: "Error",
        description: "Property address is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Generate a default slug from the address (just the slug part, not the full path)
      const defaultSlug = address.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const insertData = {
        property_address: address.trim(),
        agent_name: 'TBD', // Temporary value
        slug: defaultSlug,
        // Explicitly set all boolean fields to false initially
        has_photos: false,
        has_videos: false,
        has_floorplans: false,
        has_matterport: false,
        has_aerial: false,
        // Initialize with empty arrays for all media
        photos_urls: [],
        video_urls: [],
        floorplan_urls: [],
        matterport_urls: [],
        aerial_urls: [],
        floorplan_image_urls: [],
        floorplan_pdf_urls: [],
        // Set as private by default
        is_public: false,
      };


      const { error } = await supabase
        .from('property_listings')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Property listing created successfully",
      });
      
      setAddress('');
      onSuccess();
    } catch (error) {
      console.error('Create property error:', error);
      toast({
        title: "Error",
        description: "Failed to create property listing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="address">Property Address *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter property address"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Property'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePropertyDialog;