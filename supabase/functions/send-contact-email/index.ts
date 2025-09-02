import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_ORIGINS = [
  '*' // Allow all origins for development
];

function validateOrigin(request: Request): boolean {
  return true; // Allow all origins for now
}

async function checkRateLimit(supabase: any, identifier: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_function_name: 'send-contact-email',
      p_max_requests: 10, // 10 emails per hour per IP
      p_window_minutes: 60
    });
    
    if (error) {
      console.error('Rate limit check error:', error);
      return false; // Deny on error
    }
    
    return data === true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return false;
  }
}

interface ContactEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  isServiceRequest?: boolean;
  serviceRequestData?: {
    formData: any;
    propertyData: any;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate origin
  if (!validateOrigin(req)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Get client IP for rate limiting
  const clientIP = req.headers.get('CF-Connecting-IP') || 
                   req.headers.get('X-Forwarded-For') || 
                   'unknown';

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Check rate limit - temporarily disabled for debugging
  // const withinLimit = await checkRateLimit(supabase, clientIP);
  // if (!withinLimit) {
  //   return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
  //     status: 429,
  //     headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  //   });
  // }
  const withinLimit = true; // Temporarily allow all requests

  try {
    const { firstName, lastName, email, phone, message, isServiceRequest, serviceRequestData }: ContactEmailRequest = await req.json();
    
    console.log('Email request received:', { 
      firstName, lastName, email, 
      isServiceRequest: !!isServiceRequest,
      hasServiceData: !!serviceRequestData 
    });
    
    console.log('Processing email request - service request:', !!isServiceRequest);

    if (isServiceRequest && serviceRequestData) {
      // Send beautifully formatted service request email
      console.log('Sending service request confirmation email');
      
      const { formData, propertyData } = serviceRequestData;
      
      // Helper functions
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

      // Use service breakdown if available, otherwise calculate prices
      const getServiceBreakdown = () => {
        if (formData.serviceBreakdown && Array.isArray(formData.serviceBreakdown)) {
          return formData.serviceBreakdown;
        }
        
        // Fallback to old method if breakdown not available
        return formData.selectedServices?.map((serviceId: string) => ({
          id: serviceId,
          name: getServiceName(serviceId),
          price: getServicePrice(serviceId)
        })) || [];
      };

      const getServicePrice = (serviceId: string) => {
        if (serviceId === "appraisal") {
          const sqft = parseInt(formData.userEnteredSqFt) || 
                      parseInt(propertyData?.countyData?.Sq_Ft?.toString().replace(/[^0-9]/g, '') || '0') || 
                      0;
          if (sqft >= 4000) return 600;
          if (sqft >= 3000) return 550;
          if (sqft >= 2000) return 500;
          return 450;
        }
        
        const servicePrices: { [key: string]: number } = {
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
        
        return servicePrices[serviceId] || 0;
      };

      const serviceBreakdown = getServiceBreakdown();
      const totalCost = serviceBreakdown.reduce((total: number, service: any) => {
        return total + (service.price || 0);
      }, 0);

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

      // Generate calendar invite (.ics content) - Fixed Buffer issue
      const generateCalendarInvite = () => {
        if (!formData.selectedDate || !formData.selectedTime) return null;

        const eventDate = new Date(formData.selectedDate);
        const timeParts = formData.selectedTime.match(/(\d{1,2}):(\d{2}) (AM|PM)/i);
        if (!timeParts) return null;

        let [_, hours, minutes, period] = timeParts;
        let hoursNum = parseInt(hours, 10);
        const minutesNum = parseInt(minutes, 10);
        
        if (period.toUpperCase() === 'PM' && hoursNum !== 12) hoursNum += 12;
        if (period.toUpperCase() === 'AM' && hoursNum === 12) hoursNum = 0;
        
        const dateOnly = eventDate.toISOString().split('T')[0];
        const eventStartTime = new Date(`${dateOnly}T${String(hoursNum).padStart(2, '0')}:${String(minutesNum).padStart(2, '0')}:00-04:00`);
        const eventEndTime = new Date(eventStartTime.getTime() + 30 * 60000); // 30 minutes

        const formatDateForICS = (date: Date) => {
          return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//NJREAP//Property Service//EN',
          'BEGIN:VEVENT',
          `DTSTART:${formatDateForICS(eventStartTime)}`,
          `DTEND:${formatDateForICS(eventEndTime)}`,
          `SUMMARY:Property Service Appointment - ${propertyData?.address || 'Property'}`,
          `DESCRIPTION:Property service appointment with NJREAP\\n\\nServices: ${serviceBreakdown.map((s: any) => `${s.name} ($${s.price})`).join(', ')}\\n\\nProperty: ${propertyData?.address || 'N/A'}`,
          `LOCATION:${propertyData?.address || 'Property Location'}`,
          `UID:${Date.now()}@njreap.com`,
          'STATUS:CONFIRMED',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');

        return icsContent;
      };

      const calendarInvite = generateCalendarInvite();

      // Create beautiful HTML email
      const customerEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Service Confirmation - NJREAP</title>
          <style>
            .email-container { max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; }
            .header { background-color: #4d0a97; color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
            .content { padding: 30px 20px; background-color: #ffffff; }
            .section { margin-bottom: 30px; }
            .section h2 { color: #4d0a97; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #e8e8e8; padding-bottom: 8px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .info-card { background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4d0a97; }
            .info-card h3 { margin: 0 0 10px 0; color: #4d0a97; font-size: 16px; }
            .info-card p { margin: 5px 0; color: #333; font-size: 14px; }
            .services-list { background-color: #f8f9fa; padding: 20px; border-radius: 8px; }
            .service-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e8e8e8; }
            .service-item:last-child { border-bottom: none; }
            .service-name { font-weight: 500; color: #333; }
            .service-price { font-weight: 600; color: #4d0a97; }
            .total-section { background-color: #4d0a97; color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .total-amount { font-size: 24px; font-weight: 600; margin: 0; }
            .appointment-highlight { background-color: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3; }
            .footer { background-color: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
            @media (max-width: 600px) {
              .info-grid { grid-template-columns: 1fr; }
              .service-item { flex-direction: column; align-items: flex-start; }
              .service-price { margin-top: 5px; }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Thank You for Choosing NJREAP!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your service request has been confirmed</p>
            </div>
            
            <div class="content">
              <div class="section">
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                  Dear ${firstName},<br><br>
                  Thank you for booking a service with New Jersey Real Estate Appraisals and Photography. 
                  We've received your request and are excited to help with your property needs.
                </p>
              </div>

              <div class="section">
                <h2>📋 Service Summary</h2>
                <div class="services-list">
                  ${serviceBreakdown.map((service: any) => `
                    <div class="service-item">
                      <span class="service-name">${service.name}</span>
                      <span class="service-price">$${service.price}</span>
                    </div>
                  `).join('')}
                </div>
                <div class="total-section">
                  <p class="total-amount">Total: $${totalCost}</p>
                </div>
              </div>

              <div class="section">
                <h2>🏠 Property Information</h2>
                <div class="info-grid">
                  <div class="info-card">
                    <h3>Address</h3>
                    <p>${propertyData?.address || 'N/A'}</p>
                  </div>
                  <div class="info-card">
                    <h3>Living Area</h3>
                    <p>${getDisplayLivingSqFt()}</p>
                  </div>
                </div>
                ${propertyData?.countyData?.Yr_Built ? `
                <div class="info-grid">
                  <div class="info-card">
                    <h3>Year Built</h3>
                    <p>${propertyData.countyData.Yr_Built}</p>
                  </div>
                  <div class="info-card">
                    <h3>County</h3>
                    <p>${propertyData.countyData.COUNTY_NAME || 'N/A'}</p>
                  </div>
                </div>
                ` : ''}
              </div>

              ${formData.selectedServices.includes('appraisal') ? `
              <div class="section">
                <h2>📊 Appraisal Details</h2>
                <div class="info-grid">
                  <div class="info-card">
                    <h3>Property Type</h3>
                    <p>${formData.appraisalPropertyType || 'N/A'}</p>
                  </div>
                  <div class="info-card">
                    <h3>Intended Use</h3>
                    <p>${formData.appraisalIntendedUse || 'N/A'}</p>
                  </div>
                </div>
                <div class="info-grid">
                  <div class="info-card">
                    <h3>Report Type</h3>
                    <p>${formData.appraisalReportOption || 'N/A'}</p>
                  </div>
                  <div class="info-card">
                    <h3>Effective Date</h3>
                    <p>${formData.appraisalEffectiveDate || 'N/A'}</p>
                  </div>
                </div>
              </div>
              ` : ''}

              ${formData.selectedDate ? `
              <div class="section">
                <div class="appointment-highlight">
                  <h2 style="margin-top: 0; color: #1976d2;">📅 Scheduled Appointment</h2>
                  <p style="font-size: 18px; margin: 10px 0;"><strong>Date:</strong> ${new Date(formData.selectedDate).toLocaleDateString()}</p>
                  <p style="font-size: 18px; margin: 10px 0;"><strong>Time:</strong> ${formData.selectedTime}</p>
                  <p style="margin: 15px 0 0 0; font-size: 14px;">A calendar invite is attached to this email for your convenience.</p>
                </div>
              </div>
              ` : ''}

              <div class="section">
                <h2>📞 Next Steps</h2>
                <ul style="line-height: 1.8; color: #333;">
                  <li>We'll send you an invoice within 24 hours</li>
                  <li>Our team will contact you to confirm appointment details</li>
                  <li>Add the calendar event to your schedule</li>
                  <li>We'll arrive promptly at the scheduled time</li>
                </ul>
              </div>

              <div class="section">
                <p style="font-size: 14px; line-height: 1.6; color: #666;">
                  If you have any questions or need to make changes, please contact us at 
                  <a href="mailto:info@njreap.com" style="color: #4d0a97;">info@njreap.com</a> 
                  or call <a href="tel:+19084378505" style="color: #4d0a97;">(908) 437-8505</a>.
                </p>
              </div>
            </div>

            <div class="footer">
              <p><strong>New Jersey Real Estate Appraisals and Photography</strong></p>
              <p>Professional Property Services | Licensed & Insured</p>
              <p>Email: info@njreap.com | Phone: (908) 437-8505</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Plain text fallback
      const customerEmailText = `
Thank You for Choosing NJREAP!

Dear ${firstName},

Thank you for booking a service with New Jersey Real Estate Appraisals and Photography. We've received your request and are excited to help with your property needs.

SERVICE SUMMARY:
${serviceBreakdown.map((service: any) => `• ${service.name} - $${service.price}`).join('\n')}

Total: $${totalCost}

PROPERTY INFORMATION:
• Address: ${propertyData?.address || 'N/A'}
• Living Area: ${getDisplayLivingSqFt()}
${propertyData?.countyData?.Yr_Built ? `• Year Built: ${propertyData.countyData.Yr_Built}` : ''}
${propertyData?.countyData?.COUNTY_NAME ? `• County: ${propertyData.countyData.COUNTY_NAME}` : ''}

${formData.selectedServices.includes('appraisal') ? `
APPRAISAL DETAILS:
• Property Type: ${formData.appraisalPropertyType || 'N/A'}
• Intended Use: ${formData.appraisalIntendedUse || 'N/A'}
• Report Type: ${formData.appraisalReportOption || 'N/A'}
• Effective Date: ${formData.appraisalEffectiveDate || 'N/A'}
` : ''}

${formData.selectedDate ? `
SCHEDULED APPOINTMENT:
• Date: ${new Date(formData.selectedDate).toLocaleDateString()}
• Time: ${formData.selectedTime}

A calendar invite is attached to this email for your convenience.
` : ''}

NEXT STEPS:
• We'll send you an invoice within 24 hours
• Our team will contact you to confirm appointment details
• Add the calendar event to your schedule
• We'll arrive promptly at the scheduled time

If you have any questions or need to make changes, please contact us at info@njreap.com or call (908) 437-8505.

Best regards,
New Jersey Real Estate Appraisals and Photography
Professional Property Services | Licensed & Insured
Email: info@njreap.com | Phone: (908) 437-8505
      `;

      // Prepare email attachments - Fixed Buffer issue by using btoa
      const attachments = [];
      if (calendarInvite) {
        // Use btoa instead of Buffer in Deno environment
        const encoder = new TextEncoder();
        const data = encoder.encode(calendarInvite);
        const base64 = btoa(String.fromCharCode(...data));
        
        attachments.push({
          filename: 'appointment.ics',
          content: base64,
          type: 'text/calendar',
          disposition: 'attachment'
        });
      }

      // Send email to customer with BCC to info@njreap.com
      const customerEmailResponse = await resend.emails.send({
        from: "NJREAP <noreply@njreap.com>", // Updated to use your verified domain
        to: [email],
        bcc: ["info@njreap.com"],
        subject: "[NEW REQUEST] Service Confirmation - NJREAP",
        html: customerEmailHTML,
        text: customerEmailText,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      console.log('Service request confirmation email sent successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          emailSent: customerEmailResponse
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );

    } else {
      // Regular contact form submission
      console.log('Sending regular contact form notification');
      
      const contactFormResponse = await resend.emails.send({
        from: "NJREAP Contact Form <noreply@njreap.com>", // Updated to use your verified domain
        to: ["info@njreap.com"],
        subject: `New Contact Form Submission from ${firstName} ${lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4d0a97; margin-bottom: 20px;">New Contact Form Submission</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0;">Contact Information</h3>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            </div>

            <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Message</h3>
              <div style="white-space: pre-line; line-height: 1.6;">${message}</div>
            </div>
          </div>
        `,
      });

      // Send confirmation to customer
      const confirmationResponse = await resend.emails.send({
        from: "NJREAP <noreply@njreap.com>", // Updated to use your verified domain
        to: [email],
        subject: "Thank you for contacting NJREAP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4d0a97; margin-bottom: 20px;">Thank you for contacting us!</h2>
            
            <p>Dear ${firstName},</p>
            
            <p>We have received your message and will get back to you within 24 hours.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Your Message</h3>
              <div style="white-space: pre-line; line-height: 1.6;">${message}</div>
            </div>
            
            <p>If you have any urgent questions, please contact us at:</p>
            <p>📞 <strong>Phone:</strong> (908) 437-8505<br>
            📧 <strong>Email:</strong> info@njreap.com</p>
            
            <p>Thank you for choosing NJREAP!</p>
            
            <p>Best regards,<br>
            The NJREAP Team</p>
          </div>
        `,
      });

      console.log('Contact form emails sent:', { contactFormResponse, confirmationResponse });

      return new Response(
        JSON.stringify({ 
          success: true, 
          contactFormSent: contactFormResponse,
          confirmationSent: confirmationResponse
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
