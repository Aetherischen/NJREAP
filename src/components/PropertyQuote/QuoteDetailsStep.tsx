import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, Camera, Plane, Map, Video, Play } from 'lucide-react';
import { QuoteFormData } from './PropertyQuoteModal';
import { supabase } from '@/integrations/supabase/client';
import CalendarBooking from './CalendarBooking';

interface QuoteDetailsStepProps {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  propertyData?: any;
}

const QuoteDetailsStep: React.FC<QuoteDetailsStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onBack,
  propertyData
}) => {
  const [showIndividualServices, setShowIndividualServices] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [servicePrices, setServicePrices] = useState<any>({});

  // Fetch service prices from database based on property square footage
  useEffect(() => {
    fetchServicePrices();
  }, [propertyData]);

  const getTierFromSquareFootage = (sqFt: number): string => {
    if (sqFt < 1500) return 'under_1500';
    if (sqFt <= 2500) return '1500_to_2500';
    return 'over_2500';
  };

  const fetchServicePrices = async () => {
    try {
      // Determine square footage
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

  // Individual photography services with updated pricing
  const individualServices = [
    {
      id: "professional-photography",
      name: "Professional Photography",
      description: "High-quality interior and exterior photography",
      price: servicePrices['professional-photography'] || 200,
      icon: Camera,
    },
    {
      id: "aerial-photography",
      name: "Aerial Photography",
      description: "Drone photography with unique perspectives",
      price: servicePrices['aerial-photography'] || 200,
      icon: Plane,
    },
    {
      id: "floor-plans",
      name: "Floor Plans",
      description: "Detailed 2D and 3D floor plans",
      price: servicePrices['floor-plans'] || 125,
      icon: Map,
    },
    {
      id: "virtual-tours",
      name: "Virtual Tours",
      description: "Interactive 360° virtual tours",
      price: servicePrices['virtual-tours'] || 300,
      icon: Video,
    },
    {
      id: "real-estate-videography",
      name: "Real Estate Videography",
      description: "Professional video walkthrough and marketing videos",
      price: servicePrices['real-estate-videography'] || 400,
      icon: Play,
    },
  ];

  // Check if any package is selected
  const packageServices = [
    "basic-photography",
    "premium-photography",
    "ultimate-photography",
  ];
  const hasPackageSelected = packageServices.some((pkg) =>
    formData.selectedServices.includes(pkg),
  );

  // Check if any individual service is selected
  const individualServiceIds = individualServices.map((s) => s.id);
  const hasIndividualSelected = individualServiceIds.some((id) =>
    formData.selectedServices.includes(id),
  );

  const handleServiceToggle = (serviceId: string) => {
    let newSelectedServices;
    
    if (formData.selectedServices.includes(serviceId)) {
      newSelectedServices = formData.selectedServices.filter((id) => id !== serviceId);
    } else {
      // If selecting a package, remove all individual services and other packages
      if (packageServices.includes(serviceId)) {
        const filteredServices = formData.selectedServices.filter(
          (id) =>
            !individualServiceIds.includes(id) && !packageServices.includes(id),
        );
        newSelectedServices = [...filteredServices, serviceId];
      }
      // If selecting an individual service, remove all packages
      else if (individualServiceIds.includes(serviceId)) {
        const filteredServices = formData.selectedServices.filter(
          (id) => !packageServices.includes(id),
        );
        newSelectedServices = [...filteredServices, serviceId];
      }
      // For appraisal, just add normally
      else {
        newSelectedServices = [...formData.selectedServices, serviceId];
      }
    }

    updateFormData({ selectedServices: newSelectedServices });

    // Clear validation error when user selects a service
    setValidationErrors((prev: any) => ({
      ...prev,
      services: undefined,
    }));
  };

  const handleDateSelect = (date: Date) => {
    updateFormData({ selectedDate: date });
    // Clear date validation error when user selects a date
    setValidationErrors((prev: any) => ({
      ...prev,
      date: undefined,
    }));
  };

  const handleTimeSelect = (time: string) => {
    updateFormData({ selectedTime: time });
    // Clear time validation error when user selects a time
    setValidationErrors((prev: any) => ({
      ...prev,
      time: undefined,
    }));
  };

  const validateForm = () => {
    const errors: any = {};

    if (formData.selectedServices.length === 0) {
      errors.services = 'Please select at least one service';
    }

    if (!formData.selectedDate) {
      errors.date = 'Please select an inspection date';
    }

    if (!formData.selectedTime) {
      errors.time = 'Please select an inspection time';
    }

    // Validate living square feet - Fixed logic to match PropertyInfoStep
    const livingSqFt = parseInt(propertyData?.countyData?.Sq_Ft?.toString().replace(/[^0-9]/g, '') || '0') || 0;
    const needsUserInput = livingSqFt === 0 || livingSqFt < 200;
    
    if (needsUserInput) {
      const userSqFt = parseInt(formData.userEnteredSqFt) || 0;
      if (!formData.userEnteredSqFt || userSqFt < 200) {
        errors.livingSqFt = 'Please enter a valid living square feet (minimum 200)';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const livingSqFt = parseInt(propertyData?.countyData?.Sq_Ft?.toString().replace(/[^0-9]/g, '') || '0') || 0;
  const needsUserInput = livingSqFt === 0 || livingSqFt < 200;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Quote Details</h2>
        <p className="text-gray-600">
          Select your services and preferred inspection schedule.
        </p>
      </div>

      <div className="space-y-6">
        {/* Living Square Feet Input */}
        {needsUserInput && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div>
              <Label htmlFor="livingSqFt" className="text-sm font-medium">
                Living Square Feet *
              </Label>
              <p className="text-sm text-gray-600 mt-1 mb-2">
                The property data shows incomplete square footage. Please
                enter the living square feet to continue.
              </p>
              <Input
                id="livingSqFt"
                type="number"
                value={formData.userEnteredSqFt}
                onChange={(e) => {
                  updateFormData({ userEnteredSqFt: e.target.value });
                  setValidationErrors((prev: any) => ({
                    ...prev,
                    livingSqFt: undefined,
                  }));
                }}
                placeholder="Enter living square feet (minimum 200)"
                className={`h-10 ${validationErrors.livingSqFt ? "border-red-500" : ""}`}
              />
              {validationErrors.livingSqFt && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.livingSqFt}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Appraisal Service */}
        <div>
          <h3 className="text-lg font-semibold leading-7 mb-3">
            Appraisal Service
          </h3>
          <div 
            className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
              formData.selectedServices.includes("appraisal")
                ? "border-purple-600 bg-purple-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleServiceToggle("appraisal")}
          >
            <div className="flex items-center">
              <div
                className={`w-4 h-4 rounded border border-gray-900 flex-shrink-0 ${
                  formData.selectedServices.includes("appraisal")
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white"
                }`}
              >
                {formData.selectedServices.includes("appraisal") && (
                  <svg
                    className="w-3 h-3 text-white m-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 ml-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Appraisal Report</span>
                  <span className="font-semibold">${servicePrices['appraisal'] || 450}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Photography Packages */}
        <div>
          <h3 className="text-lg font-semibold leading-7 mb-3">
            Photography Packages
          </h3>
          {hasIndividualSelected && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-amber-700">
                Individual services are selected. To choose a package, please
                deselect individual services first.
              </p>
            </div>
          )}
          <div className="space-y-3">
            {/* Basic Photography Package */}
            <div 
              className={`border rounded-lg p-4 transition-all duration-200 ${
                hasIndividualSelected
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                  : formData.selectedServices.includes("basic-photography")
                    ? "border-purple-600 bg-purple-50 cursor-pointer"
                    : "border-gray-200 hover:border-gray-300 cursor-pointer"
              }`}
              onClick={() => !hasIndividualSelected && handleServiceToggle("basic-photography")}
            >
              <div className="flex items-start">
                <div
                  className={`w-4 h-4 rounded border border-gray-900 flex-shrink-0 mt-1 ${
                    formData.selectedServices.includes("basic-photography")
                      ? "bg-purple-600 border-purple-600"
                      : hasIndividualSelected
                        ? "bg-gray-200 border-gray-400"
                        : "bg-white"
                  }`}
                >
                  {formData.selectedServices.includes("basic-photography") && (
                    <svg
                      className="w-3 h-3 text-white m-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 ml-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Basic Photography Package</span>
                    <span className="font-semibold">${servicePrices['basic-photography'] || 299}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-5 mb-2">
                    Professional Photography + Floor Plans
                  </p>
                  <div className="text-xs text-gray-500 leading-4">
                    <span>Includes: </span>
                    <span>Professional Photography, Floor Plans (2D & 3D)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Photography Package */}
            <div 
              className={`border rounded-lg p-4 transition-all duration-200 ${
                hasIndividualSelected
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                  : formData.selectedServices.includes("premium-photography")
                    ? "border-purple-600 bg-purple-50 cursor-pointer"
                    : "border-gray-200 hover:border-gray-300 cursor-pointer"
              }`}
              onClick={() => !hasIndividualSelected && handleServiceToggle("premium-photography")}
            >
              <div className="flex items-start">
                <div
                  className={`w-4 h-4 rounded border border-gray-900 flex-shrink-0 mt-1 ${
                    formData.selectedServices.includes("premium-photography")
                      ? "bg-purple-600 border-purple-600"
                      : hasIndividualSelected
                        ? "bg-gray-200 border-gray-400"
                        : "bg-white"
                  }`}
                >
                  {formData.selectedServices.includes("premium-photography") && (
                    <svg
                      className="w-3 h-3 text-white m-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 ml-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Premium Photography Package</span>
                    <span className="font-semibold">${servicePrices['premium-photography'] || 499}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-5 mb-2">
                    Professional Photography + Aerial Photography + Floor Plans
                  </p>
                  <div className="text-xs text-gray-500 leading-4">
                    <span>Includes: </span>
                    <span>Professional Photography, Aerial Photography, Floor Plans (2D & 3D)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ultimate Photography Package */}
            <div 
              className={`border rounded-lg p-4 transition-all duration-200 ${
                hasIndividualSelected
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                  : formData.selectedServices.includes("ultimate-photography")
                    ? "border-purple-600 bg-purple-50 cursor-pointer"
                    : "border-gray-200 hover:border-gray-300 cursor-pointer"
              }`}
              onClick={() => !hasIndividualSelected && handleServiceToggle("ultimate-photography")}
            >
              <div className="flex items-start">
                <div
                  className={`w-4 h-4 rounded border border-gray-900 flex-shrink-0 mt-1 ${
                    formData.selectedServices.includes("ultimate-photography")
                      ? "bg-purple-600 border-purple-600"
                      : hasIndividualSelected
                        ? "bg-gray-200 border-gray-400"
                        : "bg-white"
                  }`}
                >
                  {formData.selectedServices.includes("ultimate-photography") && (
                    <svg
                      className="w-3 h-3 text-white m-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 ml-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Ultimate Photography Package</span>
                    <span className="font-semibold">${servicePrices['ultimate-photography'] || 699}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-5 mb-2">
                    Everything: Professional Photography + Aerial Photography + Floor Plans + Virtual Tours + Videography
                  </p>
                  <div className="text-xs text-gray-500 leading-4">
                    <span>Includes: </span>
                    <span>Professional Photography, Aerial Photography, Floor Plans (2D & 3D), Virtual Tours, Videography</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Photography Services */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold leading-7">Individual Photography Services</h3>
            <Button
              onClick={() => setShowIndividualServices(!showIndividualServices)}
              className="bg-purple-700 text-white hover:bg-purple-800 flex items-center gap-2 px-3 h-9 text-sm font-medium rounded-md transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showIndividualServices ? "rotate-180" : ""}`}
              />
              <span>{showIndividualServices ? "Collapse" : "Expand"}</span>
            </Button>
          </div>

          {showIndividualServices && (
            <div className="space-y-3">
              {hasPackageSelected && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-amber-700">
                    A photography package is selected. To choose individual services, please deselect the package first.
                  </p>
                </div>
              )}
              {individualServices.map((service) => (
                <div 
                  key={service.id} 
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    hasPackageSelected
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                      : formData.selectedServices.includes(service.id)
                        ? "border-purple-600 bg-purple-50 cursor-pointer"
                        : "border-gray-200 hover:border-gray-300 cursor-pointer"
                  }`}
                  onClick={() => !hasPackageSelected && handleServiceToggle(service.id)}
                >
                  <div className="flex items-start">
                    <div
                      className={`w-4 h-4 rounded border border-gray-900 flex-shrink-0 mt-1 ${
                        formData.selectedServices.includes(service.id)
                          ? "bg-purple-600 border-purple-600"
                          : hasPackageSelected
                            ? "bg-gray-200 border-gray-400"
                            : "bg-white"
                      }`}
                    >
                      {formData.selectedServices.includes(service.id) && (
                        <svg
                          className="w-3 h-3 text-white m-auto"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 ml-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <service.icon className="w-4 h-4 text-purple-600 mr-2" />
                          <span className="font-medium">{service.name}</span>
                        </div>
                        <span className="font-semibold">${service.price}</span>
                      </div>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar Booking Component */}
        <CalendarBooking
          selectedDate={formData.selectedDate}
          selectedTime={formData.selectedTime}
          onDateSelect={handleDateSelect}
          onTimeSelect={handleTimeSelect}
          validationErrors={validationErrors}
        />

        {validationErrors.services && (
          <p className="text-red-500 text-sm mt-2">{validationErrors.services}</p>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default QuoteDetailsStep;
