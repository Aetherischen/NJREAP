
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NJPR_BASE_URL = "https://njpropertyrecords.com";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ message: `Method ${req.method} not allowed` }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Remove restrictive origin validation - this is for customer-facing functionality

    // Get API key
    const NJPR_API_KEY = Deno.env.get('NJPR_API_KEY');
    
    if (!NJPR_API_KEY) {
      return new Response(
        JSON.stringify({ message: "API key not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length < 2) {
      return new Response(
        JSON.stringify({ message: "Property ID and image type required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const propertyId = pathSegments[pathSegments.length - 2]; // Second to last segment
    const imageType = pathSegments[pathSegments.length - 1]; // Last segment

    // Map image types to the correct NJPR API endpoints
    let njprEndpoint = '';
    switch (imageType) {
      case 'preview':
        njprEndpoint = `/api/property/${propertyId}/preview-image`;
        break;
      case 'tax-map':
        njprEndpoint = `/api/property/${propertyId}/tax-map-snippet`;
        break;
      case 'street-map':
        njprEndpoint = `/api/property/${propertyId}/street-map-snippet`;
        break;
      default:
        return new Response(
          JSON.stringify({ message: "Invalid image type. Use: preview, tax-map, or street-map" }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }

    // Build headers exactly like the curl example
    const requestHeaders = {
      "accept": "*/*",
      "X-API-KEY": NJPR_API_KEY
    };

    // Include query string like AWS implementation does
    const queryString = url.search;
    const fullUrl = `${NJPR_BASE_URL}${njprEndpoint}${queryString}`;

    const response = await fetch(fullUrl, {
      headers: requestHeaders
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          message: "Image fetch failed", 
          status: response.status
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the image data as array buffer
    const imageBuffer = await response.arrayBuffer();

    // Return the raw image data directly instead of base64 encoding
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('content-type') || 'image/png',
        'Content-Disposition': `inline; filename="${propertyId}-${imageType}.png"`,
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
