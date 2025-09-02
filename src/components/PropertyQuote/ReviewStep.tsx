
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Calendar, Check, Tag } from 'lucide-react';
import { QuoteFormData } from './PropertyQuoteModal';
import { QuotePayload } from './QuotePayload';
import { supabase } from '@/integrations/supabase/client';

interface ReviewStepProps {
  formData: QuoteFormData;
  onNext: () => void;
  onBack: () => void;
  propertyData: any;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  onNext,
  onBack,
  propertyData
}) => {
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [servicePrices, setServicePrices] = useState<any>({});
  const [discountCode, setDiscountCode] = useState('');
  const [isValidDiscount, setIsValidDiscount] = useState(false);
  const [discountData, setDiscountData] = useState<any>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

  // Fetch service prices from database based on property square footage
  useEffect(() => {
    fetchServicePrices();
  }, [propertyData, formData.userEnteredSqFt]);

  // Check discount code validity
  useEffect(() => {
    if (discountCode.trim()) {
      const timeoutId = setTimeout(() => {
        validateDiscountCode(discountCode.trim().toUpperCase());
      }, 500); // Add debounce to prevent rapid API calls
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsValidDiscount(false);
      setDiscountData(null);
      setIsValidatingDiscount(false);
    }
  }, [discountCode]);

  const validateDiscountCode = async (code: string) => {
    setIsValidatingDiscount(true);
    try {
      const { data, error } = await supabase
        .from('discount_codes' as any)
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setIsValidDiscount(false);
        setDiscountData(null);
      } else {
        setIsValidDiscount(true);
        setDiscountData(data);
      }
    } catch (error) {
      console.error('Error validating discount code:', error);
      setIsValidDiscount(false);
      setDiscountData(null);
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const getTierFromSquareFootage = (sqFt: number): string => {
    if (sqFt < 1500) return 'under_1500';
    if (sqFt <= 2500) return '1500_to_2500';
    return 'over_2500';
  };

  const fetchServicePrices = async () => {
    try {
      // Determine square footage - same logic as QuoteDetailsStep
      let livingSqFt = parseInt(propertyData?.countyData?.Sq_Ft?.toString().replace(/[^0-9]/g, '') || '0') || 0;
      
      // If county data is insufficient, use user-entered value
      if (livingSqFt === 0 || livingSqFt < 200) {
        livingSqFt = parseInt(formData.userEnteredSqFt) || 1500; // Default to middle tier if no data
      }

      const tier = getTierFromSquareFootage(livingSqFt);

      const { data, error } = await supabase
        .from('service_pricing')
        .select('*')
        .eq('tier_name', tier);

      if (error) {
        console.error('Error fetching service prices:', error);
        return;
      }

      const pricesMap = data.reduce((acc: any, item: any) => {
        acc[item.service_id] = item.price;
        return acc;
      }, {});

      setServicePrices(pricesMap);
    } catch (error) {
      console.error('Error fetching service prices:', error);
    }
  };

  const handleTermsChange = (checked: boolean | "indeterminate") => {
    setAcceptedTerms(checked === true);
  };

  const handleTermsContainerClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on the actual link
    if ((e.target as HTMLElement).tagName === 'A') {
      return;
    }
    // Toggle the checkbox
    setAcceptedTerms(!acceptedTerms);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) return;

    setIsSubmitting(true);
    
    const quotePayload = new QuotePayload({
      formData,
      propertyData,
      discountCode: isValidDiscount ? discountCode : '',
      discountAmount: getDiscountAmount(),
      onSuccess: () => {
        setIsSubmitting(false);
        onNext();
      },
      onError: () => {
        setIsSubmitting(false);
      }
    });

    await quotePayload.submit();
  };

  // Helper functions for display
  const getDisplayLivingSqFt = () => {
    if (formData.userEnteredSqFt) {
      return `${parseInt(formData.userEnteredSqFt).toLocaleString()} sq ft`;
    }
    const propertyLivingSqFt = propertyData?.countyData?.Sq_Ft?.toString().replace(/[^0-9]/g, '') || '0';
    if (propertyLivingSqFt && parseInt(propertyLivingSqFt) > 0) {
      return `${parseInt(propertyLivingSqFt).toLocaleString()} sq ft`;
    }
    return 'N/A';
  };

  const getFormattedSchedule = () => {
    const date = formData.selectedDate 
      ? formData.selectedDate.toLocaleDateString() 
      : "Select date";
    const time = formData.selectedTime || "Select time";
    return { date, time };
  };

  const getServicePrice = (serviceId: string) => {
    // Use database prices if available, fallback to hardcoded prices ONLY if database fetch failed
    if (servicePrices[serviceId] !== undefined) {
      return servicePrices[serviceId];
    }
    
    // Fallback prices for backward compatibility
    if (serviceId === "appraisal") {
      const sqft = parseInt(formData.userEnteredSqFt) || 
                  parseInt(propertyData?.countyData?.Sq_Ft?.toString().replace(/[^0-9]/g, '') || '0') || 
                  0;
      if (sqft >= 4000) return 600;
      if (sqft >= 3000) return 550;
      if (sqft >= 2000) return 500;
      return 450;
    }
    
    const servicePricesFallback: { [key: string]: number } = {
      "basic-photography": 299,
      "premium-photography": 499,
      "ultimate-photography": 699,
      "professional-photography": 200,
      "aerial-photography": 200,
      "floor-plans": 125,
      "virtual-tours": 300,
      "matterport-tours": 400,
      "real-estate-videography": 400,
    };
    
    return servicePricesFallback[serviceId] || 0;
  };

  const getServiceName = (serviceId: string) => {
    const serviceNames: { [key: string]: string } = {
      "appraisal": "Appraisal Report",
      "basic-photography": "Basic Photography Package",
      "premium-photography": "Premium Photography Package", 
      "ultimate-photography": "Ultimate Photography Package",
      "professional-photography": "Professional Photography",
      "aerial-photography": "Aerial Photography",
      "floor-plans": "Floor Plans",
      "virtual-tours": "Virtual Tours",
      "matterport-tours": "Virtual Home Tour",
      "real-estate-videography": "Real Estate Videography",
    };
    
    return serviceNames[serviceId] || serviceId;
  };

  const getSelectedServicesTotal = () => {
    return formData.selectedServices.reduce((total, serviceId) => {
      return total + getServicePrice(serviceId);
    }, 0);
  };

  const getDiscountAmount = () => {
    if (!isValidDiscount || !discountData) return 0;

    const subtotal = getSelectedServicesTotal();
    
    if (discountData.type === 'percentage') {
      return Math.round((subtotal * discountData.value) / 100);
    } else {
      // Fixed amount discount
      return Math.min(discountData.value, subtotal); // Don't let discount exceed subtotal
    }
  };

  const getFinalTotal = () => {
    return getSelectedServicesTotal() - getDiscountAmount();
  };

  const schedule = getFormattedSchedule();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Review & Submit</h2>
        <p className="text-gray-600">
          Please review your information before submitting your quote request.
        </p>
      </div>

      {/* Three-column grid for Contact, Property, Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Contact Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="flex items-center font-medium mb-2">
            <span className="flex items-center justify-center w-5 h-5 bg-[#4d0a97] text-white text-xs font-medium rounded-full mr-2">
              1
            </span>
            <span>Contact</span>
          </h4>
          <div className="text-sm space-y-1">
            <p>{formData.firstName} {formData.lastName}</p>
            <p>{formData.phone}</p>
            <p>{formData.email}</p>
            {formData.company && <p>{formData.company}</p>}
          </div>
        </div>

        {/* Property Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="flex items-center font-medium mb-2">
            <MapPin className="w-5 h-5 text-[#4d0a97] mr-2" />
            <span>Property</span>
          </h4>
          <div className="text-sm space-y-1">
            <p className="font-medium">{propertyData?.address || 'N/A'}</p>
            <p>
              {getDisplayLivingSqFt()}
              {formData.userEnteredSqFt && " (User Entered)"}
            </p>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="flex items-center font-medium mb-2">
            <Calendar className="w-5 h-5 text-[#4d0a97] mr-2" />
            <span>Schedule</span>
          </h4>
          <div className="text-sm space-y-1">
            <p className={schedule.date === "Select date" ? "text-gray-500 italic" : ""}>
              {schedule.date}
            </p>
            <p className={schedule.time === "Select time" ? "text-gray-500 italic" : ""}>
              {schedule.time}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Services Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
        <h3 className="flex items-center font-semibold mb-3">
          <Check className="w-5 h-5 text-[#4d0a97] mr-2" />
          <span>Selected Services</span>
        </h3>

        <div className="space-y-2">
          {formData.selectedServices.map((serviceId) => (
            <div
              key={serviceId}
              className="flex items-center justify-between bg-gray-50 rounded p-3"
            >
              <div>
                <span className="font-medium">{getServiceName(serviceId)}</span>
              </div>
              <span className="font-semibold text-[#4d0a97]">
                ${getServicePrice(serviceId)}
              </span>
            </div>
          ))}

          {/* Discount Code Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="space-y-3">
              <Label htmlFor="discountCode" className="flex items-center text-sm font-medium">
                <Tag className="w-4 h-4 mr-2" />
                Discount Code
              </Label>
              <div className="flex gap-2">
                <Input
                  id="discountCode"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Enter discount code"
                  className="flex-1"
                />
                {isValidatingDiscount && (
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                    Checking...
                  </div>
                )}
                {isValidDiscount && !isValidatingDiscount && (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <Check className="w-4 h-4 mr-1" />
                    Valid
                  </div>
                )}
              </div>
              {isValidDiscount && discountData && (
                <div className="flex items-center justify-between bg-green-50 rounded p-3">
                  <div className="text-green-700 font-medium">
                    <div>Discount Applied ({discountData.code})</div>
                    {discountData.description && (
                      <div className="text-xs text-green-600 mt-1">{discountData.description}</div>
                    )}
                  </div>
                  <span className="text-green-700 font-semibold">
                    -{discountData.type === 'percentage' ? `${discountData.value}%` : `$${getDiscountAmount()}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Total Section */}
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-base">
                <span className="font-medium">Subtotal:</span>
                <span className="font-semibold text-gray-700">
                  ${getSelectedServicesTotal()}
                </span>
              </div>
              {isValidDiscount && (
                <div className="flex items-center justify-between text-base">
                  <span className="font-medium text-green-700">Discount:</span>
                  <span className="font-semibold text-green-700">
                    -${getDiscountAmount()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-lg border-t pt-2">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold text-[#4d0a97]">
                  ${getFinalTotal()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="mt-6">
        <div 
          className="flex items-start cursor-pointer p-2 rounded hover:bg-gray-50 transition-colors"
          onClick={handleTermsContainerClick}
        >
          <Checkbox
            checked={acceptedTerms}
            onCheckedChange={handleTermsChange}
            className="mt-1 mr-3 flex-shrink-0"
          />
          <div className="text-sm">
            <span>I have read and accept the </span>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4d0a97] hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Service
            </a>
            <span> and agree to the service request terms.</span>
          </div>
        </div>

        {/* Service Request Note */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> This is a service request. We'll review and
            send an invoice within 24 hours.
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button 
          onClick={handleSubmit}
          className="bg-[#4d0a97] hover:bg-[#a044e3]"
          disabled={!acceptedTerms || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;
