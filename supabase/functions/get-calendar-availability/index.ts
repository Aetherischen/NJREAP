
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://njreap.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_ORIGINS = [
  'https://njreap.com',
  'https://id-preview--d5532906-b829-495a-afb9-8c4220c9bb92.lovable.app'
];

// Validate origin to prevent API key abuse
function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Check origin header first
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }
  
  // Fallback to referer check
  if (referer && ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed))) {
    return true;
  }
  
  return false;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate origin to prevent API key abuse
  if (!validateOrigin(req)) {
    console.warn('Unauthorized origin attempted to access Calendar API:', req.headers.get('origin') || req.headers.get('referer'));
    return new Response(
      JSON.stringify({ message: "Unauthorized origin" }),
      { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { date } = await req.json();

    if (!date) {
      return new Response(
        JSON.stringify({ error: 'Date is required' }),
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

    // Calculate time range for the given date (9 AM to 6 PM)
    const selectedDate = new Date(date);
    const timeMin = new Date(selectedDate);
    timeMin.setHours(9, 0, 0, 0);
    
    const timeMax = new Date(selectedDate);
    timeMax.setHours(18, 0, 0, 0);

    // Fetch events from Google Calendar for the specified date range
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/c_1712250733bc2f736b638e461645ab39b3616c83d448b856314eec49124816d6@group.calendar.google.com/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text();
      throw new Error(`Failed to fetch calendar events: ${errorText}`);
    }

    const calendarData = await calendarResponse.json();

    // Extract busy time slots (only start and end times, no private content)
    const busySlots = (calendarData.items || []).map((event: any) => {
      const start = event.start?.dateTime || event.start?.date;
      const end = event.end?.dateTime || event.end?.date;
      
      return {
        start: start ? new Date(start).toISOString() : null,
        end: end ? new Date(end).toISOString() : null,
      };
    }).filter((slot: any) => slot.start && slot.end);

    return new Response(
      JSON.stringify({ 
        busySlots,
        date: date 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch calendar availability'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
