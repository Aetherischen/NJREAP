
import { useState } from "react";
import { clsx } from "clsx";
import { MapPin, CheckCircle } from "lucide-react";

const counties = [
  "Bergen",
  "Essex",
  "Hudson",
  "Hunterdon",
  "Mercer",
  "Middlesex",
  "Monmouth",
  "Morris",
  "Passaic",
  "Somerset",
  "Sussex",
  "Union",
  "Warren",
];

const NJCountiesMap = () => {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);

  return (
    <section className="relative py-10 lg:pt-28 lg:pb-24 bg-purple-200/10 sm:bg-[url('/images/misc/bg-top.svg'),_url('/images/misc/bg-bottom.svg')] bg-no-repeat sm:bg-[position:left_top,_right_bottom]">
      <div className="container mx-auto px-4">
        {/* Main Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
            Comprehensive Coverage Across New Jersey
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            NJREAP proudly serves Northern and Central New Jersey with
            professional appraisal and photography services. Our local expertise
            covers 13 counties, ensuring we understand the unique
            characteristics and market dynamics of each area.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Interactive Map */}
          <div className="space-y-8">
            <div
              className={clsx(
                "hover-map transition-all duration-300",
                hoveredCounty,
              )}
            >
              <img
                src="/images/misc/map.svg"
                alt="New Jersey Counties Map"
                className="w-full max-w-md mx-auto lg:mx-0"
              />
            </div>
          </div>

          {/* Right side - Counties List and Features */}
          <div className="space-y-6">
            {/* Counties Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-2 gap-2 sm:gap-3">
              {counties.map((county) => (
                <div
                  key={county}
                  onMouseEnter={() => setHoveredCounty(county)}
                  onMouseLeave={() => setHoveredCounty(null)}
                  className={clsx(
                    "flex flex-col sm:flex-row items-center p-2 sm:p-3 rounded-lg transition-all duration-200 cursor-pointer group text-center sm:text-left",
                    "bg-white border border-gray-200 hover:border-[#4d0a97] hover:shadow-md",
                    hoveredCounty === county &&
                      "border-[#4d0a97] shadow-md bg-[#4d0a97]/5",
                  )}
                >
                  <div
                    className={clsx(
                      "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg mb-1 sm:mb-0 sm:mr-3 transition-colors duration-200",
                      "bg-gray-100 group-hover:bg-[#4d0a97] group-hover:text-white",
                      hoveredCounty === county &&
                        "bg-[#4d0a97] text-white",
                    )}
                  >
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4
                      className={clsx(
                        "font-semibold text-xs sm:text-sm transition-colors duration-200",
                        "text-gray-900 group-hover:text-[#4d0a97]",
                        hoveredCounty === county && "text-[#4d0a97]",
                      )}
                    >
                      {county}
                      <span className="hidden sm:inline"> County</span>
                    </h4>
                  </div>
                </div>
              ))}
            </div>

            {/* Key Features Grid */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">13 Counties Covered</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">
                  Local Market Knowledge
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">Urban & Suburban</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">
                  Professional Service
                </span>
              </div>
            </div>

            {/* NJPropertyRecords Info */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">
                  Powered by NJPropertyRecords
                </span>{" "}
                - Access to comprehensive property data and market insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NJCountiesMap;
