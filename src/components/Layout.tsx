
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { GetQuoteModal } from "@/components/GetQuoteModal";
import ShowcaseFooter from "@/components/ShowcaseFooter";

const Layout = ({ children }: { children: React.ReactNode }) => {
  console.log('Layout component rendering...');
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  
  // Check if we're on a showcase page
  const isShowcasePage = location.pathname.startsWith('/showcase/');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Remove Tawk.to script from here - moved to DeferredScripts component for better performance
  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.type = "text/javascript";
  //   script.async = true;
  //   script.src = "https://embed.tawk.to/65ca4cc88d261e1b5f5f1bf6/1hmf3nrst";
  //   script.charset = "UTF-8";
  //   script.setAttribute("crossorigin", "*");
  //   
  //   // Initialize Tawk_API
  //   (window as any).Tawk_API = (window as any).Tawk_API || {};
  //   (window as any).Tawk_LoadStart = new Date();
  //   
  //   document.head.appendChild(script);

  //   return () => {
  //     // Clean up script on unmount
  //     if (document.head.contains(script)) {
  //       document.head.removeChild(script);
  //     }
  //   };
  // }, []);

  // Removed Google Ads conversion tracking - now handled on specific pages

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate("/");
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }
  };

  const handleGetQuote = (e: React.MouseEvent) => {
    console.log('Layout handleGetQuote clicked');
    e.preventDefault();
    e.stopPropagation();
    setIsQuoteModalOpen(true);
  };

  const handleLegalPageClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(path);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }
  };

  const handleServiceLinkClick = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/services") {
      // Already on services page, just scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Navigate to services page with hash
      navigate(`/services#${sectionId}`);
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Gallery", path: "/gallery" },
    { name: "Blog", path: "/blog" },
    { name: "FAQs", path: "/faqs" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      {/* Google Analytics - Sitewide Tracking */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-CVX8RHFWB1"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CVX8RHFWB1');
        `
      }} />
      
      <div className="min-h-screen flex flex-col">
      {/* Header - Hidden on showcase pages */}
      {!isShowcasePage && (
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled
              ? "bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20"
              : "bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200"
          }`}
          role="banner"
        >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center"
              onClick={handleLogoClick}
              aria-label="NJREAP - Real Estate Appraisals and Photography"
            >
              <img 
                src="/logo.svg" 
                alt="NJREAP Logo" 
                className="h-10 w-auto"
                width="40"
                height="40"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "text-[#4d0a97]"
                      : "text-gray-700 hover:text-[#4d0a97]"
                  }`}
                  aria-current={location.pathname === item.path ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Button
                onClick={handleGetQuote}
                className="bg-[#a044e3] hover:bg-[#4d0a97]"
                aria-label="Get free property appraisal quote"
              >
                Get Free Quote
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav id="mobile-menu" className="lg:hidden pb-4" role="navigation" aria-label="Mobile navigation">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium text-center transition-colors ${
                      location.pathname === item.path
                        ? "bg-[#4d0a97] text-white"
                        : "text-gray-700 hover:text-[#4d0a97] hover:bg-gray-100"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={location.pathname === item.path ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleGetQuote}
                  className="w-full bg-[#a044e3] hover:bg-[#4d0a97]"
                  aria-label="Get free property appraisal quote"
                >
                  Get Free Quote
                </Button>
              </div>
            </nav>
          )}
        </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${!isShowcasePage ? 'pt-16' : ''}`} role="main">{children}</main>

      {/* Footer - Different footer for showcase pages */}
      {isShowcasePage ? (
        <ShowcaseFooter />
      ) : (
        <footer className="bg-white border-t border-gray-200" role="contentinfo">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Company Info */}
            <div className="lg:max-w-sm">
              <Link
                to="/"
                className="flex items-center cursor-pointer mb-4"
                onClick={handleLogoClick}
                aria-label="NJREAP - Real Estate Appraisals and Photography"
              >
                <img 
                  src="/logo.svg" 
                  alt="NJREAP Logo" 
                  className="h-10 w-auto"
                  width="40"
                  height="40"
                />
              </Link>
              <p className="text-gray-600 text-sm mb-6">
                Crafting Confidence in Every Valuation.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-[#a044e3]" aria-hidden="true" />
                  <a href="tel:+19084378505" className="text-gray-600 hover:text-[#4d0a97] obfuscated-phone">
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-[#a044e3]" aria-hidden="true" />
                  <a href="mailto:info@njreap.com" className="text-gray-600 hover:text-[#4d0a97] obfuscated-email">
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 space-y-6">
              {/* Services */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 text-left">
                  Services
                </h3>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <button
                    onClick={handleServiceLinkClick('appraisal-services')}
                    className="text-gray-600 hover:text-[#4d0a97] transition-colors text-left"
                  >
                    Real Estate Appraisals
                  </button>
                  <button
                    onClick={handleServiceLinkClick('photography-services')}
                    className="text-gray-600 hover:text-[#4d0a97] transition-colors text-left"
                  >
                    Photography Services
                  </button>
                  <Link
                    to="/gallery"
                    className="text-gray-600 hover:text-[#4d0a97] transition-colors"
                  >
                    View Our Work
                  </Link>
                  <button
                    onClick={handleGetQuote}
                    className="text-gray-600 hover:text-[#4d0a97] transition-colors text-left"
                  >
                    Get Free Quote
                  </button>
                </div>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 text-left">
                  Company
                </h3>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-[#4d0a97] transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    to="/about"
                    className="text-gray-600 hover:text-[#4d0a97] transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    to="/services"
                    className="text-gray-600 hover:text-[#4d0a97] transition-colors"
                  >
                    Services
                  </Link>
                  <Link
                    to="/gallery"
                    className="text-gray-600 hover:text-[#4d0a97] transition-colors"
                  >
                    Gallery
                  </Link>
                  <Link
                    to="/blog"
                    className="text-gray-600 hover:text-[#4d0a97] transition-colors"
                  >
                    Blog
                  </Link>
                  <Link
                    to="/faqs"
                    className="text-gray-600 hover:text-[#4d0a97] transition-colors"
                  >
                    FAQs
                  </Link>
                  <Link
                    to="/contact"
                    className="text-gray-600 hover:text-[#4d0a97] transition-colors"
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 my-8" />

          {/* Bottom Copyright & Legal */}
          <div className="flex flex-col md:flex-row justify-center items-center text-sm leading-5 gap-3">
            <div className="text-slate-500 text-center">
              <span>Copyright © 2025 NJREAP LLC. All rights reserved.</span>
            </div>
            <div className="text-slate-500 text-center">
              <span className="pr-3">
                <Link 
                  to="/privacy" 
                  className="hover:text-[#4d0a97] transition-colors"
                  onClick={handleLegalPageClick('/privacy')}
                >
                  Privacy Policy
                </Link>
              </span>
              <span className="pr-3">|</span>
              <span className="pr-3">
                <Link 
                  to="/terms" 
                  className="hover:text-[#4d0a97] transition-colors"
                  onClick={handleLegalPageClick('/terms')}
                >
                  Terms of Service
                </Link>
              </span>
            </div>
          </div>
        </div>

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "New Jersey Real Estate Appraisals and Photography LLC",
              "alternateName": "NJREAP",
              "legalName": "New Jersey Real Estate Appraisals and Photography LLC",
              "url": "https://njreap.com",
              "logo": "https://njreap.com/logo.svg",
              "description": "Professional real estate appraisal services and photography throughout New Jersey. Crafting confidence in every valuation.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "174 Lamington Rd, P.O. Box 421",
                "addressLocality": "Oldwick",
                "addressRegion": "NJ",
                "postalCode": "08858",
                "addressCountry": "US"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-908-437-8505",
                "email": "info@njreap.com",
                "contactType": "customer service",
                "areaServed": "NJ",
                "availableLanguage": "English"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 40.6664,
                "longitude": -74.7831
              },
              "openingHours": "Mo-Fr 09:00-17:00",
              "priceRange": "$$",
              "serviceArea": {
                "@type": "State",
                "name": "New Jersey"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Real Estate Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Real Estate Appraisals",
                      "description": "Professional property valuations for residential and commercial properties"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Professional Photography",
                      "description": "High-quality real estate photography services"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Aerial Photography",
                      "description": "Drone photography for real estate marketing"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Virtual Tours",
                      "description": "Interactive virtual property tours"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Floor Plans",
                      "description": "Detailed floor plan creation services"
                    }
                  }
                ]
              },
              "sameAs": []
            })
          }}
        />
      </footer>
      )}

      {/* Get Quote Modal */}
      <GetQuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
      />
      </div>
    </>
  );
};

export default Layout;
