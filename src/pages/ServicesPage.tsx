import Layout from "@/components/Layout";
import PropertySearch from "@/components/PropertySearch";
import PDFPreviewModal from "@/components/PDFPreviewModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Camera,
  Home,
  RefreshCw,
  Gavel,
  Heart,
  TrendingUp,
  DollarSign,
  Shield,
  Scale,
  Hammer,
  Droplets,
  Map,
  Image,
  Plane,
  Video,
  Eye,
  Clock,
  FileText,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Download,
  Building2,
  Phone,
  Gift,
  MapPin,
  Briefcase,
  HandHeart,
  Play,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";

const ServicesPage = () => {
  // SEO optimization
  useSEO({
    title: "Our Services: Residential Appraisals, Aerial Photography & Virtual Tours in NJ",
    description: "Explore our full range of services including home appraisals, drone photography, 3D tours, and floor plans for real estate in Northern and Central NJ.",
    keywords: "residential appraisals New Jersey, aerial photography NJ, virtual tours Central NJ, drone photography real estate, floor plans NJ, property photography services, home appraisal Bergen County, real estate videography, 3D tours Northern NJ",
    canonical: "https://njreap.com/services",
    ogImage: "/images/pages/bg-services.webp"
  });

  const navigate = useNavigate();
  const [highlightedSection, setHighlightedSection] = useState<string | null>(
    null,
  );
  const [servicePricing, setServicePricing] = useState<Record<string, number>>({});
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [sampleReportUrl, setSampleReportUrl] = useState<string>("");

  useEffect(() => {
    // Fetch service pricing from database
    const fetchServicePricing = async () => {
      try {
        const { data, error } = await supabase
          .from('service_pricing')
          .select('service_id, price')
          .eq('tier_name', 'under_1500');

        if (error) {
          console.error('Error fetching service pricing:', error);
          return;
        }

        const pricingMap: Record<string, number> = {};
        data?.forEach(item => {
          pricingMap[item.service_id] = item.price;
        });
        setServicePricing(pricingMap);
      } catch (error) {
        console.error('Error fetching service pricing:', error);
      }
    };

    // Get the sample report URL from Supabase storage
    const getSampleReportUrl = async () => {
      try {
        const { data } = supabase.storage
          .from('appraisal-sample')
          .getPublicUrl('RE10000 - 123 Sample Rd.pdf');
        
        if (data?.publicUrl) {
          setSampleReportUrl(data.publicUrl);
        }
      } catch (error) {
        console.error('Error getting sample report URL:', error);
      }
    };

    fetchServicePricing();
    getSampleReportUrl();
  }, []);

  useEffect(() => {
    // Check if we need to scroll to a specific section based on URL hash
    const hash = window.location.hash;
    if (hash) {
      const sectionId = hash.substring(1);
      const element = document.getElementById(sectionId);
      if (element) {
        setHighlightedSection(sectionId);
        element.scrollIntoView({ behavior: "smooth", block: "start" });

        // Remove highlight after animation
        const timer = setTimeout(() => {
          setHighlightedSection(null);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleGalleryNavigation = (tab: string) => {
    navigate(`/gallery?tab=${tab}`);
  };

  const handleViewSampleReport = () => {
    if (sampleReportUrl) {
      setIsPDFModalOpen(true);
    }
  };

  const appraisalServices = [
    {
      icon: Home,
      title: "Purchase",
      description:
        "Determines property value for mortgage lending to ensure a solid loan foundation.",
      benefits: [
        "Mortgage approval support",
        "Fair market value",
        "Lender requirement fulfillment",
      ],
    },
    {
      icon: RefreshCw,
      title: "Refinance",
      description:
        "Assesses current home value to optimize loan terms during refinancing.",
      benefits: [
        "Better interest rates",
        "Lower monthly payments",
        "Cash-out options",
      ],
    },
    {
      icon: Scale,
      title: "Estate",
      description:
        "Evaluates property value for tax or distribution purposes in estate settlements.",
      benefits: [
        "Tax calculation support",
        "Asset distribution clarity",
        "Legal compliance",
      ],
    },
    {
      icon: Heart,
      title: "Divorce",
      description:
        "Provides neutral property evaluation for equitable asset division.",
      benefits: [
        "Impartial valuation",
        "Legal documentation",
        "Fair settlement support",
      ],
    },
    {
      icon: Gavel,
      title: "Litigation",
      description:
        "Expert witness services and court-ready valuations for legal proceedings.",
      benefits: [
        "Expert testimony",
        "Court-acceptable reports",
        "Professional credibility",
      ],
    },
    {
      icon: TrendingUp,
      title: "Tax Appeals",
      description:
        "Challenges property tax assessments to potentially reduce tax burden.",
      benefits: [
        "Tax reduction potential",
        "Professional documentation",
        "Assessment challenge support",
      ],
    },
    {
      icon: Gift,
      title: "Gift Tax",
      description:
        "Evaluates property value for IRS gift tax filing purposes in retrospective valuations.",
      benefits: [
        "Fair market value determination",
        "IRS compliance support",
        "Retrospective valuation clarity",
      ],
    },
    {
      icon: MapPin,
      title: "Pre-Listing",
      description:
        "Assesses property value to help sellers set competitive listing prices.",
      benefits: [
        "Accurate pricing guidance",
        "Market readiness support",
        "Seller confidence boost",
      ],
    },
    {
      icon: Briefcase,
      title: "Relocation",
      description:
        "Determines property value for corporate or employee relocation programs.",
      benefits: [
        "Relocation cost accuracy",
        "Timely valuation delivery",
        "Employer satisfaction",
      ],
    },
    {
      icon: Shield,
      title: "Bankruptcy",
      description:
        "Provides impartial property valuations for bankruptcy proceedings or asset liquidation.",
      benefits: [
        "Legal valuation support",
        "Asset distribution clarity",
        "Court-acceptable reports",
      ],
    },
    {
      icon: DollarSign,
      title: "PMI Removal",
      description:
        "Assesses property value to support the removal of private mortgage insurance.",
      benefits: [
        "Equity threshold evaluation",
        "Mortgage lender coordination",
        "Cost-saving confirmation",
      ],
    },
    {
      icon: HandHeart,
      title: "Charitable Donation",
      description:
        "Evaluates property value for tax deductions on charitable contributions.",
      benefits: [
        "Fair market value certification",
        "IRS documentation support",
        "Donation compliance assistance",
      ],
    },
  ];

  const photographyServices = [
    {
      icon: Camera,
      title: "Professional Photography",
      description:
        "Comprehensive interior and exterior photography that highlights your property's best features and creates emotional connection with potential buyers.",
      features: [
        "High-resolution images",
        "Professional lighting",
        "Interior & exterior shots",
        "HDR processing",
        "Golden hour timing",
        "Architectural focus",
        "Multiple angles",
        "Weather-optimized",
      ],
      pricing: servicePricing['professional-photography'] ? `Starting at $${servicePricing['professional-photography']}` : "Starting at $200",
      galleryTab: "photography",
      serviceId: "professional-photography",
    },
    {
      icon: Plane,
      title: "Aerial Photography",
      description:
        "Drone photography providing unique perspectives and showcasing property boundaries and surroundings.",
      features: [
        "FAA certified pilots",
        "4K video capability",
        "Property boundaries",
        "Neighborhood context",
      ],
      pricing: servicePricing['aerial-photography'] ? `Starting at $${servicePricing['aerial-photography']}` : "Starting at $200",
      galleryTab: "aerial",
      serviceId: "aerial-photography",
    },
    {
      icon: Map,
      title: "Floor Plans",
      description:
        "Detailed floor plans and layouts helping buyers understand property flow and space utilization.",
      features: [
        "Accurate measurements",
        "Professional drafting",
        "Multiple formats",
        "3D visualization options",
      ],
      pricing: servicePricing['floor-plans'] ? `Starting at $${servicePricing['floor-plans']}` : "Starting at $125",
      galleryTab: "floorplans",
      serviceId: "floor-plans",
    },
    {
      icon: Video,
      title: "Virtual Tours",
      description:
        "Immersive virtual tours allowing remote viewing and enhanced online presence.",
      features: [
        "360° photography",
        "Interactive navigation",
        "Mobile compatibility",
        "Easy sharing",
      ],
      pricing: servicePricing['virtual-tours'] ? `Starting at $${servicePricing['virtual-tours']}` : "Starting at $300",
      galleryTab: "video",
      serviceId: "virtual-tours",
    },
    {
      icon: Play,
      title: "Videography",
      description:
        "Professional video walkthroughs and marketing videos that showcase your property in motion with cinematic quality.",
      features: [
        "4K video recording",
        "Cinematic movements",
        "Professional editing",
        "Marketing-ready videos",
        "Multiple formats",
        "Voice-over options",
        "Music integration",
        "Social media ready",
      ],
      pricing: servicePricing['real-estate-videography'] ? `Starting at $${servicePricing['real-estate-videography']}` : "Starting at $400",
      galleryTab: "video",
      serviceId: "real-estate-videography",
    },
    {
      icon: Camera,
      title: "Property Showcase",
      description:
        "Complete online property showcase with professional photography, videos, and agent information. Perfect for realtor marketing and client presentations.",
      features: [
        "Professional photos",
        "Video walkthrough",
        "Online property page",
        "Agent information",
        "Social media ready",
        "Mobile optimized",
        "SEO optimized",
        "Professional branding",
      ],
      pricing: servicePricing['property-showcase'] ? `Starting at $${servicePricing['property-showcase']}` : "Starting at $150",
      galleryTab: null,
      serviceId: "property-showcase",
      isShowcase: true,
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        {/* Background Image - hidden on mobile */}
        <div
          className="hidden sm:block absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/pages/bg-services.webp')`,
          }}
        ></div>
        {/* Mobile-only full gradient background */}
        <div
          className="sm:hidden absolute inset-0"
          style={{
            background: `linear-gradient(to right,
              rgba(77, 10, 151, 1.0) 0%,
              rgba(160, 68, 227, 1.0) 100%)`,
          }}
        />

        {/* Gradient Overlay */}
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
        ></div>

        <div className="relative z-10 container mx-auto px-4 py-8 sm:py-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge
              variant="outline"
              className="text-white border-white/30 mb-2 sm:mb-4"
            >
              Comprehensive Services
            </Badge>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6">
              Real Estate Appraisals in Northern NJ
            </h1>
            <p className="text-lg sm:text-xl text-gray-100 leading-relaxed">
              NJREAP offers a comprehensive range of appraisal and photography
              services tailored to meet diverse client needs across Northern and
              Central New Jersey.
            </p>
          </div>
        </div>
      </section>

      {/* Appraisal Services */}
      <section
        id="appraisal-services"
        className={`py-8 sm:py-16 ${
          highlightedSection === "appraisal-services"
            ? "bg-[#4d0a97]/5 border-2 border-[#4d0a97]/20"
            : "bg-gray-50"
        } transition-all duration-1000`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              Real Estate Appraisals in Northern and Central New Jersey
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional property valuations for all your real estate needs across Bergen County, Essex County, Morris County, and surrounding areas in Northern and Central New Jersey,
              from purchase to litigation support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-12">
            {appraisalServices.map((service, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow h-full"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#4d0a97] to-[#a044e3] rounded-lg flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <CardDescription className="text-sm">
                        Appraisal Service
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="space-y-2">
                    {service.benefits.map((benefit, benefitIndex) => (
                      <div
                        key={benefitIndex}
                        className="flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

           {/* Commercial Appraisal Notice */}
           <div className="mb-6 sm:mb-12">
             <Card className="max-w-4xl mx-auto border-[#4d0a97]/20 bg-gradient-to-r from-[#4d0a97]/5 to-[#a044e3]/5">
               <CardContent className="p-4 sm:p-6">
                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                   <div className="flex-shrink-0 self-center sm:self-auto">
                     <div className="w-12 h-12 bg-gradient-to-br from-[#4d0a97] to-[#a044e3] rounded-lg flex items-center justify-center">
                       <Building2 className="w-6 h-6 text-white" />
                     </div>
                   </div>
                   <div className="flex-1 text-center">
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">
                       Commercial Appraisals Available
                     </h3>
                     <p className="text-gray-600 mb-4 text-left sm:text-center">
                       Looking for a commercial appraisal? We also provide professional commercial property valuations. Contact us directly to discuss your specific commercial appraisal needs and requirements.
                     </p>
                     <Link to="/contact">
                       <Button variant="outline" className="border-[#4d0a97] text-[#4d0a97] hover:bg-[#4d0a97] hover:text-white w-full sm:w-auto">
                         <Phone className="w-4 h-4 mr-2" />
                         Contact for Commercial Services
                       </Button>
                     </Link>
                   </div>
                 </div>
              </CardContent>
            </Card>
          </div>

          {/* Sample Report */}
          <div className="mt-12">
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <FileText className="w-6 h-6 text-[#4d0a97]" />
                  Sample Appraisal Report
                </CardTitle>
                <CardDescription>
                  See what you'll receive with our professional appraisal
                  services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <FileText className="w-20 h-20 text-[#4d0a97] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">
                    Professional USPAP-Compliant Report
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Our comprehensive appraisal reports include property
                    details, comparable sales analysis, market trends, and
                    professional valuation conclusions. Each report is fully
                    compliant with USPAP standards and accepted by all major
                    lenders.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex sm:flex-col items-start sm:items-center sm:text-center p-4 bg-white rounded-lg space-x-3 sm:space-x-0">
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0 sm:mx-auto mb-0 sm:mb-2" />
                      <div className="flex-1 sm:flex-none">
                        <h4 className="font-semibold text-sm sm:text-base">Complete Analysis</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0 sm:mt-0">
                          Detailed property assessment
                        </p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-start sm:items-center sm:text-center p-4 bg-white rounded-lg space-x-3 sm:space-x-0">
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0 sm:mx-auto mb-0 sm:mb-2" />
                      <div className="flex-1 sm:flex-none">
                        <h4 className="font-semibold text-sm sm:text-base">Market Comparables</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0 sm:mt-0">
                          Recent sales data analysis
                        </p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-start sm:items-center sm:text-center p-4 bg-white rounded-lg space-x-3 sm:space-x-0">
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0 sm:mx-auto mb-0 sm:mb-2" />
                      <div className="flex-1 sm:flex-none">
                        <h4 className="font-semibold text-sm sm:text-base">Professional Photos</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0 sm:mt-0">
                          High-quality property images
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="bg-[#4d0a97] hover:bg-[#a044e3]"
                    onClick={handleViewSampleReport}
                    disabled={!sampleReportUrl}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Sample Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Photography Services */}
      <section
        id="photography-services"
        className={`py-8 sm:py-16 ${
          highlightedSection === "photography-services"
            ? "bg-[#a044e3]/5 border-2 border-[#a044e3]/20"
            : ""
        } transition-all duration-1000`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              Professional Real Estate Photography in Northern and Central New Jersey
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              High-quality visual services to showcase your property's best features across Middlesex County, Somerset County, Union County, and throughout Central New Jersey.
              Professional photography, aerial drone shots, virtual tours, and floor plans to attract potential buyers
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {photographyServices.map((service, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow h-full flex flex-col"
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#a044e3] to-[#4d0a97] rounded-lg flex items-center justify-center flex-shrink-0 self-center sm:self-auto">
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 text-center sm:text-left">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed text-left">
                        {service.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[#4d0a97] self-center sm:self-start">
                      {service.pricing}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    {service.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    {service.isShowcase ? (
                      <Link to="/showcase">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-[#4d0a97] text-[#4d0a97] hover:bg-[#4d0a97] hover:text-white transition-all"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Showcase
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleGalleryNavigation(
                            service.galleryTab || "photography",
                          )
                        }
                        className="w-full border-[#4d0a97] text-[#4d0a97] hover:bg-[#4d0a97] hover:text-white transition-all"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Gallery
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call-to-Action */}
      <section className="py-8 sm:py-16 bg-gradient-to-r from-[#4d0a97] to-[#a044e3] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold">Ready to Get Started?</h2>
              <p className="text-lg sm:text-xl text-gray-100">
                Experience the NJREAP difference with our professional appraisal
                and photography services. Get your instant quote today!
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>No obligation quote</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Fast 3 day turnaround</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>USPAP compliant reports</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Professional service guarantee</span>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/contact">
                  <Button
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white hover:text-[#4d0a97] transition-all"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <PropertySearch
                className="bg-white/95 backdrop-blur-sm shadow-2xl"
                title="Need a Quick Quote?"
                description="Enter your address for an instant, personalized quote using our New Jersey public records database."
              />
            </div>
          </div>
        </div>
      </section>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        pdfUrl={sampleReportUrl}
        title="Sample Appraisal Report"
      />
    </Layout>
  );
};

export default ServicesPage;
