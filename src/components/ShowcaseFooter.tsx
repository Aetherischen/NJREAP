import { Link } from 'react-router-dom';

const ShowcaseFooter = () => {
  return (
    <footer className="bg-background border-t border-border py-8" role="contentinfo">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Link to="/" className="flex items-center" aria-label="NJREAP - Real Estate Appraisals and Photography">
              <img 
                src="/logo.svg" 
                alt="NJREAP Logo" 
                className="h-8 w-auto"
                width="32"
                height="32"
              />
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Property Showcase by{' '}
            <Link 
              to="/" 
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              New Jersey Real Estate Appraisals and Photography (NJREAP)
            </Link>
          </p>
          
          <div className="text-xs text-muted-foreground space-y-2 max-w-3xl mx-auto">
            <p>
              <strong>Disclaimer:</strong> NJREAP is not the listing agent of the property above. 
              No appraisal has been completed for this property. This showcase is provided for 
              marketing and informational purposes only.
            </p>
            <p>
              All property information should be verified independently. Contact the listing agent 
              for official property details and availability.
            </p>
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              © 2025 NJREAP LLC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ShowcaseFooter;