
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://njreap.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
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

    // Create client for auth verification
    const authClient = createClient(
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

    console.log('Generating weekly report...');

    // Get data from the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoISO = oneWeekAgo.toISOString();

    // Fetch statistics for the report
    const [
      { data: newJobs, error: jobsError },
      { data: newBlogPosts, error: blogError },
      { data: newGalleryItems, error: galleryError },
      { data: totalJobs, error: totalJobsError },
      { data: totalBlogPosts, error: totalBlogError }
    ] = await Promise.all([
      supabaseClient.from('jobs').select('*').gte('created_at', oneWeekAgoISO),
      supabaseClient.from('blog_posts').select('*').gte('created_at', oneWeekAgoISO),
      supabaseClient.from('gallery_collections').select('*').gte('created_at', oneWeekAgoISO),
      supabaseClient.from('jobs').select('id', { count: 'exact', head: true }),
      supabaseClient.from('blog_posts').select('id', { count: 'exact', head: true })
    ]);

    if (jobsError || blogError || galleryError || totalJobsError || totalBlogError) {
      console.error('Error fetching data:', { jobsError, blogError, galleryError, totalJobsError, totalBlogError });
      throw new Error('Failed to fetch report data');
    }

    // Calculate revenue from new jobs
    const weeklyRevenue = newJobs?.reduce((sum, job) => {
      return sum + (job.total_amount || 0);
    }, 0) || 0;

    // Get notification settings
    const { data: notificationSettings } = await supabaseClient
      .from('admin_settings')
      .select('notification_emails, weekly_reports_enabled')
      .single();

    const emailAddresses = notificationSettings?.notification_emails || ['info@njreap.com'];
    const weeklyReportsEnabled = notificationSettings?.weekly_reports_enabled !== false;

    if (!weeklyReportsEnabled) {
      console.log('Weekly reports are disabled');
      return new Response(
        JSON.stringify({ message: 'Weekly reports are disabled' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate HTML report
    const reportDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const htmlReport = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
              📊 Weekly Site Report - ${reportDate}
            </h1>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-top: 0;">📈 This Week's Activity</h2>
              <ul style="list-style: none; padding: 0;">
                <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong>New Jobs:</strong> ${newJobs?.length || 0}
                  ${weeklyRevenue > 0 ? `<span style="color: #059669;">(Revenue: $${weeklyRevenue.toFixed(2)})</span>` : ''}
                </li>
                <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong>New Blog Posts:</strong> ${newBlogPosts?.length || 0}
                </li>
                <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong>New Gallery Items:</strong> ${newGalleryItems?.length || 0}
                </li>
              </ul>
            </div>

            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-top: 0;">📊 Total Site Statistics</h2>
              <ul style="list-style: none; padding: 0;">
                <li style="padding: 8px 0; border-bottom: 1px solid #cbd5e1;">
                  <strong>Total Jobs:</strong> ${totalJobs?.count || 0}
                </li>
                <li style="padding: 8px 0; border-bottom: 1px solid #cbd5e1;">
                  <strong>Total Blog Posts:</strong> ${totalBlogPosts?.count || 0}
                </li>
              </ul>
            </div>

            ${newJobs && newJobs.length > 0 ? `
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #059669; margin-top: 0;">🏠 Recent Jobs</h2>
              ${newJobs.map(job => `
                <div style="border: 1px solid #d1fae5; padding: 15px; margin: 10px 0; border-radius: 6px; background: white;">
                  <h3 style="margin: 0 0 10px 0; color: #065f46;">${job.property_address || 'Property'}</h3>
                  <p style="margin: 5px 0;"><strong>Service:</strong> ${job.service_type || 'N/A'}</p>
                  <p style="margin: 5px 0;"><strong>Status:</strong> ${job.status || 'N/A'}</p>
                  <p style="margin: 5px 0;"><strong>Amount:</strong> $${job.total_amount || 0}</p>
                  <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(job.created_at).toLocaleDateString()}</p>
                </div>
              `).join('')}
            </div>
            ` : ''}

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;">
                <strong>💡 Pro Tip:</strong> This report is generated automatically every week. 
                You can modify notification settings in your admin dashboard.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #6b7280; font-size: 14px;">
                Generated on ${new Date().toLocaleString()}<br>
                NJ Real Estate & Appraisal Photography
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to all notification recipients
    for (const email of emailAddresses) {
      const emailResponse = await resend.emails.send({
        from: 'NJ Real Estate Photography <onboarding@resend.dev>',
        to: [email],
        subject: `[WEEKLY REPORT] Site Update - ${reportDate}`,
        html: htmlReport,
      });

      console.log(`Weekly report sent to ${email}:`, emailResponse);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Weekly report sent successfully',
        recipients: emailAddresses,
        stats: {
          newJobs: newJobs?.length || 0,
          newBlogPosts: newBlogPosts?.length || 0,
          newGalleryItems: newGalleryItems?.length || 0,
          weeklyRevenue: weeklyRevenue
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error sending weekly report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
