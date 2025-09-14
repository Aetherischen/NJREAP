import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MapPin, User, Mail, MessageSquare, Camera, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddressSuggestion {
  address: string;
  houseNumber?: number;
  countyData?: {
    P_City?: string;
    P_State?: string;
    P_Zip?: string;
  };
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  service: string;
  comments: string;
}

interface SimpleQuoteFormProps {
  onGetQuote?: () => void;
}

const SimpleQuoteForm = ({ onGetQuote }: SimpleQuoteFormProps = {}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    service: '',
    comments: ''
  });
  
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const formRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Handle address autocomplete
    if (field === 'address') {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (value.length >= 3) {
        setIsSearching(true);
        searchTimeoutRef.current = setTimeout(async () => {
          try {
            const response = await fetch("https://yhtyhcldtytxsgiphfhn.supabase.co/functions/v1/njpr-properties", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodHloY2xkdHl0eHNnaXBoZmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMTg3NDgsImV4cCI6MjA2NTY5NDc0OH0.1iSmqgMV5p-QQ8Noa0N7MIc65DrwkjxInHtwgNdUiDU`
              },
              body: JSON.stringify({ filters: { address: value }, limit: 5 }),
            });
            
            const data = await response.json();
            const results = Array.isArray(data) ? data : [];
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
          } catch (err) {
            console.error("Error fetching suggestions:", err);
            setSuggestions([]);
            setShowSuggestions(false);
          } finally {
            setIsSearching(false);
          }
        }, 300);
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
        setIsSearching(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setFormData(prev => ({ ...prev, address: suggestion.address }));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(event.target as Node)) {
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [handleClickOutside]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\(\)\+\.]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.address.trim()) newErrors.address = 'Property address is required';
    if (!formData.service) newErrors.service = 'Please select a service';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://yhtyhcldtytxsgiphfhn.supabase.co/functions/v1/send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          message: `Service Request: ${formData.service}
Property Address: ${formData.address}
${formData.comments ? `Additional Comments: ${formData.comments}` : ''}

This inquiry was submitted through the website contact form.`,
          isServiceRequest: false // Simple inquiry, not the full service request flow
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send inquiry');
      }

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        service: '',
        comments: ''
      });
      
      toast.success('Your inquiry has been sent! We\'ll get back to you soon.');
      
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to send inquiry. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-2xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-[#4d0a97]">
          Get Your Quote
        </CardTitle>
        <div className="flex items-center justify-center gap-2 text-[#4d0a97] font-semibold">
          <Phone className="w-4 h-4" />
          <a href="tel:908-437-8505" className="hover:underline">
            (908) 437-8505
          </a>
        </div>
        <p className="text-sm text-gray-600">
          Fill out the form below or call us directly
        </p>
      </CardHeader>
      
      <CardContent ref={formRef}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="pl-10"
                  placeholder="John"
                  disabled={isSubmitting}
                />
              </div>
              {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
            </div>
            
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="pl-10"
                  placeholder="Doe"
                  disabled={isSubmitting}
                />
              </div>
              {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  placeholder="john@example.com"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10"
                  placeholder="(555) 123-4567"
                  disabled={isSubmitting}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="relative">
            <Label htmlFor="address" className="text-sm font-medium">
              Property Address *
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="pl-10"
                placeholder="Start typing address..."
                disabled={isSubmitting}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin z-10" />
              )}
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm">{suggestion.address}</span>
                  </button>
                ))}
              </div>
            )}
            {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
          </div>

          <div>
            <Label htmlFor="service" className="text-sm font-medium">
              Service Needed *
            </Label>
            <Select value={formData.service} onValueChange={(value) => handleInputChange('service', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appraisal">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Real Estate Appraisal
                  </div>
                </SelectItem>
                <SelectItem value="photography">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Real Estate Photography
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.service && <p className="text-xs text-red-600 mt-1">{errors.service}</p>}
          </div>

          <div>
            <Label htmlFor="comments" className="text-sm font-medium">
              Additional Comments
            </Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                className="pl-10 resize-none"
                placeholder="Any additional details or questions..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full bg-[#4d0a97] hover:bg-[#3d0877] text-white font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Inquiry'
              )}
            </Button>

            {onGetQuote && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/95 text-gray-500">or</span>
                </div>
              </div>
            )}

            {onGetQuote && (
              <Button
                type="button"
                variant="outline"
                className="w-full border-[#4d0a97] text-[#4d0a97] hover:bg-[#4d0a97] hover:text-white font-semibold"
                onClick={onGetQuote}
              >
                Get Detailed Property Quote
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SimpleQuoteForm;