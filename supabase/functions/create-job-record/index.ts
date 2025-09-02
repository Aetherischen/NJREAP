
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface JobData {
  client_name: string;
  client_email: string;
  client_phone?: string;
  property_address: string;
  service_type?: string;
  status?: string;
  description?: string;
  quoted_amount?: number;
  scheduled_date?: string;
  raw_njpr_data?: string;
  referral_source?: string;
  referral_other_description?: string;
  captchaToken?: string;
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

  try {
    // Create service role client for secure database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const jobData: JobData = await req.json();

    // Validate required fields
    if (!jobData.client_name || !jobData.client_email || !jobData.property_address) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: client_name, client_email, or property_address' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Ensure proper data types and defaults
    const processedJobData = {
      client_name: jobData.client_name,
      client_email: jobData.client_email,
      client_phone: jobData.client_phone || null,
      property_address: jobData.property_address,
      service_type: jobData.service_type || 'photography',
      status: jobData.status || 'pending',
      description: jobData.description || null,
      quoted_amount: jobData.quoted_amount ? Number(jobData.quoted_amount) : null,
      scheduled_date: jobData.scheduled_date || null,
      raw_njpr_data: jobData.raw_njpr_data || null,
      referral_source: jobData.referral_source || null,
      referral_other_description: jobData.referral_other_description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create job using service role key (bypasses RLS restrictions)
    const { data, error } = await supabaseClient
      .from('jobs')
      .insert([processedJobData])
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ job: data }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
