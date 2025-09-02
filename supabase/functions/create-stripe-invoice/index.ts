
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://njreap.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceRequest {
  jobId: string;
  amount: number;
  description?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
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

    // Create client for auth verification
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
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
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: profile, error: profileError } = await authClient
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

    console.log('=== STRIPE INVOICE CREATION START ===');
    
    const { jobId, amount, description }: InvoiceRequest = await req.json();

    // Check if Stripe key exists
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    // Initialize Stripe with secret key
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client with service role for database operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get job details from database
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error(`Job not found: ${jobError?.message}`);
    }

    // Check if customer already exists in Stripe
    const customers = await stripe.customers.list({
      email: job.client_email,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: job.client_email,
        name: job.client_name,
        phone: job.client_phone || undefined,
        metadata: {
          job_id: jobId,
          property_address: job.property_address
        }
      });
      customerId = customer.id;
    }

    // Create invoice with proper collection method
    const invoice = await stripe.invoices.create({
      customer: customerId,
      description: description || `${job.service_type.replace('_', ' ').toUpperCase()} service for ${job.property_address}`,
      collection_method: 'send_invoice',
      days_until_due: 30,
      metadata: {
        job_id: jobId,
        service_type: job.service_type,
        property_address: job.property_address
      },
      auto_advance: false, // Don't auto-finalize
    });

    // Add line item to invoice
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      description: description || `${job.service_type.replace('_', ' ').toUpperCase()} Service`,
    });

    // Finalize and send the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    const sentInvoice = await stripe.invoices.sendInvoice(invoice.id);

    // Update job record with invoice information
    const updateData = {
      stripe_invoice_id: sentInvoice.id,
      stripe_customer_id: customerId,
      invoice_status: 'sent',
      invoice_amount: amount,
      invoice_sent_at: new Date().toISOString(),
      status: 'invoice_sent' as any,
      quoted_amount: amount,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', jobId);

    if (updateError) {
      throw new Error(`Failed to update job: ${updateError.message}`);
    }

    console.log('=== STRIPE INVOICE CREATION SUCCESS ===');
    return new Response(
      JSON.stringify({ 
        success: true, 
        invoiceId: sentInvoice.id,
        invoiceUrl: sentInvoice.hosted_invoice_url,
        customerId: customerId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
