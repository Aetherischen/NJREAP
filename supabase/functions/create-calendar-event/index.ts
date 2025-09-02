import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      p_function_name: 'create-calendar-event',
      p_max_requests: 20, // 20 calendar events per hour per IP
      p_window_minutes: 60
    });
    
    if (error) {
      console.error('Rate limit check error:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return false;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
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
    console.log('Received request for calendar event creation');
    const eventData = await req.json();
    console.log('Event data received:', JSON.stringify(eventData, null, 2));
    
    console.log('Processing calendar event creation request');

    // Extract data from our form structure
    const { formData, propertyData } = eventData;
    const date = formData?.selectedDate;
    const time = formData?.selectedTime;
    const address = propertyData?.address;

    console.log('Extracted data:', { date, time, address });

    if (!date || !time || !address) {
      console.log('Missing required data - returning error');
      return new Response(
        JSON.stringify({ 
          error: 'Missing date, time, or address', 
          received: { date, time, address } 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Google credentials from Supabase secrets
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN');

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Missing Google credentials in environment variables');
    }

    console.log('Credentials found, proceeding with calendar creation');

    // Get access token using refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to refresh token: ${await tokenResponse.text()}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Parse time with AM/PM conversion
    console.log('Parsing time:', time);
    const timeParts = time.match(/(\d{1,2}):(\d{2}) (AM|PM)/i);
    if (!timeParts) {
      throw new Error(`Invalid time format: expected HH:MM AM/PM, got ${time}`);
    }

    let [_, hours, minutes, period] = timeParts;
    let hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);
    
    if (period.toUpperCase() === 'PM' && hoursNum !== 12) hoursNum += 12;
    if (period.toUpperCase() === 'AM' && hoursNum === 12) hoursNum = 0;
    
    const formattedTime = `${String(hoursNum).padStart(2, '0')}:${String(minutesNum).padStart(2, '0')}:00`;

    // Create start and end times
    const eventDate = new Date(date);
    const dateOnly = eventDate.toISOString().split('T')[0];
    const eventStartTime = new Date(`${dateOnly}T${formattedTime}-04:00`);
    
    if (isNaN(eventStartTime.getTime())) {
      throw new Error('Invalid date or time format after parsing');
    }
    
    const eventEndTime = new Date(eventStartTime.getTime() + 30 * 60000); // 30 minutes

    // Use the service breakdown that's already calculated with correct prices
    const serviceBreakdown = formData.serviceBreakdown || [];
    const selectedServiceNames = serviceBreakdown
      .filter((service: any) => service.id !== 'discount')
      .map((service: any) => service.name);
    
    const subtotal = serviceBreakdown
      .filter((service: any) => service.id !== 'discount')
      .reduce((total: number, service: any) => total + service.price, 0);
    
    const discountAmount = formData.discountAmount || 0;
    const totalCost = subtotal - discountAmount;

    // Format sale date if available
    const formatSaleDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } catch {
        return dateString;
      }
    };

    // Format currency
    const formatCurrency = (value: any) => {
      if (!value || value === "N/A" || value === null || value === undefined) return "N/A";
      const num = parseInt(value.toString().replace(/[^0-9]/g, "")) || 0;
      return `$${num.toLocaleString()}`;
    };

    // Format number with commas
    const formatNumber = (value: any) => {
      if (!value || value === "N/A" || value === null || value === undefined) return "N/A";
      const num = parseInt(value.toString().replace(/[^0-9]/g, "")) || 0;
      return num.toLocaleString();
    };

    // Calculate ownership duration
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

    // Extract comprehensive property information
    const owner = propertyData?.countyData?.Owners_Name || 'N/A';
    const salePrice = propertyData?.countyData?.Sale_Price ? formatCurrency(propertyData.countyData.Sale_Price) : 'N/A';
    const rawSaleDate = propertyData?.countyData?.Sale_Date || 'N/A';
    const saleDate = formatSaleDate(rawSaleDate);
    const ownerFor = calculateOwnerFor(rawSaleDate);
    
    // Living square feet
    const sqft = propertyData?.countyData?.Sq_Ft || propertyData?.countyData?.Living_Sqft;
    const livingSquareFeet = sqft ? formatNumber(sqft) : (formData.userEnteredSqFt ? formatNumber(formData.userEnteredSqFt) : 'N/A');
    
    // Year built
    const yearBuilt = propertyData?.countyData?.Yr_Built || 'N/A';
    
    // Block/Lot/Qualifier
    let blockLot = 'N/A';
    const block = propertyData?.countyData?.Block;
    const lot = propertyData?.countyData?.Lot;
    const qualifier = propertyData?.countyData?.Qual;
    if (block && lot) {
      blockLot = `${block}/${lot}`;
      if (qualifier) blockLot += `/${qualifier}`;
    }

    // Acreage
    const acres = propertyData?.countyData?.Acreage;
    const acreage = acres ? `${parseFloat(acres).toFixed(4)} ac` : 'N/A';

    // Absentee and Corporate ownership
    const absentee = propertyData?.countyData?.Absentee ? "Yes" : "No";
    const corporateOwned = propertyData?.countyData?.Corporate_Owned ? "Yes" : "No";

    // City/State/Zip
    const cityStateZip = propertyData?.countyData?.City_State_Zip || 'N/A';

    // Create event description with discount information
    const description = `
Inspection scheduled via NJREAP Quote System

**Property Information:**
- Address: ${propertyData?.address || 'N/A'}
- City/State/Zip: ${cityStateZip}
- Owner: ${owner}
- Sale Price: ${salePrice}
- Sale Date: ${saleDate}
- Owner For: ${ownerFor}
- Living Square Feet: ${livingSquareFeet}
- Year Built: ${yearBuilt}
- Block/Lot/Qual: ${blockLot}
- Acreage: ${acreage}
- Absentee: ${absentee}
- Corporate Owned: ${corporateOwned}

**User Information:**
- Name: ${formData.firstName} ${formData.lastName}
- Phone: ${formData.phone}
- Email: ${formData.email}
- Company: ${formData.company || 'N/A'}

**Service Information:**
- Services: ${selectedServiceNames.join(', ')}
- Subtotal: $${subtotal}
${discountAmount > 0 ? `- Discount (${formData.discountCode || 'NJPR'}): -$${discountAmount}` : ''}
- Total Cost: $${totalCost}

**Appraisal Details:**
${formData.selectedServices.includes('appraisal') ? `
- Purpose: ${formData.appraisalPurpose || 'N/A'}
- Property Type: ${formData.appraisalPropertyType || 'N/A'}
- Interest Appraised: ${formData.appraisalInterestAppraised || 'N/A'}
- Intended Use: ${formData.appraisalIntendedUse || 'N/A'}
- Intended Users: ${formData.appraisalIntendedUsers || 'N/A'}
- Type of Value: ${formData.appraisalTypeOfValue || 'N/A'}
- Effective Date: ${formData.appraisalEffectiveDate || 'N/A'}
- Report Option: ${formData.appraisalReportOption || 'N/A'}
- Additional Notes: ${formData.appraisalAdditionalNotes || 'N/A'}
` : 'No appraisal service selected'}
    `.trim();

    // Create calendar event
    const calendarEvent = {
      summary: 'Property Inspection',
      location: address,
      description: description,
      start: { 
        dateTime: eventStartTime.toISOString(), 
        timeZone: 'America/New_York' 
      },
      end: { 
        dateTime: eventEndTime.toISOString(), 
        timeZone: 'America/New_York' 
      }
    };

    console.log('Creating calendar event for appointment');

    // Insert event into Google Calendar
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/c_1712250733bc2f736b638e461645ab39b3616c83d448b856314eec49124816d6@group.calendar.google.com/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text();
      throw new Error(`Failed to create calendar event: ${errorText}`);
    }

    const createdEvent = await calendarResponse.json();
    console.log('Event created with ID:', createdEvent.id);

    return new Response(
      JSON.stringify({ 
        message: 'Event created successfully', 
        eventId: createdEvent.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Calendar event creation error:', error.message);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create calendar event', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
