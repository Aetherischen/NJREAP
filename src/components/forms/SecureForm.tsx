import { useState, FormEvent } from 'react';
import { sanitizeInput, isValidEmail, isValidPhone } from '@/lib/security';
import { useRateLimit } from '@/hooks/useRateLimit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface SecureFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  actionKey?: string;
  maxRequests?: number;
  windowMs?: number;
}

interface FormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

/**
 * Example secure form component demonstrating best practices:
 * - Input sanitization
 * - Client-side validation
 * - Rate limiting
 * - Proper error handling
 */
export function SecureForm({ 
  onSubmit, 
  actionKey = 'contact', 
  maxRequests = 5, 
  windowMs = 60000 
}: SecureFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const rateLimit = useRateLimit({
    maxRequests,
    windowMs,
    key: actionKey
  });

  const validateForm = (data: FormData): boolean => {
    const newErrors: Partial<FormData> = {};

    // Sanitize and validate name
    const sanitizedName = sanitizeInput(data.name);
    if (!sanitizedName || sanitizedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Validate email
    if (!data.email || !isValidEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone if provided
    if (data.phone && !isValidPhone(data.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validate message
    const sanitizedMessage = sanitizeInput(data.message);
    if (!sanitizedMessage || sanitizedMessage.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Check rate limit
    if (rateLimit.isLimited) {
      const timeLeft = Math.ceil(rateLimit.timeUntilReset / 1000 / 60);
      toast.error(`Too many requests. Please wait ${timeLeft} minutes before trying again.`);
      return;
    }

    if (!rateLimit.checkLimit()) {
      toast.error('Request limit exceeded. Please try again later.');
      return;
    }

    // Validate form
    if (!validateForm(formData)) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize all data before submission
      const sanitizedData: FormData = {
        name: sanitizeInput(formData.name),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone ? sanitizeInput(formData.phone) : undefined,
        message: sanitizeInput(formData.message)
      };

      await onSubmit(sanitizedData);
      
      // Reset form on success
      setFormData({ name: '', email: '', phone: '', message: '' });
      setErrors({});
      toast.success('Form submitted successfully!');
      
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Your full name"
          maxLength={100}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="your.email@example.com"
          maxLength={254}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="(555) 123-4567"
          maxLength={20}
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
        )}
      </div>

      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          placeholder="Your message..."
          maxLength={1000}
          rows={4}
          disabled={isSubmitting}
        />
        {errors.message && (
          <p className="text-sm text-red-600 mt-1">{errors.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {rateLimit.isLimited ? (
            <span className="text-red-600">
              Rate limit exceeded. Try again in {Math.ceil(rateLimit.timeUntilReset / 1000 / 60)} minutes.
            </span>
          ) : (
            <span>
              {rateLimit.remaining} requests remaining
            </span>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting || rateLimit.isLimited}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
}