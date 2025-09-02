
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Plane, Map, Video, Play, FileText } from 'lucide-react';

interface ServicePrice {
  id?: string;
  service_id: string;
  service_name: string;
  tier_name: string;
  price: number;
  description: string;
}

interface GroupedServices {
  [serviceId: string]: {
    service_name: string;
    description: string;
    icon: any;
    tiers: {
      [tierName: string]: {
        id?: string;
        price: number;
      };
    };
  };
}

const ServicePricingManagement = () => {
  const [services, setServices] = useState<ServicePrice[]>([]);
  const [groupedServices, setGroupedServices] = useState<GroupedServices>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('under_1500');

  const tierOptions = [
    { value: 'under_1500', label: 'Under 1,500 sq ft' },
    { value: '1500_to_2500', label: '1,500 - 2,500 sq ft' },
    { value: 'over_2500', label: 'Over 2,500 sq ft' },
  ];

  const defaultServices = [
    {
      service_id: 'appraisal',
      service_name: 'Appraisal Report',
      description: 'Professional real estate appraisal',
      icon: FileText,
    },
    {
      service_id: 'professional-photography',
      service_name: 'Professional Photography',
      description: 'High-quality interior and exterior photography',
      icon: Camera,
    },
    {
      service_id: 'aerial-photography',
      service_name: 'Aerial Photography',
      description: 'Drone photography with unique perspectives',
      icon: Plane,
    },
    {
      service_id: 'floor-plans',
      service_name: 'Floor Plans',
      description: 'Detailed 2D and 3D floor plans',
      icon: Map,
    },
    {
      service_id: 'virtual-tours',
      service_name: 'Virtual Tours',
      description: 'Interactive 360° virtual tours',
      icon: Video,
    },
    {
      service_id: 'real-estate-videography',
      service_name: 'Real Estate Videography',
      description: 'Professional video walkthrough and marketing videos',
      icon: Play,
    },
    {
      service_id: 'basic-photography',
      service_name: 'Basic Photography Package',
      description: 'Professional Photography + Floor Plans',
      icon: Camera,
    },
    {
      service_id: 'premium-photography',
      service_name: 'Premium Photography Package',
      description: 'Professional Photography + Aerial Photography + Floor Plans',
      icon: Camera,
    },
    {
      service_id: 'ultimate-photography',
      service_name: 'Ultimate Photography Package',
      description: 'Everything: Professional Photography + Aerial + Floor Plans + Virtual Tours',
      icon: Camera,
    },
  ];

  useEffect(() => {
    fetchServicePrices();
  }, []);

  useEffect(() => {
    groupServicesByTier();
  }, [services]);

  const fetchServicePrices = async () => {
    try {
      console.log('Fetching service prices...');
      const { data, error } = await supabase
        .from('service_pricing')
        .select('*')
        .order('service_id', { ascending: true });

      if (error) {
        console.error('Error fetching service prices:', error);
        toast.error('Failed to fetch service pricing');
        return;
      }

      console.log('Fetched service prices:', data);
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching service prices:', error);
      toast.error('Failed to fetch service pricing');
    } finally {
      setLoading(false);
    }
  };

  const groupServicesByTier = () => {
    const grouped: GroupedServices = {};
    
    defaultServices.forEach(defaultService => {
      grouped[defaultService.service_id] = {
        service_name: defaultService.service_name,
        description: defaultService.description,
        icon: defaultService.icon,
        tiers: {
          under_1500: { price: 0 },
          '1500_to_2500': { price: 0 },
          over_2500: { price: 0 },
        },
      };
    });

    services.forEach(service => {
      if (grouped[service.service_id]) {
        grouped[service.service_id].tiers[service.tier_name] = {
          id: service.id,
          price: service.price,
        };
      }
    });

    setGroupedServices(grouped);
  };

  const updateServicePrice = (serviceId: string, tierName: string, newPrice: number) => {
    setGroupedServices(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        tiers: {
          ...prev[serviceId].tiers,
          [tierName]: {
            ...prev[serviceId].tiers[tierName],
            price: newPrice,
          },
        },
      },
    }));
  };

  const saveAllPrices = async () => {
    setSaving(true);
    try {
      console.log('Starting to save service prices...');
      
      // Check authentication status first
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      if (!user) {
        toast.error('You must be logged in to update pricing');
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      console.log('User profile:', profile);
      
      if (!profile || profile.role !== 'admin') {
        toast.error('You must be an admin to update pricing');
        return;
      }

      // Prepare data for upsert
      const pricingData: any[] = [];
      
      Object.entries(groupedServices).forEach(([serviceId, serviceData]) => {
        Object.entries(serviceData.tiers).forEach(([tierName, tierData]) => {
          pricingData.push({
            service_id: serviceId,
            service_name: serviceData.service_name,
            tier_name: tierName,
            price: tierData.price,
            description: serviceData.description,
          });
        });
      });

      console.log('Pricing data to save:', pricingData);

      // Delete all existing pricing data and insert new data
      console.log('Deleting existing pricing data...');
      const { error: deleteError } = await supabase
        .from('service_pricing')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        console.error('Error deleting existing pricing:', deleteError);
        throw deleteError;
      }

      console.log('Inserting new pricing data...');
      const { error: insertError } = await supabase
        .from('service_pricing')
        .insert(pricingData);

      if (insertError) {
        console.error('Error inserting pricing data:', insertError);
        throw insertError;
      }

      toast.success('Service pricing updated successfully!');
      fetchServicePrices(); // Refresh data
    } catch (error) {
      console.error('Error saving service prices:', error);
      toast.error('Failed to save service pricing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading pricing information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Pricing Management</CardTitle>
        <p className="text-sm text-gray-600">
          Configure tiered pricing for all services based on property square footage.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tier Selection */}
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
          <Label htmlFor="tier-select" className="font-medium">
            Select Tier to Edit:
          </Label>
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-64" id="tier-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tierOptions.map((tier) => (
                <SelectItem key={tier.value} value={tier.value}>
                  {tier.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Services Grid */}
        <div className="grid gap-4">
          {Object.entries(groupedServices).map(([serviceId, serviceData]) => {
            const IconComponent = serviceData.icon;
            const currentTierData = serviceData.tiers[selectedTier];
            
            return (
              <div key={serviceId} className="flex items-center gap-4 p-4 border rounded-lg">
                <IconComponent className="w-5 h-5 text-purple-600" />
                <div className="flex-1">
                  <div className="font-medium">{serviceData.service_name}</div>
                  <div className="text-sm text-gray-600">{serviceData.description}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {tierOptions.find(t => t.value === selectedTier)?.label}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`price-${serviceId}-${selectedTier}`} className="text-sm">$</Label>
                  <Input
                    id={`price-${serviceId}-${selectedTier}`}
                    type="number"
                    value={currentTierData?.price || 0}
                    onChange={(e) => updateServicePrice(serviceId, selectedTier, parseInt(e.target.value) || 0)}
                    className="w-24"
                    min="0"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Summary Table */}
        <div className="mt-8">
          <h4 className="font-semibold mb-4">Pricing Summary</h4>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 border-b">Service</th>
                  <th className="text-center p-3 border-b">Under 1,500 sq ft</th>
                  <th className="text-center p-3 border-b">1,500 - 2,500 sq ft</th>
                  <th className="text-center p-3 border-b">Over 2,500 sq ft</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedServices).map(([serviceId, serviceData]) => (
                  <tr key={serviceId} className="border-b">
                    <td className="p-3 font-medium">{serviceData.service_name}</td>
                    <td className="p-3 text-center">${serviceData.tiers.under_1500?.price || 0}</td>
                    <td className="p-3 text-center">${serviceData.tiers['1500_to_2500']?.price || 0}</td>
                    <td className="p-3 text-center">${serviceData.tiers.over_2500?.price || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={saveAllPrices}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? 'Saving...' : 'Save All Prices'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicePricingManagement;
