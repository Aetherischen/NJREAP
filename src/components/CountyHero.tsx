import { ArrowRight, CheckCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { County } from '@/data/counties';

interface CountyHeroProps {
  county: County;
  onGetQuote: () => void;
}

const CountyHero = ({ county, onGetQuote }: CountyHeroProps) => {
  const features = [
    'Licensed & Certified Appraisers',
    'Local Market Expertise',
    '3 Day Delivery',
    `Serving All ${county.municipalities.length} Municipalities`
  ];

  return (
    <section className="relative bg-gradient-to-br from-[#4d0a97] via-[#a044e3] to-[#4d0a97] text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-purple-200">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{county.name} County, New Jersey</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Real Estate Appraisals in
                <span className="text-[#a044e3] block">
                  {county.name} County
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-purple-100 leading-relaxed">
                {county.description}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white/90">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onGetQuote}
                className="bg-primary text-white hover:bg-secondary text-lg px-8 py-3 h-auto font-semibold"
              >
                Get Instant Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Link to="/gallery">
                <Button 
                  className="bg-primary text-white hover:bg-secondary text-lg px-8 py-3 h-auto font-semibold w-full"
                >
                  View Our Work
                </Button>
              </Link>
            </div>
          </div>

          {/* County Stats */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">{county.name} County Overview</h3>
                <p className="text-purple-100 mb-6">Professional appraisal services throughout the region</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 text-[#020817]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-[#374151]">
                    <span>Population</span>
                    <span className="font-semibold">{county.population}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#374151]">
                    <span>Area</span>
                    <span className="font-semibold">{county.area}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#374151]">
                    <span>Municipalities Served</span>
                    <span className="font-semibold">{county.municipalities.length}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between font-bold text-lg">
                      <span>Local Expertise</span>
                      <span className="text-[#4d0a97]">Certified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountyHero;