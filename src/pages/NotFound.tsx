
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  // SEO optimization for 404 page
  useSEO({
    title: "Page Not Found | NJREAP - Real Estate Appraisals & Photography",
    description: "The page you're looking for doesn't exist. Return to NJREAP for professional real estate appraisals and photography services in Northern & Central New Jersey.",
    noindex: true
  });

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-[#4d0a97] mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/">
            <Button size="lg" className="bg-[#4d0a97] hover:bg-[#a044e3] w-full">
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </Link>
          
          <Link to="/services">
            <Button variant="outline" size="lg" className="w-full">
              <Search className="w-4 h-4 mr-2" />
              View Our Services
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? <Link to="/contact" className="text-[#4d0a97] hover:underline">Contact us</Link></p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
