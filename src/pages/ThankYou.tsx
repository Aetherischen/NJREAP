import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, FileText, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';

const ThankYou: React.FC = () => {
  useSEO({
    title: "Thank You - Service Request Submitted | NJREAP",
    description: "Your service request has been submitted successfully. We'll send you an invoice within 24 hours.",
    keywords: "thank you, service request, confirmation, NJREAP"
  });

  useEffect(() => {
    // Google Analytics and Ads tracking
    if (typeof window !== 'undefined') {
      // Declare dataLayer on window object
      (window as any).dataLayer = (window as any).dataLayer || [];
      
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }

      // Load Google Analytics script
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-CVX8RHFWB1';
      document.head.appendChild(gtagScript);

      gtagScript.onload = () => {
        gtag('js', new Date());
        gtag('config', 'G-CVX8RHFWB1');
        gtag('config', 'AW-16594797036/_HVKCKDe1o4bEOyDguk9', {
          'phone_conversion_number': '9084378505'
        });
        
        // Track conversion event
        gtag('event', 'conversion', {
          'send_to': 'AW-16594797036/_HVKCKDe1o4bEOyDguk9'
        });
      };

      // Cleanup function
      return () => {
        if (document.head.contains(gtagScript)) {
          document.head.removeChild(gtagScript);
        }
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <style>{`
          .protected-email::before {
            content: "info@njreap.com";
          }
          .protected-phone::before {
            content: "(908) 437-8505";
          }
          .protected-email, .protected-phone {
            color: inherit;
            text-decoration: none;
          }
          .protected-email:hover, .protected-phone:hover {
            text-decoration: underline;
          }
        `}</style>
        
        <div className="bg-card rounded-lg shadow-lg p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-foreground">
              Service Request Submitted Successfully!
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Your service request has been submitted and we'll send you an invoice
              within 24 hours. You'll receive email confirmations with all the
              details.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg max-w-lg mx-auto">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                What Happens Next:
              </h2>

              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Invoice & Confirmation
                    </p>
                    <p className="text-xs text-blue-700">
                      We'll email you an invoice and service confirmation within 24
                      hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Appointment Confirmation
                    </p>
                    <p className="text-xs text-blue-700">
                      We'll contact you to confirm your scheduled appointment details
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Service Coordination
                    </p>
                    <p className="text-xs text-blue-700">
                      Our team will coordinate with you for smooth service delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg max-w-lg mx-auto">
              <p className="text-sm text-green-700">
                <strong>Questions? Need to make changes?</strong> Contact us at{" "}
                <a
                  href="mailto:info@njreap.com"
                  className="text-green-800 hover:underline font-medium protected-email"
                ></a>
                {" "}or call{" "}
                <a
                  href="tel:+19084378505"
                  className="text-green-800 hover:underline font-medium protected-phone"
                ></a>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Link to="/">
              <Button className="w-full">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;