import { ArrowRight, CheckCircle, Shield, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import PropertySearch from '@/components/PropertySearch';
import { forwardRef } from 'react';

interface OptimizedHeroProps {
  onGetQuote: () => void;
  propertySearchRef: React.RefObject<any>;
}

const OptimizedHero = forwardRef<HTMLElement, OptimizedHeroProps>(({ onGetQuote, propertySearchRef }, ref) => {
  const features = [
    'Licensed & Certified Appraisers',
    'Professional Photography',
    'Fast Turnaround Times',
    'Statewide Coverage'
  ];

  return (
    <section
      ref={ref}
      className="hero-section relative min-h-[500px] sm:min-h-[600px] flex items-center overflow-hidden"
    >
      {/* Background Image with optimized loading - hidden on mobile */}
      <div className="hidden sm:block absolute inset-0 bg-cover bg-center bg-no-repeat">
        <img 
          src="/images/pages/bg-hero.webp"
          alt="Professional real estate appraisal and photography background"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width="1920"
          height="600"
        />
      </div>

      {/* Gradient Overlay - full width on mobile */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right,
            rgba(77, 10, 151, 1.0) 0%,
            rgba(160, 68, 227, 1.0) 25%,
            rgba(160, 68, 227, 0.8) 50%,
            rgba(160, 68, 227, 0.4) 65%,
            rgba(160, 68, 227, 0.1) 70%,
            transparent 75%)`,
        }}
      />
      {/* Mobile-only full gradient background */}
      <div
        className="sm:hidden absolute inset-0"
        style={{
          background: `linear-gradient(to right,
            rgba(77, 10, 151, 1.0) 0%,
            rgba(160, 68, 227, 1.0) 100%)`,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6 text-white">
            <div className="space-y-3 sm:space-y-4">
              <Badge variant="outline" className="text-white border-white/30">
                Serving Northern & Central New Jersey
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                New Jersey Real Estate{" "}
                <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Appraisals
                </span>{" "}
                &{" "}
                <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Photography
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-100 max-w-lg">
                Your Expert Source for Comprehensive Property Valuation and
                Professional Visuals Across 13 New Jersey Counties.
              </p>
            </div>

            <div className="flex flex-row gap-3 sm:gap-6">
              <Link to="/services" aria-label="Explore our real estate appraisal and photography services" className="flex-1 sm:flex-none">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-[#4d0a97] hover:bg-gray-100 font-semibold"
                >
                  Explore Services
                </Button>
              </Link>
              <Link to="/gallery" aria-label="View our real estate photography portfolio" className="flex-1 sm:flex-none">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-[#4d0a97] bg-white/10 backdrop-blur-sm font-semibold"
                >
                  View Our Work
                </Button>
              </Link>
            </div>

            <div className="flex flex-row justify-center sm:justify-start items-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Shield className="w-3 h-3 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">
                  <span className="sm:hidden">USPAP</span>
                  <span className="hidden sm:inline">USPAP Certified</span>
                </span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Clock className="w-3 h-3 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">
                  <span className="sm:hidden">3 Days</span>
                  <span className="hidden sm:inline">3 Day Delivery</span>
                </span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Star className="w-3 h-3 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">
                  <span className="sm:hidden">5-Stars</span>
                  <span className="hidden sm:inline">5-Star Reviews</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <PropertySearch
              ref={propertySearchRef}
              className="bg-white/95 backdrop-blur-sm shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
});

OptimizedHero.displayName = 'OptimizedHero';

export default OptimizedHero;