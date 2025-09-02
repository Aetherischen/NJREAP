import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperty?: any;
}

const QuoteModal = ({ isOpen, onClose, selectedProperty }: QuoteModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Contact Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Step 2: Services & Scheduling
    serviceType: '',
    selectedServices: [] as string[],
    selectedPackage: '',
    appointmentDate: '',
    appointmentTime: '',
    
    // Step 3: Appraisal Details
    appraisalType: '',
    loanAmount: '',
    clientType: '',
    
    // Step 4: Terms
    termsAccepted: false
  });

  const totalSteps = 5;

  const packages = [
    { id: 'basic', name: 'Basic Package', price: 299, description: 'Professional photography (25+ photos)' },
    { id: 'premium', name: 'Premium Package', price: 499, description: 'Photography + Floor Plan + Aerial' },
    { id: 'ultimate', name: 'Ultimate Package', price: 699, description: 'Complete marketing solution' }
  ];

  const individualServices = [
    { id: 'photography', name: 'Professional Photography', price: 299 },
    { id: 'aerial', name: 'Aerial Photography', price: 199 },
    { id: 'floorplan', name: 'Floor Plans', price: 149 },
    { id: 'virtual-tour', name: 'Virtual Tour', price: 399 },
    { id: 'video', name: 'Video Walkthrough', price: 249 }
  ];

  const calculateAppraisalPrice = (sqft: number) => {
    if (sqft <= 2000) return 450;
    if (sqft <= 3000) return 525;
    return 600;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Removed Google Ads conversion tracking - now handled on /thank-you page
    console.log('Quote submitted:', formData);
    setCurrentStep(5); // Success step
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        {selectedProperty && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="text-sm text-gray-600">Selected Property:</div>
            <div className="font-medium">{selectedProperty.address}</div>
            <div className="text-sm text-gray-600">{selectedProperty.sqft} sq ft</div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            placeholder="John"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            placeholder="Smith"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="john@example.com"
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          placeholder="(555) 123-4567"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Select Services</h3>
      
      <RadioGroup
        value={formData.serviceType}
        onValueChange={(value) => setFormData({...formData, serviceType: value})}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="appraisal" id="appraisal" />
            <Label htmlFor="appraisal" className="flex-1">
              <div className="font-medium">Appraisal Services</div>
              <div className="text-sm text-gray-600">
                {selectedProperty ? `$${calculateAppraisalPrice(selectedProperty.sqft)}` : '$450-$600'} - Based on property size
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="photography-package" id="photography-package" />
            <Label htmlFor="photography-package" className="flex-1">
              <div className="font-medium">Photography Packages</div>
              <div className="text-sm text-gray-600">Choose from our curated packages</div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual" className="flex-1">
              <div className="font-medium">Individual Services</div>
              <div className="text-sm text-gray-600">Mix and match services</div>
            </Label>
          </div>
        </div>
      </RadioGroup>

      {formData.serviceType === 'photography-package' && (
        <div className="space-y-3">
          <h4 className="font-medium">Choose Package:</h4>
          {packages.map(pkg => (
            <div key={pkg.id} className="border rounded-lg p-4 cursor-pointer hover:border-[#4d0a97]" 
                 onClick={() => setFormData({...formData, selectedPackage: pkg.id})}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{pkg.name}</div>
                  <div className="text-sm text-gray-600">{pkg.description}</div>
                </div>
                <div className="text-lg font-bold text-[#4d0a97]">${pkg.price}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formData.serviceType === 'individual' && (
        <div className="space-y-3">
          <h4 className="font-medium">Select Services:</h4>
          {individualServices.map(service => (
            <div key={service.id} className="flex items-center space-x-3">
              <Checkbox
                id={service.id}
                checked={formData.selectedServices.includes(service.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData({...formData, selectedServices: [...formData.selectedServices, service.id]});
                  } else {
                    setFormData({...formData, selectedServices: formData.selectedServices.filter(s => s !== service.id)});
                  }
                }}
              />
              <Label htmlFor={service.id} className="flex-1 flex justify-between">
                <span>{service.name}</span>
                <span className="font-medium">${service.price}</span>
              </Label>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="appointmentDate">Preferred Date</Label>
          <Input
            id="appointmentDate"
            type="date"
            value={formData.appointmentDate}
            onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="appointmentTime">Preferred Time</Label>
          <Input
            id="appointmentTime"
            type="time"
            value={formData.appointmentTime}
            onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Appraisal Details</h3>
      
      <div>
        <Label htmlFor="appraisalType">Appraisal Type</Label>
        <RadioGroup
          value={formData.appraisalType}
          onValueChange={(value) => setFormData({...formData, appraisalType: value})}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="purchase" id="purchase" />
            <Label htmlFor="purchase">Purchase</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="refinance" id="refinance" />
            <Label htmlFor="refinance">Refinance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="estate" id="estate" />
            <Label htmlFor="estate">Estate</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="loanAmount">Loan Amount (if applicable)</Label>
        <Input
          id="loanAmount"
          type="number"
          value={formData.loanAmount}
          onChange={(e) => setFormData({...formData, loanAmount: e.target.value})}
          placeholder="$450,000"
        />
      </div>

      <div>
        <Label htmlFor="clientType">Client Type</Label>
        <RadioGroup
          value={formData.clientType}
          onValueChange={(value) => setFormData({...formData, clientType: value})}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="homeowner" id="homeowner" />
            <Label htmlFor="homeowner">Homeowner</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="agent" id="agent" />
            <Label htmlFor="agent">Real Estate Agent</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="lender" id="lender" />
            <Label htmlFor="lender">Lender</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review & Confirm</h3>
      
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div>
          <h4 className="font-medium mb-2">Contact Information</h4>
          <p className="text-sm text-gray-600">
            {formData.firstName} {formData.lastName}<br/>
            {formData.email}<br/>
            {formData.phone}
          </p>
        </div>

        {selectedProperty && (
          <div>
            <h4 className="font-medium mb-2">Property</h4>
            <p className="text-sm text-gray-600">{selectedProperty.address}</p>
          </div>
        )}

        <div>
          <h4 className="font-medium mb-2">Services</h4>
          {formData.serviceType === 'appraisal' && (
            <p className="text-sm text-gray-600">
              Real Estate Appraisal - ${selectedProperty ? calculateAppraisalPrice(selectedProperty.sqft) : '450-600'}
            </p>
          )}
          {formData.serviceType === 'photography-package' && formData.selectedPackage && (
            <p className="text-sm text-gray-600">
              {packages.find(p => p.id === formData.selectedPackage)?.name} - 
              ${packages.find(p => p.id === formData.selectedPackage)?.price}
            </p>
          )}
        </div>

        <div>
          <h4 className="font-medium mb-2">Appointment</h4>
          <p className="text-sm text-gray-600">
            {formData.appointmentDate} at {formData.appointmentTime}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={formData.termsAccepted}
          onCheckedChange={(checked) => setFormData({...formData, termsAccepted: !!checked})}
        />
        <Label htmlFor="terms" className="text-sm">
          I agree to the <a href="#" className="text-[#4d0a97] hover:underline">Terms of Service</a> and 
          <a href="#" className="text-[#4d0a97] hover:underline"> Privacy Policy</a>
        </Label>
      </div>
    </div>
  );

  const renderStep5 = () => {
    // Google conversion tracking now handled on separate /thank-you page
    return (
      <div className="text-center space-y-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h3 className="text-2xl font-bold text-[#4d0a97]">Quote Submitted Successfully!</h3>
        <p className="text-gray-600">
          Thank you for choosing NJREAP. We'll contact you within 24 hours to confirm your appointment and provide additional details.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Reference #:</strong> NJREAP-{Date.now()}
          </p>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Get Your Quote</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        {currentStep < 5 && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {totalSteps - 1}</span>
              <span>{Math.round((currentStep / (totalSteps - 1)) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#4d0a97] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && formData.serviceType === 'appraisal' && renderStep3()}
          {currentStep === 3 && formData.serviceType !== 'appraisal' && renderStep4()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {currentStep === (formData.serviceType === 'appraisal' ? 4 : 3) ? (
              <Button
                onClick={handleSubmit}
                disabled={currentStep === 4 && !formData.termsAccepted}
                className="bg-[#4d0a97] hover:bg-[#a044e3]"
              >
                Submit Quote Request
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-[#4d0a97] hover:bg-[#a044e3]"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {currentStep === 5 && (
          <div className="pt-6 border-t text-center">
            <Button onClick={onClose} className="bg-[#4d0a97] hover:bg-[#a044e3]">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuoteModal;
