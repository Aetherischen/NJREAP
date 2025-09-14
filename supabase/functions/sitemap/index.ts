import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
}

interface PropertyListing {
  slug: string;
  updated_at: string;
}

interface BlogPost {
  slug: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all public property listings
    const { data: properties, error: propertiesError } = await supabase
      .from('property_listings')
      .select('slug, updated_at')
      .eq('is_public', true)
      .not('slug', 'is', null)

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError)
    }

    // Get all published blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)

    if (blogError) {
      console.error('Error fetching blog posts:', blogError)
    }

    // Generate current date for lastmod
    const currentDate = new Date().toISOString().split('T')[0]

    // Start building the sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Home Page -->
  <url>
    <loc>https://njreap.com/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- About Page -->
  <url>
    <loc>https://njreap.com/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Services Page -->
  <url>
    <loc>https://njreap.com/services</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Gallery Page -->
  <url>
    <loc>https://njreap.com/gallery</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Showcase Page -->
  <url>
    <loc>https://njreap.com/showcase</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Blog Main Page -->
  <url>
    <loc>https://njreap.com/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- FAQs Page -->
  <url>
    <loc>https://njreap.com/faqs</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Contact Page -->
  <url>
    <loc>https://njreap.com/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Privacy Policy -->
  <url>
    <loc>https://njreap.com/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <!-- Terms of Service -->
  <url>
    <loc>https://njreap.com/terms</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <!-- County Pages -->
  <url>
    <loc>https://njreap.com/counties/hunterdon</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://njreap.com/counties/bergen</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://njreap.com/counties/essex</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://njreap.com/counties/hudson</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://njreap.com/counties/mercer</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://njreap.com/counties/middlesex</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://njreap.com/counties/monmouth</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://njreap.com/counties/morris</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://njreap.com/counties/passaic</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://njreap.com/counties/somerset</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://njreap.com/counties/sussex</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://njreap.com/counties/union</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://njreap.com/counties/warren</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`

    // Add public property showcase pages dynamically
    if (properties && properties.length > 0) {
      sitemap += '\n  \n  <!-- Public Property Showcase Pages -->'
      
      for (const property of properties as PropertyListing[]) {
        const lastmod = new Date(property.updated_at).toISOString().split('T')[0]
        sitemap += `
  <url>
    <loc>https://njreap.com/showcase/${property.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
      }
    }

    // Add published blog posts dynamically
    if (blogPosts && blogPosts.length > 0) {
      sitemap += '\n  \n  <!-- Blog Posts -->'
      
      for (const post of blogPosts as BlogPost[]) {
        const lastmod = new Date(post.updated_at).toISOString().split('T')[0]
        sitemap += `
  <url>
    <loc>https://njreap.com/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
      }
    }

    // Close the sitemap
    sitemap += '\n</urlset>'

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<error>Unable to generate sitemap</error>`,
      {
        headers: corsHeaders,
        status: 500,
      }
    )
  }
})