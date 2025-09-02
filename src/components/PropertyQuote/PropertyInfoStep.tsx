import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, X, MapPin, Home as HomeIcon } from 'lucide-react';
import { QuoteFormData } from './PropertyQuoteModal';

interface ImageState {
  loading: boolean;
  error: boolean;
  loaded: boolean;
  url: string;
}

interface PropertyInfoStepProps {
  formData: QuoteFormData;
  updateFormData: (updates: Partial<QuoteFormData>) => void;
  onNext: () => void;
  propertyData: any;
}

const PropertyInfoStep: React.FC<PropertyInfoStepProps> = ({
  formData,
  updateFormData,
  onNext,
  propertyData
}) => {
  // State for image loading and URLs
  const [imageStates, setImageStates] = useState<ImageState[]>([
    { loading: false, error: false, loaded: false, url: '' },
    { loading: false, error: false, loaded: false, url: '' },
    { loading: false, error: false, loaded: false, url: '' },
  ]);

  // Load images from NJPR API when propertyData is available
  useEffect(() => {
    if (propertyData?.id) {
      console.log('Loading images for property:', propertyData.id);
      
      const imageEndpoints = [
        'preview',    // Property View 1 - Assessment image
        'street-map', // Property View 2 - Street map
        'tax-map'     // Property View 3 - Tax map
      ];

      imageEndpoints.forEach((endpoint, index) => {
        loadImage(index, endpoint);
      });
    }
  }, [propertyData?.id]);

  const loadImage = async (index: number, endpoint: string) => {
    console.log(`Starting to load image ${index} (${endpoint}) for property ${propertyData.id}`);
    
    // Set loading state immediately
    setImageStates(prev =>
      prev.map((state, i) =>
        i === index ? { ...state, loading: true, error: false, loaded: false, url: '' } : state,
      ),
    );

    const imageUrl = `https://yhtyhcldtytxsgiphfhn.supabase.co/functions/v1/njpr-property-images/${propertyData.id}/${endpoint}`;
    console.log(`Attempting to load image from: ${imageUrl}`);
    
    // Set a longer timeout for the loading state (30 seconds)
    const timeoutId = setTimeout(() => {
      console.log(`Image ${index} (${endpoint}) timed out after 30 seconds`);
      setImageStates(prev =>
        prev.map((state, i) =>
          i === index && state.loading && !state.loaded
            ? { ...state, loading: false, error: true, url: '' }
            : state,
        ),
      );
    }, 30000); // 30 second timeout

    try {
      // Create a new image element to test loading
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log(`Image ${index} (${endpoint}) loaded successfully`);
        clearTimeout(timeoutId);
        setImageStates(prev =>
          prev.map((state, i) =>
            i === index ? { ...state, loading: false, loaded: true, error: false, url: imageUrl } : state,
          ),
        );
      };
      
      img.onerror = (error) => {
        console.error(`Image ${index} (${endpoint}) failed to load:`, error);
        clearTimeout(timeoutId);
        setImageStates(prev =>
          prev.map((state, i) =>
            i === index ? { ...state, loading: false, error: true, loaded: false, url: '' } : state,
          ),
        );
      };
      
      // Start loading the image
      img.src = imageUrl;
      
    } catch (error) {
      console.error(`Error loading image ${index} (${endpoint}):`, error);
      clearTimeout(timeoutId);
      setImageStates(prev =>
        prev.map((state, i) =>
          i === index ? { ...state, loading: false, error: true, loaded: false, url: '' } : state,
        ),
      );
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  // Format date to user-friendly format
  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === "N/A" || !dateString.includes('-')) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  // Calculate ownership duration based on sale date and current date
  const calculateOwnerFor = (saleDate: string): string => {
    if (!saleDate || saleDate === "N/A" || !saleDate.includes('-')) return "N/A";
    
    try {
      const sale = new Date(saleDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - sale.getTime());
      const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
      return diffYears > 0 ? `${diffYears} years` : "Less than 1 year";
    } catch {
      return "N/A";
    }
  };

  // Extract and format property data from the actual API response structure
  const getPropertyInfo = () => {
    console.log("PropertyInfoStep propertyData:", propertyData);
    
    if (!propertyData) {
      return {
        address: "N/A",
        cityStateZip: "N/A", 
        owner: "N/A",
        salePrice: "N/A",
        saleDate: "N/A",
        livingSquareFeet: "N/A",
        absentee: "N/A",
        corporateOwned: "N/A",
        blockLot: "N/A",
        acreage: "N/A",
        ownerFor: "N/A"
      };
    }

    // Format numbers with commas
    const formatNumber = (value: any) => {
      if (!value || value === "N/A" || value === null || value === undefined) return "N/A";
      const num = parseInt(value.toString().replace(/[^0-9]/g, "")) || 0;
      return num.toLocaleString();
    };

    // Format currency
    const formatCurrency = (value: any) => {
      if (!value || value === "N/A" || value === null || value === undefined) return "N/A";
      const num = parseInt(value.toString().replace(/[^0-9]/g, "")) || 0;
      return `$${num.toLocaleString()}`;
    };

    // Safely get property values
    const getValue = (key: string, defaultValue = "N/A") => {
      return propertyData[key] || defaultValue;
    };

    // Build address from the address field in the response
    const address = propertyData.address || "N/A";
    
    // Extract city/state/zip from countyData if available
    const cityStateZip = propertyData.countyData?.City_State_Zip || "N/A";
    
    // Owner information from countyData
    const owner = propertyData.countyData?.Owners_Name || "N/A";

    // Sale information from countyData
    const salePrice = propertyData.countyData?.Sale_Price ? formatCurrency(propertyData.countyData.Sale_Price) : "N/A";
    const rawSaleDate = propertyData.countyData?.Sale_Date || "N/A";
    const saleDate = formatDate(rawSaleDate); // Format the date here
    
    // Living square feet from countyData
    const sqft = propertyData.countyData?.Sq_Ft || propertyData.countyData?.Living_Sqft;
    const livingSquareFeet = sqft ? `${formatNumber(sqft)} sq ft` : "N/A";
    
    // Calculate block/lot from countyData
    let blockLot = "N/A";
    const block = propertyData.countyData?.Block;
    const lot = propertyData.countyData?.Lot;
    const qualifier = propertyData.countyData?.Qual;
    if (block && lot) {
      blockLot = `${block}/${lot}`;
      if (qualifier) blockLot += `/${qualifier}`;
    }

    // Acreage from countyData
    const acres = propertyData.countyData?.Acreage;
    const acreage = acres ? `${parseFloat(acres).toFixed(4)} ac` : "N/A";

    // Absentee and Corporate ownership from countyData
    const absentee = propertyData.countyData?.Absentee ? "Yes" : "No";
    const corporateOwned = propertyData.countyData?.Corporate_Owned ? "Yes" : "No";

    return {
      address,
      cityStateZip,
      owner,
      salePrice,
      saleDate,
      livingSquareFeet,
      absentee,
      corporateOwned,
      blockLot,
      acreage,
      ownerFor: calculateOwnerFor(rawSaleDate) // Use raw date for calculation
    };
  };

  const propertyInfo = getPropertyInfo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName && formData.email && formData.phone) {
      onNext();
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    updateFormData({ phone: formatted });
  };

  const handleReferralSourceChange = (value: string) => {
    updateFormData({ 
      referralSource: value,
      referralOtherDescription: value === 'Other' ? formData.referralOtherDescription : ''
    });
  };

  const imageLabels = ['Assessment Image', 'Street Map', 'Tax Map'];

  const referralSources = [
    { value: 'google', label: 'Google Search' },
    { value: 'referral', label: 'Friend/Family Referral' },
    { value: 'social-media', label: 'Social Media' },
    { value: 'real-estate-agent', label: 'Real Estate Agent' },
    { value: 'angi', label: 'Angi' },
    { value: 'njpropertyrecords', label: 'NJPropertyRecords' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Three Property Image Containers - Across the Top */}
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            {imageStates[index].loading ? (
              <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-bounce">
                      <HomeIcon className="w-12 h-12 mx-auto text-[#4d0a97]" />
                    </div>
                    <div className="mt-2 flex justify-center space-x-1">
                      <div className="w-2 h-2 bg-[#4d0a97] rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-[#4d0a97] rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-[#4d0a97] rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                  <p className="text-sm text-[#4d0a97] mt-3 font-medium">Loading {imageLabels[index].toLowerCase()}...</p>
                </div>
              </div>
            ) : imageStates[index].error || !imageStates[index].url ? (
              <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <X className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Image unavailable</p>
                </div>
              </div>
            ) : (
              <img
                src={imageStates[index].url}
                alt={`${propertyInfo.address} - ${imageLabels[index]}`}
                className="w-full h-48 object-cover rounded"
                onLoad={() => console.log(`Image ${index} rendered successfully`)}
                onError={() => console.error(`Image ${index} failed to render`)}
              />
            )}
            <p className="text-sm text-gray-600 mt-2 text-center">
              {imageLabels[index]}
            </p>
          </div>
        ))}
      </div>

      {/* Property Info and Contact Form - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Information - Left Side */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-start space-x-3 mb-4">
            <MapPin className="w-5 h-5 text-[#4d0a97] mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {propertyInfo.address}
              </h3>
              <p className="text-sm text-gray-600">
                {propertyInfo.cityStateZip}
              </p>
              <p className="text-base font-semibold text-[#4d0a97] mt-2">
                Living Sqft: {propertyInfo.livingSquareFeet}
              </p>
            </div>
          </div>

          {/* Property Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {/* Column 1 */}
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-900">Owner(s):</span>
                <p className="text-gray-700 mt-1">
                  {propertyInfo.owner}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Sale Price:</span>
                <p className="text-gray-700 mt-1">
                  {propertyInfo.salePrice}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Sale Date:</span>
                <p className="text-gray-700 mt-1">
                  {propertyInfo.saleDate}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Owner For:</span>
                <p className="text-gray-700 mt-1">
                  {propertyInfo.ownerFor}
                </p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-900">Absentee:</span>
                <p className="text-gray-700 mt-1">
                  {propertyInfo.absentee}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Corporate Owned:</span>
                <p className="text-gray-700 mt-1">
                  {propertyInfo.corporateOwned}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Block/Lot/Qual:</span>
                <p className="text-gray-700 mt-1">
                  {propertyInfo.blockLot}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Acreage:</span>
                <p className="text-gray-700 mt-1">
                  {propertyInfo.acreage}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form - Right Side */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateFormData({ firstName: e.target.value })}
                placeholder="John"
                required
                autoComplete="given-name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateFormData({ lastName: e.target.value })}
                placeholder="Smith"
                required
                autoComplete="family-name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="(555) 123-4567"
              required
              autoComplete="tel"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              placeholder="john@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => updateFormData({ company: e.target.value })}
              placeholder="Your company name"
              autoComplete="organization"
            />
          </div>

          <div>
            <Label htmlFor="referralSource">How Did You Hear About Us?</Label>
            <Select value={formData.referralSource} onValueChange={handleReferralSourceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {referralSources.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.referralSource === 'Other' && (
            <div>
              <Label htmlFor="referralOtherDescription">Please Describe</Label>
              <Input
                id="referralOtherDescription"
                value={formData.referralOtherDescription}
                onChange={(e) => updateFormData({ referralOtherDescription: e.target.value })}
                placeholder="Please describe how you heard about us"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-[#4d0a97] hover:bg-[#a044e3]">
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
};

export default PropertyInfoStep;
