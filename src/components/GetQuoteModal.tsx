import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, Search, MapPin, Camera, Calculator, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PropertyQuoteModal from '@/components/PropertyQuote/PropertyQuoteModal';

interface GetQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GetQuoteModal = ({ isOpen, onClose }: GetQuoteModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyQuoteModal, setShowPropertyQuoteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setError(null);

    if (value.length > 2) {
      setIsSearching(true);
      try {
        const response = await fetch("https://yhtyhcldtytxsgiphfhn.supabase.co/functions/v1/njpr-properties", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodHloY2xkdHl0eHNnaXBoZmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMTg3NDgsImV4cCI6MjA2NTY5NDc0OH0.1iSmqgMV5p-QQ8Noa0N7MIc65DrwkjxInHtwgNdUiDU`
          },
          body: JSON.stringify({ filters: { address: value }, limit: 5 }),
        });
        
        const data = await response.json();
        const results = Array.isArray(data) ? data : [];
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setError("Unable to load address suggestions");
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    const propertyDataWithRaw = {
      ...suggestion,
      rawNjprData: suggestion
    };
    setSelectedProperty(propertyDataWithRaw);
    setShowPropertyQuoteModal(true);
  };

  const handlePropertyQuoteClose = () => {
    setShowPropertyQuoteModal(false);
    setSelectedProperty(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !showPropertyQuoteModal} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full mx-4 p-0 overflow-hidden bg-gradient-to-br from-primary/75 via-primary/75 to-secondary/75 border-0 shadow-2xl z-[9999] animate-scale-in backdrop-blur-sm [&>button]:hidden">
          <DialogTitle className="sr-only">Get Free Quote</DialogTitle>
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 opacity-20" />
          
          {/* Custom subtle close button */}
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="px-4 md:px-8 pb-6 md:pb-8 pt-6 md:pt-8 relative z-10">
            {/* Hero Section */}
            <div className="text-center mb-6 md:mb-10">
              <div className="mb-6">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 mb-6 px-4 py-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Free Professional Quote
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
                Get Your <span className="text-white drop-shadow-lg">Instant Quote</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 mb-3 md:mb-4 leading-relaxed max-w-2xl mx-auto px-4">
                Professional real estate photography & USPAP-compliant appraisals across New Jersey
              </p>
              
              <div className="flex items-center justify-center text-lg font-semibold text-white/90 animate-pulse">
                <ArrowRight className="w-5 h-5 mr-2" />
                Enter your property address below to begin
              </div>
            </div>

            {/* Property Search */}
            <div className="max-w-2xl mx-auto mb-6 md:mb-10">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-white via-secondary/50 to-white rounded-3xl blur-xl opacity-60 group-hover:opacity-80 animate-pulse" />
                
                <div className="relative bg-white rounded-2xl p-4 md:p-8 shadow-2xl border-4 border-white/80">
                  <div className="text-center mb-4">
                    <p className="text-lg font-bold text-primary animate-bounce">
                      📍 Enter Your Address to Get Started
                    </p>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-primary h-7 w-7" />
                    <Input
                      type="text"
                      placeholder="Type your full property address here..."
                      value={searchQuery}
                      onChange={handleInputChange}
                      className="pl-16 pr-16 py-6 text-xl border-4 border-primary/30 rounded-2xl focus:border-primary focus:ring-8 focus:ring-primary/30 transition-all duration-300 font-semibold text-center shadow-lg hover:shadow-xl placeholder:text-gray-400 placeholder:font-normal bg-gradient-to-r from-white to-gray-50"
                    />
                    {isSearching && (
                      <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-7 w-7 border-4 border-primary border-t-transparent" />
                      </div>
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-primary/5 cursor-pointer border-b border-gray-50 last:border-b-0 flex items-center space-x-4 transition-colors duration-150"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate text-lg">
                              {suggestion.address}
                            </div>
                            <div className="text-gray-500 text-sm">
                              {suggestion.city}, {suggestion.state} {suggestion.zip}
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}

                  {error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm flex items-center">
                        <X className="h-4 w-4 mr-2" />
                        {error}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-6">
                Or Contact Us Directly To Discuss Your Needs
              </h3>
              
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center items-center">
                {/* Phone */}
                <a 
                  href="tel:+19084378505" 
                  className="group flex items-center space-x-4 bg-white/15 backdrop-blur-sm rounded-2xl p-6 text-white border border-white/20 hover:bg-white/25 transition-all duration-300 hover:transform hover:scale-105 min-w-[280px]"
                >
                  <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold">(908) 437-8505</div>
                    <div className="text-white/80 text-sm">Tap to call now</div>
                  </div>
                </a>

                {/* Email */}
                <a 
                  href="mailto:info@njreap.com" 
                  className="group flex items-center space-x-4 bg-white/15 backdrop-blur-sm rounded-2xl p-6 text-white border border-white/20 hover:bg-white/25 transition-all duration-300 hover:transform hover:scale-105 min-w-[280px]"
                >
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold">info@njreap.com</div>
                    <div className="text-white/80 text-sm">Send us an email</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Trust Indicators - Mobile Optimized */}
            <div className="mt-6 md:mt-8 text-center">
              <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-8 text-white/80 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                  Licensed & Insured
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2" />
                  5-Star Reviews
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                  NJ Certified
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Property Quote Modal */}
      {showPropertyQuoteModal && selectedProperty && (
        <PropertyQuoteModal
          isOpen={showPropertyQuoteModal}
          onClose={handlePropertyQuoteClose}
          propertyData={selectedProperty}
        />
      )}
    </>
  );
};