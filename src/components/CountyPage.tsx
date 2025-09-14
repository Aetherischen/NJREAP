import { useState } from 'react';
import { useSEO } from '@/hooks/useSEO';
import Layout from '@/components/Layout';
import CountyHero from '@/components/CountyHero';
import { GetQuoteModal } from '@/components/GetQuoteModal';
import Services from '@/components/Services';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Home, TrendingUp, Award } from 'lucide-react';
import type { County } from '@/data/counties';

interface CountyPageProps {
  county: County;
}

const CountyPage = ({ county }: CountyPageProps) => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // SEO optimization for county page
  useSEO({
    title: `Real Estate Appraisals in ${county.name} County, NJ | NJREAP`,
    description: `Professional real estate appraisal services in ${county.name} County, New Jersey. Licensed appraisers serving all ${county.municipalities.length} municipalities including ${county.municipalities.slice(0, 5).join(', ')} and more.`,
    keywords: `${county.name} county appraisal, real estate appraisal ${county.name} county, property valuation ${county.municipalities.slice(0, 10).join(', ')}, NJ appraisal services`,
    canonical: `https://njreap.com/${county.slug}`,
    ogImage: '/images/pages/bg-hero.webp'
  });

  const handleGetQuote = () => {
    setIsQuoteModalOpen(true);
  };

  // Group municipalities for better display
  const municipalityGroups = [];
  const municipalitiesPerColumn = Math.ceil(county.municipalities.length / 3);
  
  for (let i = 0; i < county.municipalities.length; i += municipalitiesPerColumn) {
    municipalityGroups.push(county.municipalities.slice(i, i + municipalitiesPerColumn));
  }

  return (
    <Layout>
      <CountyHero county={county} onGetQuote={handleGetQuote} />
      
      {/* County Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="text-[#4d0a97] border-[#4d0a97]/30 mb-4">
              Local Expertise
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose NJREAP in {county.name} County?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our certified appraisers have extensive knowledge of {county.name} County's unique market conditions and property types.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {county.keyFeatures.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4d0a97] to-[#a044e3] rounded-lg flex items-center justify-center mx-auto mb-4">
                    {index === 0 && <Home className="w-6 h-6 text-white" />}
                    {index === 1 && <TrendingUp className="w-6 h-6 text-white" />}
                    {index === 2 && <Award className="w-6 h-6 text-white" />}
                    {index === 3 && <MapPin className="w-6 h-6 text-white" />}
                  </div>
                  <CardTitle className="text-lg">{feature}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Municipalities Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="text-[#4d0a97] border-[#4d0a97]/30 mb-4">
              Service Areas
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Municipalities We Serve in {county.name} County
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our certified appraisers provide professional real estate valuation services throughout all {county.municipalities.length} municipalities in {county.name} County.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {municipalityGroups.map((group, groupIndex) => (
              <Card key={groupIndex}>
                <CardHeader>
                  <CardTitle className="text-xl text-center">
                    <MapPin className="w-5 h-5 inline-block mr-2 text-[#4d0a97]" />
                    Group {groupIndex + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {group.map((municipality, index) => (
                      <li key={index} className="flex items-center text-muted-foreground">
                        <div className="w-2 h-2 bg-[#4d0a97] rounded-full mr-3"></div>
                        {municipality}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <Services hideReadyToStart={true} />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#4d0a97] to-[#a044e3] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Your {county.name} County Property Appraised?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Contact our certified appraisers today for professional, accurate, and timely real estate valuation services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetQuote}
              className="bg-white text-[#4d0a97] hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Get Free Quote
            </button>
            <a 
              href={`tel:${String.fromCharCode(57, 48, 56, 52, 51, 55, 56, 53, 48, 53)}`}
              className="border-2 border-white text-white hover:bg-white hover:text-[#4d0a97] px-8 py-3 rounded-lg font-semibold text-lg transition-colors inline-block"
            >
              Call {String.fromCharCode(40, 57, 48, 56, 41, 32, 52, 51, 55, 45, 56, 53, 48, 53)}
            </a>
          </div>
        </div>
      </section>

      <GetQuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
      />
    </Layout>
  );
};

export default CountyPage;