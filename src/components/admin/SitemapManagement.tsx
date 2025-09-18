import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SitemapManagement = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSitemap, setCurrentSitemap] = useState('');
  const { toast } = useToast();

  const generateStaticSitemap = async () => {
    setIsGenerating(true);
    try {
      // Get current date for lastmod
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Get all public property listings
      const { data: properties, error: propertiesError } = await supabase
        .from('property_listings')
        .select('slug, updated_at')
        .eq('is_public', true)
        .not('slug', 'is', null);

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
      }

      // Get all published blog posts
      const { data: blogPosts, error: blogError } = await supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('published', true);

      if (blogError) {
        console.error('Error fetching blog posts:', blogError);
      }

      // Build sitemap XML
      const sitemapLines = [];
      sitemapLines.push('<?xml version="1.0" encoding="UTF-8"?>');
      sitemapLines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      
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
      ];
      
      staticPages.forEach(page => {
        sitemapLines.push('  <url>');
        sitemapLines.push(`    <loc>${page.url}</loc>`);
        sitemapLines.push(`    <lastmod>${currentDate}</lastmod>`);
        sitemapLines.push(`    <changefreq>${page.changefreq}</changefreq>`);
        sitemapLines.push(`    <priority>${page.priority}</priority>`);
        sitemapLines.push('  </url>');
      });
      
      // Add county pages
      const countyPages = [
        'hunterdon', 'bergen', 'essex', 'hudson', 'mercer', 'middlesex', 
        'monmouth', 'morris', 'passaic', 'somerset', 'sussex', 'union', 'warren'
      ];
      
      countyPages.forEach(county => {
        sitemapLines.push('  <url>');
        sitemapLines.push(`    <loc>https://njreap.com/counties/${county}</loc>`);
        sitemapLines.push(`    <lastmod>${currentDate}</lastmod>`);
        sitemapLines.push('    <changefreq>monthly</changefreq>');
        sitemapLines.push('    <priority>0.8</priority>');
        sitemapLines.push('  </url>');
      });

      // Add public property showcase pages
      if (properties && properties.length > 0) {
        properties.forEach(property => {
          const lastmod = new Date(property.updated_at).toISOString().split('T')[0];
          sitemapLines.push('  <url>');
          sitemapLines.push(`    <loc>https://njreap.com/showcase/${property.slug}</loc>`);
          sitemapLines.push(`    <lastmod>${lastmod}</lastmod>`);
          sitemapLines.push('    <changefreq>monthly</changefreq>');
          sitemapLines.push('    <priority>0.7</priority>');
          sitemapLines.push('  </url>');
        });
      }

      // Add published blog posts
      if (blogPosts && blogPosts.length > 0) {
        blogPosts.forEach(post => {
          const lastmod = new Date(post.updated_at).toISOString().split('T')[0];
          sitemapLines.push('  <url>');
          sitemapLines.push(`    <loc>https://njreap.com/blog/${post.slug}</loc>`);
          sitemapLines.push(`    <lastmod>${lastmod}</lastmod>`);
          sitemapLines.push('    <changefreq>monthly</changefreq>');
          sitemapLines.push('    <priority>0.6</priority>');
          sitemapLines.push('  </url>');
        });
      }

      // Close the sitemap
      sitemapLines.push('</urlset>');
      
      const sitemap = sitemapLines.join('\n');
      setCurrentSitemap(sitemap);
      
      toast({
        title: "Sitemap Generated",
        description: `Generated sitemap with ${staticPages.length + countyPages.length + (properties?.length || 0) + (blogPosts?.length || 0)} URLs. Copy the content below and manually update the public/sitemap.xml file.`
      });
      
    } catch (error) {
      console.error('Error generating sitemap:', error);
      toast({
        title: "Error",
        description: "Failed to generate sitemap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sitemap Management</CardTitle>
          <CardDescription>
            Generate and manage the static sitemap.xml file. This includes all static pages, counties, published blog posts, and public property listings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={generateStaticSitemap} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating Sitemap...' : 'Generate Updated Sitemap'}
          </Button>
          
          {currentSitemap && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Generated Sitemap XML (copy and paste into public/sitemap.xml):
              </label>
              <Textarea
                value={currentSitemap}
                readOnly
                className="min-h-[400px] font-mono text-xs"
                onClick={(e) => {
                  e.currentTarget.select();
                  navigator.clipboard.writeText(currentSitemap);
                  toast({
                    title: "Copied!",
                    description: "Sitemap XML copied to clipboard"
                  });
                }}
              />
              <p className="text-xs text-muted-foreground">
                Click the text area above to copy the sitemap to your clipboard, then manually update the public/sitemap.xml file.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SitemapManagement;