
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BlogNotificationRequest {
  post_id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Extract JWT token and verify user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { post_id, title, content, excerpt, slug }: BlogNotificationRequest = await req.json();
    
    console.log('Processing blog notification for post:', post_id);
    console.log('Post title:', title);
    console.log('Post slug:', slug);

    // Get all active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('blog_subscribers')
      .select('email')
      .eq('is_active', true);

    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError);
      throw subscribersError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log('No active subscribers found');
      return new Response(JSON.stringify({ message: 'No subscribers to notify' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${subscribers.length} subscribers to notify`);

    // Create email content
    const emailContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #4d0a97, #a044e3); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Blog Post from NJREAP</h1>
        </div>
        
        <div style="padding: 40px 20px; background: #ffffff;">
          <h2 style="color: #4d0a97; margin-bottom: 20px; font-size: 24px;">${title}</h2>
          
          ${excerpt ? `<p style="color: #666; font-size: 16px; margin-bottom: 30px; font-style: italic;">${excerpt}</p>` : ''}
          
          <div style="color: #333; font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
            ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://njreap.com/blog/${slug}" 
               style="display: inline-block; background: #4d0a97; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Read Full Article
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">
            You're receiving this because you subscribed to NJREAP blog updates.
          </p>
          <p style="color: #666; margin: 0; font-size: 14px;">
            <a href="mailto:info@njreap.com?subject=Unsubscribe" style="color: #4d0a97; text-decoration: none;">
              Unsubscribe from these emails
            </a>
          </p>
        </div>
      </div>
    `;

    // Send emails to all subscribers
    const emailPromises = subscribers.map(async (subscriber, index) => {
      try {
        // Don't log email addresses for privacy
        console.log(`Sending email ${index + 1} of ${subscribers.length}`);
        const emailResponse = await resend.emails.send({
          from: "NJREAP Blog <blog@njreap.com>",
          to: [subscriber.email],
          subject: `New Post: ${title}`,
          html: emailContent,
        });
        
        console.log(`Email ${index + 1} sent successfully:`, emailResponse.data?.id);
        return { success: true, id: emailResponse.data?.id };
      } catch (error) {
        console.error(`Failed to send email ${index + 1}:`, error);
        return { success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Email notification complete: ${successful} successful, ${failed} failed`);

    return new Response(JSON.stringify({ 
      message: `Sent ${successful} emails, ${failed} failed`,
      // Don't expose email addresses in response
      total_sent: successful,
      total_failed: failed
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-blog-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
