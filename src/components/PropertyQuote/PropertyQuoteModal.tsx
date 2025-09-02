import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropertyInfoStep from './PropertyInfoStep';
import QuoteDetailsStep from './QuoteDetailsStep';
import AppraisalInfoStep from './AppraisalInfoStep';
import ReviewStep from './ReviewStep';
import ThankYouStep from './ThankYouStep';

export interface QuoteFormData {
  // Contact Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  
  // New fields for referral source
  referralSource: string;
  referralOtherDescription: string;
  
  // Service Information
  serviceType: string;
  timeline: string;
  additionalInfo: string;
  urgency: string;
  
  // Appraisal specific fields
  appraisalPurpose: string;

  // New appraisal fields
  appraisalPropertyType: string;
  appraisalInterestAppraised: string;
  appraisalIntendedUse: string;
  appraisalIntendedUsers: string; // JSON string of IntendedUser array
  appraisalTypeOfValue: string;
  appraisalEffectiveDate: string;
  appraisalReportOption: string;
  appraisalAdditionalNotes: string;
  appraisalOtherDescription: string; // New field for "Other" intended use description

  // Quote Details fields
  selectedServices: string[];
  userEnteredSqFt: string;
  selectedDate: Date | null;
  selectedTime: string;
}

interface PropertyQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyData: any;
}

const PropertyQuoteModal: React.FC<PropertyQuoteModalProps> = ({
  isOpen,
  onClose,
  propertyData
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [formData, setFormData] = useState<QuoteFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    referralSource: '',
    referralOtherDescription: '',
    serviceType: '',
    timeline: '',
    additionalInfo: '',
    urgency: '',
    appraisalPurpose: '',
    appraisalPropertyType: '',
    appraisalInterestAppraised: '',
    appraisalIntendedUse: '',
    appraisalIntendedUsers: '',
    appraisalTypeOfValue: '',
    appraisalEffectiveDate: '',
    appraisalReportOption: 'Narrative Report – Most Common', // Set default value here
    appraisalAdditionalNotes: '',
    appraisalOtherDescription: '', // Initialize new field
    selectedServices: [],
    userEnteredSqFt: '',
    selectedDate: null,
    selectedTime: ''
  });

  const updateFormData = (data: Partial<QuoteFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const hasAppraisalSelected = () => {
    return formData.selectedServices.includes('appraisal');
  };

  const handleNext = () => {
    if (currentStep === 2 && !hasAppraisalSelected()) {
      setCurrentStep(4); // Skip appraisal step
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 4 && !hasAppraisalSelected()) {
      setCurrentStep(2); // Skip appraisal step going back
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Close the modal and navigate to thank-you page
    onClose();
    navigate('/thank-you');
  };

  // Check if user has made progress (beyond step 1 or has entered data)
  const hasProgress = () => {
    return currentStep > 1 || 
           formData.firstName !== '' || 
           formData.lastName !== '' || 
           formData.email !== '' || 
           formData.phone !== '';
  };

  const handleCloseAttempt = () => {
    if (hasProgress()) {
      setShowExitConfirmation(true);
    } else {
      onClose();
    }
  };

  const confirmExit = () => {
    setShowExitConfirmation(false);
    onClose();
  };

  const cancelExit = () => {
    setShowExitConfirmation(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PropertyInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            propertyData={propertyData}
          />
        );
      case 2:
        return (
          <QuoteDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            propertyData={propertyData}
          />
        );
      case 3:
        return (
          <AppraisalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            propertyData={propertyData}
            selectedDate={formData.selectedDate}
          />
        );
      case 4:
        return (
          <ReviewStep
            formData={formData}
            onNext={handleSubmit}
            onBack={handleBack}
            propertyData={propertyData}
          />
        );
      case 5:
        // This case is no longer used - we navigate to /thank-you instead
        return null;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Property Information';
      case 2: return 'Quote Details';
      case 3: return 'Appraisal Information';
      case 4: return 'Review & Submit';
      case 5: return 'Thank You';
      default: return 'Property Quote';
    }
  };

  // Get the square footage from property data or user input
  const getSquareFootage = () => {
    // Try to get square footage from the raw API data
    const livingSqFt = propertyData?.countyData?.Sq_Ft || 
                      propertyData?.countyData?.Living_Sqft || 
                      propertyData?.recordData?.Living_Sqft ||
                      0;
    const userSqFt = parseInt(formData.userEnteredSqFt) || 0;
    
    if (livingSqFt >= 200) {
      return parseInt(livingSqFt).toLocaleString();
    } else if (userSqFt >= 200) {
      return userSqFt.toLocaleString();
    }
    return 'N/A';
  };

  // Get the steps to display based on whether appraisal is selected
  const getStepsToDisplay = () => {
    if (hasAppraisalSelected()) {
      return [
        { step: 1, title: 'Property Info', stepNumber: 1 },
        { step: 2, title: 'Quote Details', stepNumber: 2 },
        { step: 3, title: 'Appraisal Info', stepNumber: 3 },
        { step: 4, title: 'Review', stepNumber: 4 }
      ];
    } else {
      return [
        { step: 1, title: 'Property Info', stepNumber: 1 },
        { step: 2, title: 'Quote Details', stepNumber: 2 },
        { step: 4, title: 'Review', stepNumber: 3 } // Display as step 3 but internal step is 4
      ];
    }
  };

  const handleStepClick = (targetStep: number) => {
    // Only allow navigation to completed steps (steps less than current step)
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
    }
  };

  // Hide/show tawk.to widget when modal opens/closes
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Tawk_API) {
      if (isOpen) {
        // Hide tawk.to widget when modal is open
        (window as any).Tawk_API.hideWidget();
      } else {
        // Show tawk.to widget when modal is closed
        (window as any).Tawk_API.showWidget();
      }
    }

    // Cleanup: ensure widget is shown when component unmounts
    return () => {
      if (typeof window !== 'undefined' && (window as any).Tawk_API) {
        (window as any).Tawk_API.showWidget();
      }
    };
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex-1">
              {currentStep < 5 && (
                <div className="mb-2">
                  <DialogTitle className="text-xl font-semibold">
                    Get Your Free Quote - {propertyData?.address || 'Property Address'}
                  </DialogTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Living Square Feet: {getSquareFootage()} sq ft
                  </p>
                </div>
              )}
              {currentStep === 5 && (
                <DialogTitle className="text-xl font-semibold">
                  {getStepTitle()}
                </DialogTitle>
              )}
            </div>
          </DialogHeader>
          
          {currentStep < 5 && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {getStepsToDisplay().map((stepInfo, index) => {
                  const isActive = currentStep === stepInfo.step;
                  const isCompleted = currentStep > stepInfo.step;
                  const isClickable = isCompleted;
                  const isLast = index === getStepsToDisplay().length - 1;
                  
                  return (
                    <React.Fragment key={stepInfo.step}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-colors ${
                            isCompleted
                              ? 'bg-[#4d0a97] text-white cursor-pointer hover:bg-[#3d0875]'
                              : isActive
                              ? 'bg-[#4d0a97] text-white'
                              : 'bg-gray-200 text-gray-600'
                          } ${isClickable ? 'cursor-pointer' : ''}`}
                          onClick={() => isClickable && handleStepClick(stepInfo.step)}
                        >
                          {stepInfo.stepNumber}
                        </div>
                        <span className={`text-xs font-medium text-center ${
                          isActive || isCompleted ? 'text-[#4d0a97]' : 'text-gray-500'
                        }`}>
                          {stepInfo.title}
                        </span>
                      </div>
                      {!isLast && (
                        <div
                          className={`flex-1 h-0.5 mx-4 mt-[-20px] ${
                            isCompleted ? 'bg-[#4d0a97]' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {renderStep()}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll lose all the information you've entered so far. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelExit}>Continue Quote</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit} className="bg-red-600 hover:bg-red-700">
              Exit and Lose Progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PropertyQuoteModal;
