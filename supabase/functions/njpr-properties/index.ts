
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Remove CORS restrictions and validation functions - this is public customer-facing functionality

const NJPR_BASE_URL = "https://njpropertyrecords.com";
const NJPR_API_KEY = Deno.env.get('NJPR_API_KEY');

const njprHeaders = {
  "Content-Type": "application/json",
  "X-API-Key": NJPR_API_KEY!,
  "X-API-Version": "2"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    console.log('NJPR Properties API called:', {
      method: req.method,
      pathSegments,
      hasApiKey: !!NJPR_API_KEY
    });

    // POST /njpr-properties - Property search
    if (req.method === 'POST' && pathSegments.length === 1) {
      const body = await req.text();
      
    console.log('Property search request initiated');
      
      const response = await fetch(`${NJPR_BASE_URL}/api/search/properties`, {
        method: 'POST',
        body: body,
        headers: njprHeaders
      });

      const data = await response.json();
      
      console.log('NJPR search response:', {
        status: response.status,
        ok: response.ok,
        resultCount: data.result?.length || 0
      });

      if (!response.ok) {
        console.error('NJPR API error:', data);
        return new Response(
          JSON.stringify({ message: "Property search failed", error: data }),
          { 
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify(data.result),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // GET /njpr-properties/{id} - Get specific property
    if (req.method === 'GET' && pathSegments.length === 2) {
      const propertyId = pathSegments[1];
      
      console.log('Property details request for ID:', propertyId);
      
      const response = await fetch(`${NJPR_BASE_URL}/api/property/${propertyId}`, {
        headers: njprHeaders
      });

      const data = await response.json();
      
      console.log('NJPR property details response:', {
        status: response.status,
        ok: response.ok,
        hasResult: !!data.result
      });

      if (!response.ok) {
        console.error('NJPR API error:', data);
        return new Response(
          JSON.stringify({ message: "Property details fetch failed", error: data }),
          { 
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify(data.result),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Route not found" }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('NJPR Properties API error:', error);
    return new Response(
      JSON.stringify({ message: "Internal server error", error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
