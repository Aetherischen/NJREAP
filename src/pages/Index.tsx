import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import PropertySearch from "@/components/PropertySearch";
import LazyNJCountiesMap from "@/components/LazyNJCountiesMap";
import LazyHowToPrepareSection from "@/components/LazyHowToPrepareSection";
import LazyShowcaseSection from "@/components/LazyShowcaseSection";
import DeferredScripts from "@/components/DeferredScripts";
import OptimizedHero from "@/components/OptimizedHero";
import OptimizedTestimonials from "@/components/OptimizedTestimonials";
import { GetQuoteModal } from "@/components/GetQuoteModal";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Calculator,
  CheckCircle,
  DollarSign,
  Zap,
  Users,
  Play,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  console.log('Index component rendering...');
  const navigate = useNavigate();
  const location = useLocation();
  const heroRef = useRef<HTMLElement>(null);
  const propertySearchRef = useRef<any>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  
  // Add debug logging for initial render
  useEffect(() => {
    console.log('Index component mounted');
    return () => console.log('Index component unmounted');
  }, []);
  
  // Intersection observers for lazy loading sections
  const { ref: videoSectionRef, hasBeenIntersecting: shouldLoadVideoSection } = useIntersectionObserver();
  const { ref: showcaseSectionRef, hasBeenIntersecting: shouldLoadShowcaseSection } = useIntersectionObserver();
  const { ref: testimonialsSectionRef, hasBeenIntersecting: shouldLoadTestimonials } = useIntersectionObserver();

  // SEO optimization
  useSEO({
    title: "NJREAP: Expert Real Estate Appraisals & Photography in Northern NJ | Get Your Quote Today",
    description: "Professional USPAP-compliant real estate appraisals, aerial photography, virtual tours, and floor plans serving Northern and Central New Jersey. Contact us for accurate property valuations.",
    keywords: "real estate appraisal New Jersey, property photography NJ, virtual tours Central NJ, USPAP compliant appraisals, New Jersey appraiser, aerial photography, property valuation, refinance appraisal, purchase appraisal, estate appraisal, PMI removal, Bergen County, Middlesex County, Essex County, Morris County, Somerset County, Union County, Monmouth County, Ocean County, Hunterdon County, Warren County, Mercer County, Hudson County",
    canonical: "https://njreap.com/",
    ogImage: "/images/pages/bg-hero.webp"
  });

  // Hardcoded testimonials from your actual Google Reviews
  const testimonials = [
    {
      name: "Sean Moran",
      rating: 5,
      text: "We had a great experience with NJREAP, Brandon was very professional, prompt and efficient. He supplied us with a very detailed appraisal with more information than I ever could have imagined, and much more quickly than I expected. I'd definitely recommend.",
      isGoogle: true,
    },
    {
      name: "Rebecca Alina",
      rating: 5,
      text: "I recently worked with NJREAP and was thoroughly impressed. Throughout the process, he was professional, courteous, and genuinely kind. The photos he took of my home, both inside and out, were top-notch and captured every detail perfectly. He made everything easy and stress-free. I highly recommend them!",
      isGoogle: true,
    },
    {
      name: "Joseph Anderson",
      rating: 5,
      text: "I had an exceptional experience with NJ REAP. Their professionalism, market expertise, and responsiveness were outstanding. They provided a precise appraisal report promptly, demonstrating their thorough understanding of the local market.",
      isGoogle: true,
    },
    {
      name: "Elias Miller",
      rating: 5,
      text: "I had NJREAP appraise my home and was very pleased to see the attention to detail and professional looking report they sent me. Their website was also very easy to use and had a modern feel to it.",
      isGoogle: true,
    },
    {
      name: "Jon Brennan",
      rating: 5,
      text: "Wow! This is a lot simpler than what I'm used to, easy to use, and intuitive menu systems. Good stuff!",
      isGoogle: true,
    },
  ];

  const features = [
    {
      icon: DollarSign,
      title: "Competitive Pricing",
      description:
        "Transparent and affordable rates without compromising quality",
    },
    {
      icon: Zap,
      title: "Modern Technology",
      description:
        "Advanced tools with Google Calendar booking and email alerts",
    },
    {
      icon: Users,
      title: "Local Expertise",
      description: "Deep knowledge of Northern and Central NJ markets",
    },
  ];

  const services = [
    {
      icon: Calculator,
      title: "Real Estate Appraisals",
      description: "Professional property valuations for all your needs",
      items: ["Purchase", "Refinance", "Estate", "PMI Removal"],
      sectionId: "appraisal-services",
    },
    {
      icon: Camera,
      title: "Photography Services",
      description: "High-quality visuals to showcase your property",
      items: [
        "Professional Photos",
        "Aerial Photography",
        "Virtual Tours",
        "Floor Plans",
      ],
      sectionId: "photography-services",
    },
  ];

  // Handle quote button clicks to highlight search
  useEffect(() => {
    const handlePulsingTrigger = () => {
      if (
        propertySearchRef.current &&
        propertySearchRef.current.triggerPulsing
      ) {
        propertySearchRef.current.triggerPulsing();
      }
    };

    window.addEventListener(
      "triggerPropertySearchPulsing",
      handlePulsingTrigger,
    );

    return () => {
      window.removeEventListener(
        "triggerPropertySearchPulsing",
        handlePulsingTrigger,
      );
    };
  }, []);

  const handleGetQuote = () => {
    console.log('Index handleGetQuote clicked');
    // Open the quote modal instead of scrolling
    setIsQuoteModalOpen(true);
  };

  const handleServiceClick = (sectionId: string) => {
    if (sectionId === "photography-services") {
      navigate("/services#photography-services");
    } else {
      navigate("/services");
    }
  };

  return (
    <Layout>
      {/* Hero Section - Optimized for performance */}
      <OptimizedHero ref={heroRef} onGetQuote={handleGetQuote} />

      {/* Interactive NJ Counties Map with Comprehensive Coverage */}
      <LazyNJCountiesMap />

      {/* Combined YouTube Video and NJREAP Advantage Section */}
      <section className="py-12 bg-gradient-to-br from-[#4d0a97]/5 to-[#a044e3]/5">
        <div className="container mx-auto px-4">
          {/* Showcase Properties Section */}
          <div ref={showcaseSectionRef} className="mb-12">
            {shouldLoadShowcaseSection && <LazyShowcaseSection />}
          </div>

          {/* YouTube Video Spotlight */}
          <div ref={videoSectionRef} className="max-w-5xl mx-auto mb-20">
            <div className="text-center mb-12">
              <Badge variant="outline" className="text-[#4d0a97] border-[#4d0a97]/30 mb-4">
                Meet Our Team
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Professional Excellence You Can Trust
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Get to know our professional team and discover what sets NJREAP apart in delivering 
                exceptional real estate appraisal and photography services across New Jersey
              </p>
            </div>
            
            {shouldLoadVideoSection ? (
              <Card className="overflow-hidden shadow-2xl bg-white/90 backdrop-blur-sm border-2 border-[#4d0a97]/10 hover:shadow-3xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                    <iframe
                      width="560"
                      height="315"
                      src="https://www.youtube-nocookie.com/embed/kimESDkwW8c?si=WP5uPFNLlpjSl0v5&rel=0&modestbranding=1&showinfo=0"
                      title="NJREAP - Professional Real Estate Services"
                      className="absolute inset-0 w-full h-full transition-transform group-hover:scale-[1.02]"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                  <div className="p-8 text-center bg-gradient-to-r from-white to-gray-50">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      The NJREAP Story
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Learn about our comprehensive approach to property valuation and visual marketing
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="aspect-video bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Play className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-500">Loading video content...</p>
                </div>
              </div>
            )}
          </div>

          {/* Our Services */}
        </div>
      </section>


      {/* Our Services */}
      <section className="py-16 bg-gray-50" aria-labelledby="services-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 id="services-heading" className="text-3xl font-bold text-gray-900 mb-4">
              Our Professional Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive appraisal and photography solutions tailored to your
              real estate needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-shadow group cursor-pointer"
                onClick={() => handleServiceClick(service.sectionId)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#4d0a97] to-[#a044e3] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl group-hover:text-[#4d0a97] transition-colors">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {service.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {service.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-4 bg-[#4d0a97] hover:bg-[#a044e3] group-hover:bg-[#a044e3] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceClick(service.sectionId);
                    }}
                    aria-label={`Learn more about ${service.title}`}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Prepare */}
      <LazyHowToPrepareSection />

      {/* Testimonials - Optimized for performance */}
      <section ref={testimonialsSectionRef} id="testimonials" className="py-16 bg-gray-50" aria-labelledby="testimonials-heading">
        {shouldLoadTestimonials ? (
          <OptimizedTestimonials testimonials={testimonials} />
        ) : (
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-200 rounded-lg h-64 animate-pulse" />
            </div>
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-[#4d0a97] to-[#a044e3] text-white" aria-labelledby="cta-heading">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 id="cta-heading" className="text-3xl font-bold mb-6">
              Ready to Get Your Property Valued?
            </h2>
            <p className="text-xl text-gray-100 mb-8">
              Join thousands of satisfied clients who trust NJREAP for their
              real estate appraisal and photography needs.
            </p>
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleGetQuote}
                className="w-full sm:w-auto bg-white text-[#4d0a97] hover:bg-gray-100 font-semibold"
                aria-label="Get free property appraisal quote"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Get Free Quote
              </Button>
              <Link to="/gallery" aria-label="View our real estate photography portfolio" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-[#4d0a97] bg-white/10 backdrop-blur-sm font-semibold"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  View Our Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Deferred Scripts for Performance */}
      <DeferredScripts />
      
      {/* Get Quote Modal */}
      <GetQuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
      />
    </Layout>
  );
};

export default Index;
