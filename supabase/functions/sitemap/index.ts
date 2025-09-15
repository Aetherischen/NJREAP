import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Start building the sitemap XML - construct as array for better control
    const sitemapLines = []
    sitemapLines.push('<?xml version="1.0" encoding="UTF-8"?>')
    sitemapLines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    // Add static pages
    const staticPages = [
      { url: 'https://njreap.com/', changefreq: 'weekly', priority: '1.0' },
      { url: 'https://njreap.com/about', changefreq: 'monthly', priority: '0.8' },
      { url: 'https://njreap.com/services', changefreq: 'monthly', priority: '0.9' },
      { url: 'https://njreap.com/gallery', changefreq: 'weekly', priority: '0.7' },
      { url: 'https://njreap.com/showcase', changefreq: 'weekly', priority: '0.8' },
      { url: 'https://njreap.com/blog', changefreq: 'daily', priority: '0.8' },
      { url: 'https://njreap.com/faqs', changefreq: 'monthly', priority: '0.6' },
      { url: 'https://njreap.com/contact', changefreq: 'monthly', priority: '0.7' },
      { url: 'https://njreap.com/privacy', changefreq: 'yearly', priority: '0.3' },
      { url: 'https://njreap.com/terms', changefreq: 'yearly', priority: '0.3' }
    ]
    
    staticPages.forEach(page => {
      sitemapLines.push('  <url>')
      sitemapLines.push(`    <loc>${page.url}</loc>`)
      sitemapLines.push(`    <lastmod>${currentDate}</lastmod>`)
      sitemapLines.push(`    <changefreq>${page.changefreq}</changefreq>`)
      sitemapLines.push(`    <priority>${page.priority}</priority>`)
      sitemapLines.push('  </url>')
    })
    
    // Add county pages
    const countyPages = [
      'hunterdon', 'bergen', 'essex', 'hudson', 'mercer', 'middlesex', 
      'monmouth', 'morris', 'passaic', 'somerset', 'sussex', 'union', 'warren'
    ]
    
    countyPages.forEach(county => {
      sitemapLines.push('  <url>')
      sitemapLines.push(`    <loc>https://njreap.com/counties/${county}</loc>`)
      sitemapLines.push(`    <lastmod>${currentDate}</lastmod>`)
      sitemapLines.push('    <changefreq>monthly</changefreq>')
      sitemapLines.push('    <priority>0.8</priority>')
      sitemapLines.push('  </url>')
    })

    // Add public property showcase pages dynamically
    if (properties && properties.length > 0) {
      for (const property of properties as PropertyListing[]) {
        const lastmod = new Date(property.updated_at).toISOString().split('T')[0]
        sitemapLines.push('  <url>')
        sitemapLines.push(`    <loc>https://njreap.com/showcase/${property.slug}</loc>`)
        sitemapLines.push(`    <lastmod>${lastmod}</lastmod>`)
        sitemapLines.push('    <changefreq>monthly</changefreq>')
        sitemapLines.push('    <priority>0.7</priority>')
        sitemapLines.push('  </url>')
      }
    }

    // Add published blog posts dynamically
    if (blogPosts && blogPosts.length > 0) {
      for (const post of blogPosts as BlogPost[]) {
        const lastmod = new Date(post.updated_at).toISOString().split('T')[0]
        sitemapLines.push('  <url>')
        sitemapLines.push(`    <loc>https://njreap.com/blog/${post.slug}</loc>`)
        sitemapLines.push(`    <lastmod>${lastmod}</lastmod>`)
        sitemapLines.push('    <changefreq>monthly</changefreq>')
        sitemapLines.push('    <priority>0.6</priority>')
        sitemapLines.push('  </url>')
      }
    }

    // Close the sitemap
    sitemapLines.push('</urlset>')

    // Join all lines and ensure proper XML formatting
    const sitemap = sitemapLines.join('\n')
    
    // Remove any BOM characters
    const cleanSitemap = sitemap.replace(/^\uFEFF/, '')

    return new Response(cleanSitemap, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<error>Unable to generate sitemap</error>`

    return new Response(errorXml.trimStart(), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
      }
    })
  }
})