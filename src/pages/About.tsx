
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSEO } from '@/hooks/useSEO';
import {
  Target,
  Award,
  Users,
  DollarSign,
  Zap,
  CheckCircle,
  Heart,
} from 'lucide-react';

const About = () => {
  // SEO optimization
  useSEO({
    title: "About NJREAP: Trusted Appraisers & Photographers in Central NJ",
    description: "Learn about our experienced team providing real estate appraisals and professional photography services across New Jersey since 2024.",
    keywords: "real estate appraisal New Jersey, property photography NJ, Northern NJ appraiser, Central NJ real estate services, USPAP certified appraiser, professional photography team, licensed real estate appraiser, property valuation experts",
    canonical: "https://njreap.com/about",
    ogImage: "/images/pages/bg-about.webp"
  });

  const advantages = [
    {
      icon: DollarSign,
      title: 'Competitive Pricing',
      description:
        'Transparent and affordable rates without compromising quality.',
    },
    {
      icon: Zap,
      title: 'Modern Technology',
      description:
        'Utilizes advanced tools for precise evaluations and high-quality visuals, with features like Google Calendar booking and email alerts for client convenience.',
    },
    {
      icon: Users,
      title: 'Local Expertise',
      description:
        'Deep knowledge of Northern and Central NJ markets, covering urban and suburban areas across 12 counties.',
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
            backgroundImage: `url('/images/pages/bg-about.webp')`,
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

        {/* Gradient Overlay - 100% opacity dropping to 0% at 75% width */}
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
              About NJREAP
            </Badge>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6">
              Your Trusted Partner in Real Estate Excellence
            </h1>
            <p className="text-lg sm:text-xl text-gray-100 leading-relaxed">
              New Jersey Real Estate Appraisals and Photography (NJREAP) is a
              trusted provider of real estate appraisal and professional
              photography services, specializing in residential properties
              across Northern and Central New Jersey.
            </p>
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="py-8 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center mb-4 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              Watch the Video to Learn More
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Get an overview of our company, the comprehensive services we
              provide, and our commitment to excellence
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div
              className="relative w-full"
              style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}
            >
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                src="https://www.youtube-nocookie.com/embed/kimESDkwW8c?si=t6U9j-teHvupZVse&rel=0&modestbranding=1&showinfo=0"
                title="NJREAP - Real Estate Appraisals and Photography Services"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Company Introduction and Mission */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-stretch">
            {/* Who We Are */}
            <Card className="border-l-4 border-l-[#a044e3] h-full">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-[#a044e3]" />
                  <CardTitle className="text-2xl">Who We Are</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  With a focus on accuracy, transparency, and client
                  satisfaction, NJREAP delivers expert valuations and
                  high-quality visual services to empower clients in making
                  informed real estate decisions.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  The company combines local market expertise, modern
                  technology, and a client-centric approach to offer reliable
                  and accessible solutions for all your real estate appraisal
                  and photography needs across Northern and Central New Jersey.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">USPAP Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">
                      Licensed & Insured
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">
                      Certified Appraisers
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Local Expertise</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Our Mission */}
            <Card className="border-l-4 border-l-[#4d0a97] h-full">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Target className="w-8 h-8 text-[#4d0a97]" />
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  NJREAP's mission is to provide accurate, transparent, and
                  client-focused residential appraisals and photography services
                  that enable clients to make confident real estate investment
                  decisions.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We are committed to delivering exceptional service quality
                  throughout Northern and Central New Jersey through:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Heart className="w-5 h-5 text-[#4d0a97] mt-1" />
                    <span className="text-gray-700">
                      Professional excellence and integrity in every interaction
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-[#4d0a97] mt-1" />
                    <span className="text-gray-700">
                      Innovative technology for accurate and efficient service
                      delivery
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-[#4d0a97] mt-1" />
                    <span className="text-gray-700">
                      Deep local market knowledge across Northern and Central New Jersey
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Expertise and Excellence */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-start">
            <div className="h-full flex flex-col">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                Expertise and Excellence
              </h2>
              <div className="space-y-4 flex-grow">
                <p className="text-gray-600 leading-relaxed">
                  With extensive experience in the Northern and Central New Jersey real estate markets,
                  NJREAP's team of certified appraisers adheres to the highest
                  professional standards, including compliance with the Uniform
                  Standards of Professional Appraisal Practice (USPAP).
                </p>
                <p className="text-gray-600 leading-relaxed">
                  This ensures unbiased, meticulous, and industry-compliant
                  assessments for every project across Northern and Central New Jersey, giving you confidence in our
                  valuations and recommendations.
                </p>
              </div>
              <div className="mt-6 p-6 bg-gradient-to-r from-[#4d0a97]/10 to-[#a044e3]/10 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Award className="w-6 h-6 text-[#4d0a97]" />
                  <h3 className="font-semibold text-gray-900">
                    Professional Standards
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Certified and licensed appraisers</li>
                  <li>• USPAP compliance for all assessments</li>
                  <li>• Continuous professional development</li>
                  <li>• Industry best practices implementation</li>
                </ul>
              </div>
            </div>

            <div className="h-full flex flex-col">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                Client-Centric Approach
              </h2>
              <div className="space-y-4 flex-grow">
                <p className="text-gray-600 leading-relaxed">
                  NJREAP prioritizes clear communication and understanding
                  clients' unique needs, treating each client as a valued
                  partner rather than just a transaction.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  The company is committed to delivering results that matter,
                  fostering trust and confidence throughout the appraisal and
                  photography process across Northern and Central New Jersey.
                </p>
              </div>
              <div className="mt-6 p-6 bg-gradient-to-r from-[#a044e3]/10 to-[#4d0a97]/10 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Heart className="w-6 h-6 text-[#4d0a97]" />
                  <h3 className="font-semibold text-gray-900">
                    Client Commitment
                  </h3>
                  </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Personalized service for every client</li>
                  <li>• Clear and transparent communication</li>
                  <li>• Understanding unique client needs</li>
                  <li>• Building long-term relationships</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NJREAP Advantage */}
      <section className="py-8 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              The NJREAP Advantage
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover what sets us apart and why thousands of clients trust us
              with their real estate needs across Northern and Central New Jersey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            {advantages.map((advantage, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#4d0a97] to-[#a044e3] rounded-full flex items-center justify-center mb-4">
                    <advantage.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{advantage.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{advantage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
