
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const services = [
    'Real Estate Appraisals',
    'Professional Photography',
    'Aerial Photography',
    'Floor Plans',
    'Virtual Tours',
    'Video Walkthroughs'
  ];

  const serviceAreas = [
    'Newark',
    'Jersey City',
    'Trenton',
    'Princeton',
    'Hoboken',
    'Atlantic City',
    'Cape May',
    'Montclair'
  ];

  return (
    <footer id="contact" className="bg-[#020817] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="NJREAP Logo" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-300">
              Professional real estate appraisal and photography services throughout New Jersey.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#a044e3]" />
                <a 
                  href="tel:+19084378505"
                  className="text-gray-300 hover:text-[#a044e3] transition-colors obfuscated-phone"
                >
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#a044e3]" />
                <a 
                  href="mailto:info@njreap.com?subject=%5BNJREAP%5D%20Request%20for%20Information"
                  className="text-gray-300 hover:text-[#a044e3] transition-colors obfuscated-email"
                >
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-[#a044e3]" />
                <span>Northern & Central New Jersey</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-[#4d0a97] rounded-lg flex items-center justify-center hover:bg-[#a044e3] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#4d0a97] rounded-lg flex items-center justify-center hover:bg-[#a044e3] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#4d0a97] rounded-lg flex items-center justify-center hover:bg-[#a044e3] transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Our Services</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a href="#services" className="text-gray-300 hover:text-[#a044e3] transition-colors">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Service Areas</h4>
            <ul className="space-y-3">
              {serviceAreas.map((area, index) => (
                <li key={index} className="text-gray-300">
                  {area}, NJ
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-gray-300 hover:text-[#a044e3] transition-colors">Home</a></li>
              <li><a href="#about" className="text-gray-300 hover:text-[#a044e3] transition-colors">About</a></li>
              <li><a href="#services" className="text-gray-300 hover:text-[#a044e3] transition-colors">Services</a></li>
              <li><a href="#gallery" className="text-gray-300 hover:text-[#a044e3] transition-colors">Gallery</a></li>
              <li><a href="/showcase" className="text-gray-300 hover:text-[#a044e3] transition-colors">Showcase</a></li>
              <li><a href="#blog" className="text-gray-300 hover:text-[#a044e3] transition-colors">Blog</a></li>
              <li><a href="#contact" className="text-gray-300 hover:text-[#a044e3] transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-300 text-sm">
              © 2024 NJREAP. All rights reserved. Licensed in New Jersey.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-300 hover:text-[#a044e3] transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-300 hover:text-[#a044e3] transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-300 hover:text-[#a044e3] transition-colors">Licensing</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
