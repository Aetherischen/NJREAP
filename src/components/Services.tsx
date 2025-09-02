
import { Camera, FileText, Plane, Map, Video, Home, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const Services = () => {
  const services = [
    {
      icon: FileText,
      title: 'Real Estate Appraisals',
      description: 'Certified appraisals for mortgage, refinance, estate, and legal purposes.',
      price: 'From $450',
      features: ['Licensed & Certified', 'Fast Turnaround', 'Detailed Reports', 'Court Testimony']
    },
    {
      icon: Camera,
      title: 'Professional Photography',
      description: 'High-quality interior and exterior photography to showcase your property.',
      price: 'From $299',
      features: ['HDR Photography', 'Professional Editing', 'Same-Day Delivery', '25+ Photos']
    },
    {
      icon: Plane,
      title: 'Aerial Photography',
      description: 'Stunning drone photography and videography for unique perspectives.',
      price: 'From $199',
      features: ['4K Resolution', 'Licensed Pilot', 'Weather Dependent', 'Multiple Angles']
    },
    {
      icon: Map,
      title: 'Floor Plans',
      description: 'Accurate floor plans and measurements for listings and marketing.',
      price: 'From $149',
      features: ['Precise Measurements', 'Professional Layout', 'Multiple Formats', 'Quick Delivery']
    },
    {
      icon: Video,
      title: 'Virtual Tours',
      description: 'Interactive 360° virtual tours that engage potential buyers.',
      price: 'From $399',
      features: ['360° Views', 'Interactive Elements', 'Mobile Friendly', 'Hosting Included']
    },
    {
      icon: Home,
      title: 'Virtual Home Tours',
      description: 'Comprehensive video walkthroughs with professional narration.',
      price: 'From $249',
      features: ['HD Video', 'Professional Editing', 'Music & Narration', 'Multiple Formats']
    }
  ];

  const packages = [
    {
      name: 'Basic Package',
      price: '$299',
      description: 'Perfect for standard listings',
      features: [
        'Professional Photography (25+ photos)',
        'Basic Editing & Enhancement',
        'Same-Day Digital Delivery',
        'Web-Ready & Print-Ready Files'
      ],
      popular: false
    },
    {
      name: 'Premium Package',
      price: '$499',
      description: 'Most popular choice',
      features: [
        'Professional Photography (40+ photos)',
        'Floor Plan with Measurements',
        'Aerial Photography (5+ photos)',
        'Advanced HDR Processing',
        'Virtual Staging (2 rooms)',
        'Priority Scheduling'
      ],
      popular: true
    },
    {
      name: 'Ultimate Package',
      price: '$699',
      description: 'Complete marketing solution',
      features: [
        'Everything in Premium Package',
        '360° Virtual Tour',
        'Professional Video Walkthrough',
        'Twilight Photography',
        'Drone Video (60 seconds)',
        'Social Media Package',
        'Expedited 4-Hour Delivery'
      ],
      popular: false
    }
  ];

  const handleDownloadSampleReport = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('appraisal-sample')
        .download('RE10000 - 123 Sample Rd.pdf');

      if (error) {
        console.error('Error downloading sample report:', error);
        return;
      }

      // Create a blob URL and trigger download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'RE10000 - 123 Sample Rd.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading sample report:', error);
    }
  };

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#020817] mb-4">
            Our Services
          </h2>
          <p className="text-xl text-[#374151] max-w-3xl mx-auto">
            Professional real estate services tailored to your needs. From certified appraisals to stunning photography, we help you showcase and value properties with expertise.
          </p>
        </div>

        {/* Individual Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-gray-200">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#4d0a97] to-[#a044e3] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-[#020817]">{service.title}</CardTitle>
                  <div className="text-2xl font-bold text-[#4d0a97]">{service.price}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-[#374151] mb-6">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-[#374151]">
                        <div className="w-1.5 h-1.5 bg-[#4d0a97] rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Photography Packages */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#020817] mb-4">
              Photography Packages
            </h3>
            <p className="text-lg text-[#374151]">
              Choose the perfect package for your property marketing needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={index} className={`relative ${pkg.popular ? 'transform scale-105' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#4d0a97] text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                <Card className={`h-full ${pkg.popular ? 'border-[#4d0a97] border-2 shadow-xl' : 'border-gray-200'}`}>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-[#020817]">{pkg.name}</CardTitle>
                    <div className="text-4xl font-bold text-[#4d0a97] mb-2">{pkg.price}</div>
                    <p className="text-[#374151]">{pkg.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-[#374151]">
                          <div className="w-2 h-2 bg-[#4d0a97] rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${pkg.popular 
                        ? 'bg-[#4d0a97] hover:bg-[#a044e3] text-white' 
                        : 'bg-white border-[#4d0a97] text-[#4d0a97] hover:bg-[#4d0a97] hover:text-white'
                      }`}
                      variant={pkg.popular ? 'default' : 'outline'}
                    >
                      Choose {pkg.name}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
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
                See what you'll receive with our professional appraisal services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <FileText className="w-20 h-20 text-[#4d0a97] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">
                  Professional USPAP-Compliant Report
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Our comprehensive appraisal reports include property details, comparable sales analysis, market trends, and professional valuation conclusions. Each report is fully compliant with USPAP standards and accepted by all major lenders.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold">Complete Analysis</h4>
                    <p className="text-sm text-gray-600">Detailed property assessment</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold">Market Comparables</h4>
                    <p className="text-sm text-gray-600">Recent sales data analysis</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold">Professional Photos</h4>
                    <p className="text-sm text-gray-600">High-quality property images</p>
                  </div>
                </div>
                <Button
                  className="bg-[#4d0a97] hover:bg-[#a044e3]"
                  onClick={handleDownloadSampleReport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample Report (PDF)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-[#4d0a97] to-[#a044e3] rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-xl mb-8 text-white/90">
            Get an instant quote for your property and schedule your services today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[#4d0a97] hover:bg-gray-100 text-lg px-8 py-3 h-auto">
              Get Instant Quote
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#4d0a97] text-lg px-8 py-3 h-auto">
              Call (555) 123-4567
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
