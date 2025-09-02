
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://njreap.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsRequest {
  startDate?: string;
  endDate?: string;
  metrics?: string[];
  dimensions?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT token and get user
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: { Authorization: `Bearer ${authHeader}` }
        }
      }
    );

    // Get user and verify admin role
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const { startDate = '30daysAgo', endDate = 'today', metrics = [], dimensions = [] }: AnalyticsRequest = await req.json();
    
    // Get credentials from Supabase secrets
    let privateKey = Deno.env.get('GA4_PRIVATE_KEY');
    const clientEmail = Deno.env.get('GA4_CLIENT_EMAIL');
    const propertyId = Deno.env.get('GA4_PROPERTY_ID');
    
    console.log('GA4 credentials check:', {
      hasPrivateKey: !!privateKey,
      hasClientEmail: !!clientEmail,
      hasPropertyId: !!propertyId,
      clientEmail,
      propertyId
    });
    
    if (!privateKey || !clientEmail || !propertyId) {
      throw new Error('Missing Google Analytics credentials');
    }

    // Clean and format the private key properly
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Ensure the private key has proper headers and formatting
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    }

    console.log('Creating JWT token for authentication');

    // Create JWT token for Google API authentication
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // Create the JWT manually
    const encoder = new TextEncoder();
    const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const signatureInput = `${headerBase64}.${payloadBase64}`;
    
    // Convert PEM to DER format for crypto.subtle
    const pemContents = privateKey
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    
    // Decode base64 to get raw bytes
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    
    console.log('Importing private key...');
    
    // Import the private key for signing
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    console.log('Signing JWT...');

    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      encoder.encode(signatureInput)
    );
    
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const jwt = `${headerBase64}.${payloadBase64}.${signatureBase64}`;

    console.log('Getting access token from Google OAuth');

    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Failed to get access token:', tokenData);
      throw new Error(`Failed to get access token: ${tokenData.error_description || tokenData.error}`);
    }

    console.log('Successfully obtained access token');

    // Make request to Google Analytics Data API with corrected metrics
    const analyticsRequest = {
      dateRanges: [{ startDate, endDate }],
      metrics: metrics.length > 0 ? metrics.map(m => ({ name: m })) : [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ],
      dimensions: dimensions.length > 0 ? dimensions.map(d => ({ name: d })) : [
        { name: 'date' }
      ]
    };

    console.log('Making request to GA4 Data API:', { propertyId, analyticsRequest });

    const analyticsResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsRequest),
      }
    );

    const analyticsData = await analyticsResponse.json();
    
    if (!analyticsResponse.ok) {
      console.error('Analytics API error:', analyticsData);
      throw new Error(`Analytics API error: ${analyticsData.error?.message || 'Unknown error'}`);
    }

    console.log('Successfully fetched analytics data:', {
      rowCount: analyticsData.rows?.length || 0,
      metricHeaders: analyticsData.metricHeaders?.length || 0,
      dimensionHeaders: analyticsData.dimensionHeaders?.length || 0
    });
    
    return new Response(JSON.stringify(analyticsData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check the function logs for more details'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
