import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sitemap = () => {
  const [sitemapXml, setSitemapXml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        // Call the edge function to generate sitemap
        const { data, error } = await supabase.functions.invoke('sitemap');
        
        if (error) {
          console.error('Error calling sitemap function:', error);
          // Fallback: generate basic sitemap
          generateFallbackSitemap();
          return;
        }

        setSitemapXml(data);
      } catch (error) {
        console.error('Error generating sitemap:', error);
        generateFallbackSitemap();
      } finally {
        setLoading(false);
      }
    };

    const generateFallbackSitemap = async () => {
      try {
        // Get public properties
        const { data: properties } = await supabase
          .from('property_listings')
          .select('slug, updated_at')
          .eq('is_public', true)
          .not('slug', 'is', null);

        // Get published blog posts
        const { data: blogPosts } = await supabase
          .from('blog_posts')
          .select('slug, updated_at')
          .eq('published', true);

        const currentDate = new Date().toISOString().split('T')[0];

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
  </url>`;

        // Add public properties
        if (properties && properties.length > 0) {
          sitemap += '\n  \n  <!-- Public Property Showcase Pages -->';
          for (const property of properties) {
            const lastmod = new Date(property.updated_at).toISOString().split('T')[0];
            sitemap += `
  <url>
    <loc>https://njreap.com/showcase/${property.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
          }
        }

        // Add blog posts
        if (blogPosts && blogPosts.length > 0) {
          sitemap += '\n  \n  <!-- Blog Posts -->';
          for (const post of blogPosts) {
            const lastmod = new Date(post.updated_at).toISOString().split('T')[0];
            sitemap += `
  <url>
    <loc>https://njreap.com/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
          }
        }

        sitemap += '\n</urlset>';
        setSitemapXml(sitemap);
      } catch (error) {
        console.error('Error generating fallback sitemap:', error);
        setSitemapXml('<?xml version="1.0" encoding="UTF-8"?><error>Unable to generate sitemap</error>');
      }
    };

    generateSitemap();
  }, []);

  useEffect(() => {
    // Set page title for XML sitemap
    document.title = 'Sitemap - NJ REAP';
  }, []);

  if (loading) {
    return <div>Generating sitemap...</div>;
  }

  return (
    <pre 
      style={{ 
        fontFamily: 'monospace', 
        whiteSpace: 'pre-wrap',
        margin: 0,
        padding: '20px',
        background: '#f5f5f5'
      }}
      dangerouslySetInnerHTML={{ __html: sitemapXml }}
    />
  );
};

export default Sitemap;