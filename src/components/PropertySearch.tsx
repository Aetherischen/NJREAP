import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, MapPin, Calculator, AlertCircle, Sparkles } from "lucide-react";
import PropertyQuoteModal from "./PropertyQuote/PropertyQuoteModal";

interface PropertySearchProps {
  title?: string;
  description?: string;
  className?: string;
}

const PropertySearch = forwardRef<any, PropertySearchProps>(
  (
    {
      title = "Property Quote Calculator",
      description = "Type your property address below and select from the dropdown to get an instant quote based on square footage.",
      className = "",
    },
    ref,
  ) => {
    const pulsingStyle = `
    @keyframes addressPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(77, 10, 151, 0.6); border-color: rgba(77, 10, 151, 0.3); }
      50% { box-shadow: 0 0 0 12px rgba(77, 10, 151, 0.1); border-color: rgba(77, 10, 151, 0.8); }
    }
    .address-pulsing { animation: addressPulse 3s ease-in-out infinite; }
  `;

    useEffect(() => {
      const style = document.createElement("style");
      style.textContent = pulsingStyle;
      document.head.appendChild(style);
      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }, []);

    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPropertyData, setSelectedPropertyData] = useState<
      any | null
    >(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [shouldPulsate, setShouldPulsate] = useState(false);

    const searchTimeoutRef = useRef<NodeJS.Timeout>();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      return () =>
        searchTimeoutRef.current && clearTimeout(searchTimeoutRef.current);
    }, []);

    const triggerPulsing = () => {
      setShouldPulsate(true);
      setTimeout(() => setShouldPulsate(false), 8000);
    };

    useImperativeHandle(ref, () => ({ triggerPulsing }));

    const handleInputChange = async (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const value = e.target.value;
      setSearchQuery(value);
      setError(null);
      setHasUserInteracted(true);
      setShouldPulsate(false);

      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      if (value.length > 2) {
        setIsSearching(true);
        searchTimeoutRef.current = setTimeout(async () => {
          try {
            console.log("Searching for:", value);
            
            const response = await fetch("https://yhtyhcldtytxsgiphfhn.supabase.co/functions/v1/njpr-properties", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodHloY2xkdHl0eHNnaXBoZmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMTg3NDgsImV4cCI6MjA2NTY5NDc0OH0.1iSmqgMV5p-QQ8Noa0N7MIc65DrwkjxInHtwgNdUiDU`
              },
              body: JSON.stringify({ filters: { address: value }, limit: 5 }),
            });
            
            const data = await response.json();
            console.log("Response data:", data);
            
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
        }, 300);
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
        setIsSearching(false);
      }
    };

    const handleSuggestionClick = async (suggestion: any) => {
      setSearchQuery(suggestion.address);
      setShowSuggestions(false);
      setIsLoading(true);
      setError(null);

      try {
        const propertyDataWithRaw = {
          ...suggestion,
          rawNjprData: suggestion // Store the complete raw data
        };
        
        console.log("PropertySearch raw data:", suggestion);
        setSelectedPropertyData(propertyDataWithRaw);
        setIsModalOpen(true);
      } catch (err) {
        console.error("Error processing property details:", err);
        setError("Unable to process property details");
      } finally {
        setIsLoading(false);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      setIsLoading(true);
      setShowSuggestions(false);
      setError(null);

      try {
        const selectedSuggestion = suggestions.find(
          (s) => s.address === searchQuery,
        );
        let propertyData: any | null = null;

        if (selectedSuggestion) {
          propertyData = {
            ...selectedSuggestion,
            rawNjprData: selectedSuggestion // Store the complete raw data
          };
        } else {
          const response = await fetch("https://yhtyhcldtytxsgiphfhn.supabase.co/functions/v1/njpr-properties", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodHloY2xkdHl0eHNnaXBoZmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMTg3NDgsImV4cCI6MjA2NTY5NDc0OH0.1iSmqgMV5p-QQ8Noa0N7MIc65DrwkjxInHtwgNdUiDU`
            },
            body: JSON.stringify({
              filters: { address: searchQuery },
              limit: 5,
            }),
          });
          
          const data = await response.json();
          const results = Array.isArray(data) ? data : [];
          const foundProperty = results.find((item: any) => item.address === searchQuery);
          
          if (foundProperty) {
            propertyData = {
              ...foundProperty,
              rawNjprData: foundProperty // Store the complete raw data
            };
          }
        }

        if (propertyData) {
          console.log("PropertySearch raw data:", propertyData);
          setSelectedPropertyData(propertyData);
          setIsModalOpen(true);
        } else {
          setError(
            "Property not found. Please check the address and try again.",
          );
        }
      } catch (err) {
        console.error("Error in property search:", err);
        setError(
          "Unable to find property. Please check the address and try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <>
        <Card className={`w-full max-w-lg mx-auto relative overflow-visible ${className}`} data-property-search>
          {/* Static background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4d0a97]/5 via-[#a044e3]/10 to-[#4d0a97]/5" />
          
          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#4d0a97]/20 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-[#a044e3]/20 to-transparent rounded-tr-full" />
          
          <div className="relative z-10">
            <CardHeader className="text-center border-b border-[#4d0a97]/10">
              {/* Phone Number CTA */}
              <div className="bg-gradient-to-r from-[#4d0a97]/5 to-[#a044e3]/5 p-3 rounded-lg border border-[#4d0a97]/20 mb-4">
                <p className="text-xs text-gray-600 mb-1">Or call us directly:</p>
                <a 
                  href="tel:+19084378505" 
                  className="text-lg font-bold text-[#4d0a97] hover:text-[#a044e3] transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  (908) 437-8505
                </a>
              </div>
              
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-[#4d0a97] to-[#a044e3] rounded-lg">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-5 h-5 text-[#4d0a97] animate-pulse" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#4d0a97] to-[#a044e3] bg-clip-text text-transparent">
                {title}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600">{description}</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="relative" ref={inputRef}>
                  <div
                    className={`relative ${shouldPulsate && !hasUserInteracted ? "address-pulsing" : ""}`}
                  >
                    <Search className="absolute left-4 top-4 w-5 h-5 text-[#4d0a97]/60" />
                    <Input
                      type="text"
                      placeholder="Type your property address here..."
                      value={searchQuery}
                      onChange={handleInputChange}
                      onFocus={() => {
                        setShouldPulsate(false);
                        if (searchQuery.length > 2 && suggestions.length > 0)
                          setShowSuggestions(true);
                      }}
                      className="pl-12 pr-4 h-12 sm:h-16 text-base sm:text-lg font-medium border-2 border-[#4d0a97]/30 focus:border-[#4d0a97] focus:ring-2 focus:ring-[#4d0a97]/20 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-[#4d0a97]/50"
                      required
                      disabled={isLoading}
                    />
                    {isSearching && (
                      <div className="absolute right-4 top-4">
                        <div className="w-6 h-6 border-2 border-[#4d0a97]/30 border-t-[#4d0a97] rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-[100] w-full mt-2 bg-white/95 backdrop-blur-md border border-[#4d0a97]/20 rounded-lg shadow-2xl max-h-60 overflow-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-[#4d0a97]/5 focus:bg-[#4d0a97]/10 focus:outline-none flex items-center space-x-3 transition-colors border-b border-[#4d0a97]/10 last:border-b-0"
                          disabled={isLoading}
                        >
                          <div className="p-1 bg-[#4d0a97]/10 rounded">
                            <MapPin className="w-4 h-4 text-[#4d0a97] flex-shrink-0" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {suggestion.address}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {showSuggestions &&
                    suggestions.length === 0 &&
                    !isSearching &&
                    searchQuery.length > 2 && (
                      <div className="absolute z-[100] w-full mt-2 bg-white/95 backdrop-blur-md border border-[#4d0a97]/20 rounded-lg shadow-lg p-4">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Search className="w-4 h-4" />
                          <span className="text-sm">
                            No addresses found for "{searchQuery}"
                          </span>
                        </div>
                      </div>
                    )}
                </div>
                {error && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
              
              <div className="text-center mt-6 space-y-2">
                <p className="text-sm font-semibold text-[#4d0a97] flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Start typing to see address suggestions
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center sm:space-x-4 space-y-2 sm:space-y-0 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    No obligation
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    USPAP compliant
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    3 day delivery
                  </span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
        {selectedPropertyData && (
          <PropertyQuoteModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedPropertyData(null);
              setError(null);
              setTimeout(() => {
                document.body.style.pointerEvents = "auto";
                document.body.style.overflow = "auto";
              }, 100);
            }}
            propertyData={selectedPropertyData}
          />
        )}
      </>
    );
  },
);

PropertySearch.displayName = "PropertySearch";

export default PropertySearch;
