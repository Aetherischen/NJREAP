import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import { QuoteFormData } from './PropertyQuoteModal';
import { sanitizeForJsonLd, sanitizeInput, isValidEmail, isValidPhone } from '@/lib/security';

type ServiceType = Database['public']['Enums']['service_type'];
type JobStatus = Database['public']['Enums']['job_status'];

interface QuotePayloadProps {
  formData: QuoteFormData;
  propertyData: any;
  onSuccess: () => void;
  onError: () => void;
  discountCode?: string;
  discountAmount?: number;
}

export class QuotePayload {
  private formData: QuoteFormData;
  private propertyData: any;
  private onSuccess: () => void;
  private onError: () => void;
  private servicePrices: { [key: string]: number } = {};
  private discountCode: string;
  private discountAmount: number;
  constructor({ formData, propertyData, onSuccess, onError, discountCode = '', discountAmount = 0 }: QuotePayloadProps) {
    this.formData = formData;
    this.propertyData = propertyData;
    this.onSuccess = onSuccess;
    this.onError = onError;
    this.discountCode = discountCode;
    this.discountAmount = discountAmount;
  }

  async submit() {
    try {
      console.log('=== STARTING JOB CREATION DEBUG ===');
      
      // Validate and sanitize input data
      const sanitizedFirstName = sanitizeInput(this.formData.firstName);
      const sanitizedLastName = sanitizeInput(this.formData.lastName);
      const sanitizedEmail = this.formData.email?.toLowerCase().trim();
      const sanitizedPhone = this.formData.phone ? sanitizeInput(this.formData.phone) : null;
      
      if (!sanitizedFirstName || sanitizedFirstName.length < 1) {
        throw new Error('Please provide a valid first name');
      }
      
      if (!sanitizedLastName || sanitizedLastName.length < 1) {
        throw new Error('Please provide a valid last name');
      }
      
      if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
        throw new Error('Please provide a valid email address');
      }
      
      if (sanitizedPhone && !isValidPhone(sanitizedPhone)) {
        throw new Error('Please provide a valid phone number');
      }
      
      // Fetch service prices first
      await this.fetchServicePrices();
      
      // Create job record in database
      const jobData = {
        client_name: `${sanitizedFirstName} ${sanitizedLastName}`,
        client_email: sanitizedEmail,
        client_phone: sanitizedPhone,
        property_address: sanitizeInput(this.propertyData?.address) || 'N/A',
        service_type: this.getServiceTypeFromSelection() as ServiceType,
        status: 'pending' as JobStatus,
        description: this.createJobDescription(),
        quoted_amount: this.getSelectedServicesTotal() - this.discountAmount,
        scheduled_date: this.formData.selectedDate ? this.formData.selectedDate.toISOString().split('T')[0] : null,
        raw_njpr_data: this.propertyData?.rawNjprData ? JSON.stringify(sanitizeForJsonLd(this.propertyData.rawNjprData)) : null,
        referral_source: this.formData.referralSource ? sanitizeInput(this.formData.referralSource) : null,
        referral_other_description: this.formData.referralSource === 'other' ? sanitizeInput(this.formData.referralOtherDescription) : null
      };

      console.log('Job data to insert:', jobData);

      // Use the edge function to create job record
      console.log('Calling edge function to create job...');
      
      const { data: functionResult, error: functionError } = await supabase.functions.invoke('create-job-record', {
        body: jobData
      });

      if (functionError) {
        console.error('Edge function error details:', {
          error: functionError,
          message: functionError.message,
          code: functionError.code || 'NO_CODE',
          details: functionError.details || 'NO_DETAILS'
        });
        toast.error('Failed to create job record. Please try again or contact support.');
        this.onError();
        return;
      }

      if (functionResult?.error) {
        console.error('Function returned error:', functionResult.error);
        toast.error('Failed to create job record. Please try again or contact support.');
        this.onError();
        return;
      }

      console.log('Job created successfully via edge function:', functionResult);
      const createdJob = functionResult.job;
      
      // Continue with calendar and email creation
      await this.createCalendarEventAndSendEmail(createdJob);

    } catch (error) {
      console.error('Unexpected error in job creation:', error);
      toast.error('Failed to submit quote request. Please try again.');
      this.onError();
    }
  }

  private getTierFromSquareFootage(sqFt: number): string {
    if (sqFt < 1500) return 'under_1500';
    if (sqFt <= 2500) return '1500_to_2500';
    return 'over_2500';
  }

  private async fetchServicePrices() {
    try {
      // Determine square footage - same logic as QuoteDetailsStep
      let livingSqFt = parseInt(this.propertyData?.countyData?.Sq_Ft?.toString().replace(/[^0-9]/g, '') || '0') || 0;
      
      // If county data is insufficient, use user-entered value
      if (livingSqFt === 0 || livingSqFt < 200) {
        livingSqFt = parseInt(this.formData.userEnteredSqFt) || 1500; // Default to middle tier if no data
      }

      const tier = this.getTierFromSquareFootage(livingSqFt);

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

      this.servicePrices = pricesMap;
      console.log('Fetched service prices for payload:', this.servicePrices);
    } catch (error) {
      console.error('Error fetching service prices:', error);
    }
  }

  private async createCalendarEventAndSendEmail(jobRecord: any) {
    try {
      // Create calendar event
      console.log('Creating calendar event with data:', { 
        formData: this.formData, 
        propertyData: this.propertyData, 
        serviceBreakdown: this.getServiceBreakdown(),
        discountCode: this.discountCode,
        discountAmount: this.discountAmount
      });
      
      const calendarResult = await supabase.functions.invoke('create-calendar-event', {
        body: { 
          formData: {
            ...this.formData,
            serviceBreakdown: this.getServiceBreakdown(),
            discountCode: this.discountCode,
            discountAmount: this.discountAmount
          }, 
          propertyData: this.propertyData 
        }
      });

      if (calendarResult.error) {
        console.error('Calendar event creation failed:', calendarResult.error);
        toast.error('Job created but failed to schedule appointment. Please contact us to schedule manually.');
      } else {
        console.log('Calendar event created successfully:', calendarResult.data);
      }

      // Send beautiful service confirmation email with calendar invite
      console.log('Sending service confirmation email...');
      
      const emailResult = await supabase.functions.invoke('send-contact-email', {
        body: {
          firstName: this.formData.firstName,
          lastName: this.formData.lastName,
          email: this.formData.email,
          phone: this.formData.phone,
          message: `Service request confirmation for ${this.propertyData?.address || 'property'}`,
          isServiceRequest: true,
          serviceRequestData: {
            formData: {
              ...this.formData,
              serviceBreakdown: this.getServiceBreakdown(),
              discountCode: this.discountCode,
              discountAmount: this.discountAmount
            },
            propertyData: this.propertyData
          }
        }
      });

      if (emailResult.error) {
        console.error('Email notification failed:', emailResult.error);
        console.warn('Job created and calendar event scheduled but email notification failed');
        toast.success('Job created and appointment scheduled! We will send you a confirmation email shortly.');
      } else {
        console.log('Email notification sent successfully:', emailResult.data);
        toast.success('Quote request submitted, job created, appointment scheduled, and confirmation email sent!');
      }
      
      // Call success callback
      this.onSuccess();

    } catch (error) {
      console.error('Error in calendar/email creation:', error);
      toast.success('Job created successfully! We will contact you shortly to schedule your appointment.');
      this.onSuccess();
    }
  }

  private getServiceTypeFromSelection(): ServiceType {
    // Check for appraisal first
    if (this.formData.selectedServices.includes('appraisal')) {
      return 'appraisal';
    }
    
    // Check for photography services
    const photographyServices = this.formData.selectedServices.filter(s => 
      ['basic-photography', 'premium-photography', 'ultimate-photography', 'professional-photography'].includes(s)
    );
    
    if (photographyServices.length > 0) {
      return 'photography';
    }
    
    // Check for other specific services
    if (this.formData.selectedServices.includes('aerial-photography')) {
      return 'aerial_photography';
    }
    
    if (this.formData.selectedServices.includes('floor-plans')) {
      return 'floor_plans';
    }
    
    if (this.formData.selectedServices.includes('virtual-tours') || this.formData.selectedServices.includes('real-estate-videography')) {
      return 'virtual_tour';
    }
    
    // Default to photography if no clear match
    return 'photography';
  }

  private getServiceBreakdown() {
    const services = this.formData.selectedServices.map(serviceId => ({
      id: serviceId,
      name: this.getServiceName(serviceId),
      price: this.getServicePrice(serviceId)
    }));

    // Add discount information if applicable
    if (this.discountAmount > 0) {
      services.push({
        id: 'discount',
        name: `Discount (${this.discountCode.toUpperCase()})`,
        price: -this.discountAmount
      });
    }

    return services;
  }

  private createJobDescription() {
    const serviceBreakdown = this.getServiceBreakdown();
    const servicesText = serviceBreakdown
      .filter(service => service.id !== 'discount')
      .map(service => `${service.name} - $${service.price}`)
      .join(', ');
    
    let description = `Services: ${servicesText}\n`;
    description += `Subtotal: $${this.getSelectedServicesTotal()}\n`;
    
    // Add discount information if applicable
    if (this.discountAmount > 0) {
      description += `Discount (${this.discountCode.toUpperCase()}): -$${this.discountAmount}\n`;
    }
    
    description += `Total Amount: $${this.getSelectedServicesTotal() - this.discountAmount}\n`;
    description += `Company: ${this.formData.company || 'N/A'}\n`;
    description += `Appointment: ${this.formData.selectedDate ? this.formData.selectedDate.toLocaleDateString() : 'Not scheduled'} at ${this.formData.selectedTime || 'Not specified'}\n`;
    
    // Add discount code usage information
    if (this.discountCode) {
      description += `\nDiscount Information:\n`;
      description += `- Code Used: ${this.discountCode.toUpperCase()}\n`;
      description += `- Discount Amount: $${this.discountAmount}\n`;
    }
    
    if (this.formData.selectedServices.includes('appraisal')) {
      description += `\nAppraisal Details:\n`;
      description += `- Property Type: ${this.formData.appraisalPropertyType || 'N/A'}\n`;
      description += `- Interest Appraised: ${this.formData.appraisalInterestAppraised || 'N/A'}\n`;
      description += `- Intended Use: ${this.formData.appraisalIntendedUse || 'N/A'}\n`;
      if (this.formData.appraisalIntendedUse === 'Other' && this.formData.appraisalOtherDescription) {
        description += `- Other Description: ${this.formData.appraisalOtherDescription}\n`;
      }
      description += `- Intended Users: ${this.formData.appraisalIntendedUsers || 'N/A'}\n`;
      description += `- Type of Value: ${this.formData.appraisalTypeOfValue || 'N/A'}\n`;
      description += `- Effective Date: ${this.formData.appraisalEffectiveDate || 'N/A'}\n`;
      description += `- Report Option: ${this.formData.appraisalReportOption || 'N/A'}\n`;
      description += `- Additional Notes: ${this.formData.appraisalAdditionalNotes || 'N/A'}\n`;
    }

    // Concise Property Information section
    description += `\nProperty Information:\n`;
    description += `- Address: ${this.propertyData?.address || 'N/A'}\n`;
    description += `- Living Square Feet: ${this.getDisplayLivingSqFt()}\n`;
    description += `- Year Built: ${this.propertyData?.countyData?.Yr_Built || 'N/A'}\n`;
    
    // Add GIS PIN and NJPR link as hyperlink
    const gisPin = this.propertyData?.countyData?.GIS_PIN || 'N/A';
    if (gisPin !== 'N/A') {
      description += `- NJPR Property Link: <a href="https://njpropertyrecords.com/property/${gisPin}" target="_blank" rel="noopener noreferrer">https://njpropertyrecords.com/property/${gisPin}</a>\n`;
    }
    
    description += `- APN: ${this.propertyData?.countyData?.APN || 'N/A'}\n`;
    description += `- Acreage: ${this.propertyData?.countyData?.Acreage || 'N/A'}\n`;
    
    // Add county name for dashboard filtering
    const countyName = this.propertyData?.countyData?.COUNTY_NAME || 'N/A';
    description += `- County: ${countyName}\n`;
    
    // Full detailed county data section
    if (this.propertyData?.countyData) {
      const countyData = this.propertyData.countyData;
      description += `\nDetailed County Data:\n`;
      description += `- Owner: ${countyData.Owners_Name || 'N/A'}\n`;
      description += `- Block/Lot: ${countyData.Block || 'N/A'}/${countyData.Lot || 'N/A'}\n`;
      description += `- Municipality: ${countyData.DISTRICT_NAME || 'N/A'}\n`;
      description += `- Building Description: ${countyData.Building_Desc || 'N/A'}\n`;
      description += `- Land Description: ${countyData.Land_Desc || 'N/A'}\n`;
      description += `- Building Assessment: ${countyData.Building_Assmnt_1 || 'N/A'}\n`;
      description += `- Land Assessment: ${countyData.Land_Assmnt_1 || 'N/A'}\n`;
      if (countyData.Calculated_Taxes) {
        description += `- Calculated Taxes (${countyData.Calculated_Taxes_Year || 'Unknown Year'}): $${countyData.Calculated_Taxes}\n`;
      }
      description += `- GIS PIN: ${gisPin}\n`;
    }
    
    return description;
  }

  private getDisplayLivingSqFt() {
    if (this.formData.userEnteredSqFt) {
      return `${parseInt(this.formData.userEnteredSqFt).toLocaleString()} sq ft`;
    }
    const propertyLivingSqFt = this.propertyData?.countyData?.Sq_Ft?.toString().replace(/[^0-9]/g, '') || '0';
    if (propertyLivingSqFt && parseInt(propertyLivingSqFt) > 0) {
      return `${parseInt(propertyLivingSqFt).toLocaleString()} sq ft`;
    }
    return 'N/A';
  }

  private getServiceName(serviceId: string) {
    const serviceNames: { [key: string]: string } = {
      "appraisal": "Appraisal Report",
      "basic-photography": "Basic Photography Package",
      "premium-photography": "Premium Photography Package", 
      "ultimate-photography": "Ultimate Photography Package",
      "professional-photography": "Professional Photography",
      "aerial-photography": "Aerial Photography",
      "floor-plans": "Floor Plans",
      "virtual-tours": "Virtual Tours",
      "real-estate-videography": "Real Estate Videography",
    };
    
    return serviceNames[serviceId] || serviceId;
  }

  private getServicePrice(serviceId: string) {
    // Use database prices if available, fallback to calculation for appraisal or hardcoded prices
    if (this.servicePrices[serviceId] !== undefined) {
      console.log(`Using database price for ${serviceId}: $${this.servicePrices[serviceId]}`);
      return this.servicePrices[serviceId];
    }
    
    // Special handling for appraisal pricing based on square footage - MATCH QuoteDetailsStep calculation
    if (serviceId === "appraisal") {
      // Use the SAME square footage calculation as QuoteDetailsStep
      let livingSqFt = parseInt(this.propertyData?.countyData?.Sq_Ft?.toString().replace(/[^0-9]/g, '') || '0') || 0;
      
      // If county data is insufficient, use user-entered value
      if (livingSqFt === 0 || livingSqFt < 200) {
        livingSqFt = parseInt(this.formData.userEnteredSqFt) || 0;
      }
      
      // Use the SAME pricing tiers as QuoteDetailsStep
      let appraisalPrice = 450; // Base price for properties under 2000 sq ft
      if (livingSqFt >= 4000) {
        appraisalPrice = 600;
      } else if (livingSqFt >= 3000) {
        appraisalPrice = 550;
      } else if (livingSqFt >= 2000) {
        appraisalPrice = 500;
      }
      
      console.log(`Using calculated appraisal price for ${livingSqFt} sqft: $${appraisalPrice}`);
      return appraisalPrice;
    }
    
    // Fallback prices (should rarely be used now)
    const servicePricesFallback: { [key: string]: number } = {
      "basic-photography": 299,
      "premium-photography": 499,
      "ultimate-photography": 699,
      "professional-photography": 200,
      "aerial-photography": 200,
      "floor-plans": 125,
      "virtual-tours": 300,
      "real-estate-videography": 400,
    };
    
    const fallbackPrice = servicePricesFallback[serviceId] || 0;
    if (fallbackPrice > 0) {
      console.warn(`Using fallback price for ${serviceId}: $${fallbackPrice}`);
    }
    return fallbackPrice;
  }

  private getSelectedServicesTotal() {
    return this.formData.selectedServices.reduce((total, serviceId) => {
      return total + this.getServicePrice(serviceId);
    }, 0);
  }
}
