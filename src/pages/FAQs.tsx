import Layout from "@/components/Layout";
import PropertySearch from "@/components/PropertySearch";
import ContactMethodButtons from "@/components/ContactMethodButtons";
import HowToPrepareSection from "@/components/HowToPrepareSection";
import { useSEO } from "@/hooks/useSEO";
import { createSafeJsonLd } from "@/lib/security";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Clock,
  DollarSign,
  FileText,
  Calendar,
  CheckCircle,
  Home,
  Scale,
  Camera,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const FAQs = () => {
  // SEO optimization for FAQ page
  useSEO({
    title: "Frequently Asked Questions | NJREAP - Real Estate Appraisals & Photography FAQ",
    description: "Get answers to common questions about real estate appraisals and photography services in Northern & Central New Jersey. USPAP compliant appraisals, pricing, process, and more.",
    keywords: "real estate appraisal FAQ, property valuation questions, appraisal process NJ, USPAP compliance, appraisal cost, photography services FAQ, New Jersey appraiser questions",
    canonical: "https://njreap.com/faqs"
  });

  const faqCategories = [
    {
      icon: Home,
      title: "General Appraisal Questions",
      faqs: [
        {
          question: "Why do I need an appraisal for my home?",
          answer:
            "Home appraisals are required for most mortgage transactions to ensure the property value supports the loan amount. They're also needed for refinancing, estate settlements, divorce proceedings, tax appeals, and other financial decisions. An appraisal provides an unbiased, professional opinion of your property's market value.",
        },
        {
          question: "How long does the appraisal process take?",
          answer:
            "The entire process typically takes 3 business days from inspection to report delivery. The on-site inspection usually takes 30-60 minutes, depending on the property size and complexity. Our team works efficiently to provide accurate reports within this timeframe.",
        },
        {
          question: "What factors influence my home's value?",
          answer:
            "Several factors affect your home's value including location, size, condition, recent improvements, comparable sales in the area, market conditions, and unique features. Our certified appraisers consider all these elements to determine accurate market value.",
        },
        {
          question: "Can I be present during the appraisal?",
          answer:
            "Yes, you're welcome to be present during the inspection. In fact, we encourage it as you can provide valuable information about recent improvements, unique features, and answer questions about your property. Your presence helps ensure we have all the necessary information for an accurate appraisal.",
        },
        {
          question: "How should I prepare my home for an appraisal?",
          answer:
            "To prepare for an appraisal, ensure your home is clean and accessible. Highlight recent upgrades with documentation (e.g., receipts for renovations), repair minor issues like leaky faucets, and enhance curb appeal with basic landscaping. Provide a list of improvements made in the last 5-10 years. Our appraisers will guide you if specific preparations are needed for your property type.",
        },
        {
          question: "Do you provide appraisals for unique or historic properties in New Jersey?",
          answer:
            "Yes, we specialize in appraising unique properties, including historic homes, waterfront properties, and custom builds common in New Jersey. Our appraisers use specialized methods and local market data to accurately value these properties, ensuring compliance with USPAP standards.",
        },
      ],
    },
    {
      icon: DollarSign,
      title: "Cost & Value Questions",
      faqs: [
        {
          question: "How can I increase my home's appraisal value?",
          answer:
            "While you can't change your home's value overnight, factors that positively impact appraisals include recent renovations, proper maintenance, curb appeal improvements, and having documentation of upgrades. However, remember that appraisals reflect current market value based on comparable sales, not just improvements.",
        },
        {
          question: "What if I disagree with the appraisal value?",
          answer:
            "If you believe the appraisal is inaccurate, you can request a reconsideration of value by providing additional comparable sales or information about unique property features that may have been missed. We'll review any new information and determine if adjustments are warranted.",
        },
        {
          question: "What is the cost of a home appraisal in NJ?",
          answer:
            "Home appraisal costs in New Jersey typically range from $400-$800 depending on property type, size, and complexity. Rural or unique properties may cost more. We offer competitive, transparent pricing with no hidden fees. Contact us for an instant quote based on your specific property and location in Northern or Central NJ.",
        },
        {
          question: "How to prepare for a property valuation in New Jersey?",
          answer:
            "To prepare for your property valuation: 1) Ensure all areas are accessible and clean, 2) Gather documentation of recent improvements and renovations, 3) Compile a list of comparable sales in your area, 4) Address minor repairs like leaky faucets, 5) Enhance curb appeal, and 6) Prepare a list of unique features or upgrades made in the last 5-10 years.",
        },
        {
          question: "What are the benefits of virtual tours for real estate listings?",
          answer:
            "Virtual tours provide 24/7 accessibility for potential buyers, increase engagement time on listings, reduce unnecessary showings, attract out-of-state buyers, and give properties a competitive edge. Studies show listings with virtual tours receive 87% more views and sell faster than those without. In today's market, virtual tours are essential for maximum exposure.",
        },
      ],
    },
    {
      icon: Clock,
      title: "Process & Timing",
      faqs: [
        {
          question: "Can I use a recent appraisal for a new mortgage?",
          answer:
            "Generally, appraisals are valid for 120 days for most lending purposes, but each lender has specific requirements. Some may accept recent appraisals if they meet their criteria, while others require new appraisals. Check with your lender about their specific policies.",
        },
        {
          question: "What is USPAP, and why is it important?",
          answer:
            "USPAP (Uniform Standards of Professional Appraisal Practice) is the set of standards that all certified appraisers must follow. It ensures consistency, objectivity, and reliability in appraisal reports. All NJREAP appraisals comply with USPAP standards, giving you confidence in the accuracy and acceptability of our reports.",
        },
        {
          question: "When can I expect the final product?",
          answer:
            "You can expect your completed appraisal report within 3 business days after the inspection. The report will be delivered electronically via email in PDF format. We'll notify you as soon as it's ready and provide any necessary follow-up support.",
        },
        {
          question: "What is the 'Inspection Date'?",
          answer:
            "The inspection date is when our certified appraiser visits your property to conduct the physical assessment. During this visit, we'll measure the property, photograph it, assess its condition, and gather information about features and improvements. You can schedule this conveniently through our online booking system.",
        },
        {
          question: "How do I schedule an appraisal or photography service?",
          answer:
            "Scheduling is easy through our online booking system, available 24/7 on our website. Select your service, choose a convenient date, and provide property details. You can also call or email us for personalized assistance. We'll confirm your appointment within 24 hours.",
        },
        {
          question: "What happens if I need to reschedule or cancel my appointment?",
          answer:
            "We understand plans change. You can reschedule or cancel your appointment by contacting us at least 24 hours in advance with no penalty. Use our online portal or call our team to make changes, and we'll work with you to find a new time that fits your schedule.",
        },
      ],
    },
    {
      icon: FileText,
      title: "Services & Deliverables",
      faqs: [
        {
          question: "What do I get from each service?",
          answer:
            "For appraisals, you receive a comprehensive USPAP-compliant report with property details, comparable sales analysis, and professional valuation. Photography services include high-resolution images, floor plans, virtual tours, or videos as selected. All deliverables are provided digitally for easy sharing and storage.",
        },
        {
          question:
            "What if I have a specific need or requirement for my service?",
          answer:
            "We understand that every client has unique needs. Whether you need rush service, specific report formats, or custom photography requirements, we're happy to accommodate when possible. Contact us to discuss your specific requirements and we'll work with you to find the best solution.",
        },
        {
          question: "Why choose your company over other appraisal firms in New Jersey?",
          answer:
            "We combine certified expertise, local New Jersey knowledge, and a client-first approach. Our USPAP-compliant appraisals, competitive pricing, and fast 3 day turnaround set us apart. Additionally, our professional photography services provide a one-stop solution for real estate needs, saving you time and ensuring consistency.",
        },
        {
          question: "Are your appraisers licensed and insured?",
          answer:
            "All our appraisers are fully licensed by the State of New Jersey and carry professional liability insurance. They are also certified to adhere to USPAP standards, ensuring you receive reliable and legally compliant appraisal reports.",
        },
      ],
    },
    {
      icon: Camera,
      title: "Photography Services",
      faqs: [
        {
          question: "What types of photography services do you offer for real estate listings?",
          answer:
            "We provide high-resolution interior and exterior photos, aerial drone photography, 3D virtual tours, and detailed floor plans to showcase your property. These services are ideal for real estate listings, marketing materials, or personal records. All deliverables are optimized for online platforms and print, tailored to your needs.",
        },
        {
          question: "How can professional photography benefit my property sale?",
          answer:
            "Professional photography enhances your property's appeal, attracting more potential buyers online and in-person. High-quality images, virtual tours, and aerial shots highlight unique features, increase listing engagement, and can lead to faster sales at higher prices. Our photography is designed to make your property stand out in the competitive New Jersey market.",
        },
        {
          question: "How long does it take to receive photography deliverables?",
          answer:
            "Photography deliverables, such as edited photos, virtual tours, or floor plans, are typically delivered within 3-5 business days after the shoot, depending on the service selected. Rush options are available for urgent needs—just let us know when scheduling.",
        },
      ],
    },
  ];

  const quickAnswers = [
    {
      icon: Clock,
      question: "How quickly can you complete an appraisal?",
      answer: "3 business days from inspection to report delivery",
    },
    {
      icon: DollarSign,
      question: "Do you offer competitive pricing?",
      answer: "Yes, transparent rates with no hidden fees",
    },
    {
      icon: Scale,
      question: "Are your appraisals USPAP compliant?",
      answer: "All reports meet professional USPAP standards",
    },
    {
      icon: Camera,
      question: "Do you offer photography services?",
      answer: "Yes, including aerial, virtual tours, and floor plans",
    },
  ];

  // Protected phone number (reversed to prevent web scraping)
  const getPhoneNumber = () => {
    const reversed = "5058734809";
    return reversed
      .split("")
      .reverse()
      .join("")
      .replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  const handleCallClick = () => {
    window.location.href = `tel:${getPhoneNumber().replace(/[^\d]/g, '')}`;
  };

  const handleLiveChatClick = () => {
    // Toggle tawk.to widget
    if (typeof window !== 'undefined' && (window as any).Tawk_API) {
      if ((window as any).Tawk_API.getStatus() === 'online') {
        (window as any).Tawk_API.toggle();
      } else {
        (window as any).Tawk_API.maximize();
      }
    }
  };

  const handleContactFormClick = () => {
    // Navigate to contact page and scroll to the message section
    window.location.href = '/contact#send-message';
  };

  return (
    <Layout>
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: createSafeJsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqCategories.flatMap(category => 
              category.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            )
          })
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        {/* Background Image - hidden on mobile */}
        <div
          className="hidden sm:block absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/pages/bg-faq.webp')`,
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

        {/* Gradient Overlay */}
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
              Frequently Asked Questions
            </Badge>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6">
              Your Questions Answered
            </h1>
            <p className="text-lg sm:text-xl text-gray-100 leading-relaxed">
              Find answers to common questions about our appraisal and
              photography services in Northern & Central New Jersey. Can't find what you're looking for? Contact
              us directly.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Answers */}
      <section className="py-8 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              Quick Answers
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fast answers to our most frequently asked questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {quickAnswers.map((item, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4d0a97] to-[#a044e3] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                    {item.question}
                  </h3>
                  <p className="text-sm text-gray-600">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed FAQs */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              Detailed FAQ Categories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive answers organized by topic to help you understand
              our services better
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {faqCategories.map((category, categoryIndex) => (
              <Card
                key={categoryIndex}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#4d0a97] to-[#a044e3] rounded-lg flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem
                        key={faqIndex}
                        value={`item-${categoryIndex}-${faqIndex}`}
                      >
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Benefits */}
      <section className="py-8 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              Why Choose NJREAP?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The answers above highlight what makes NJREAP the right choice for
              your appraisal and photography needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  USPAP Compliant
                </h3>
                <p className="text-sm text-gray-600">
                  All appraisals meet professional standards
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Fast Turnaround
                </h3>
                <p className="text-sm text-gray-600">
                  3 day delivery guaranteed
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Competitive Pricing
                </h3>
                <p className="text-sm text-gray-600">
                  Transparent rates, no hidden fees
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <HelpCircle className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Expert Support
                </h3>
                <p className="text-sm text-gray-600">
                  Local expertise and guidance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Prepare for an Appraisal */}
      <HowToPrepareSection />

      {/* Additional Questions */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center p-4 sm:p-8">
            <CardHeader>
              <HelpCircle className="w-16 h-16 text-[#4d0a97] mx-auto mb-4" />
              <CardTitle className="text-2xl mb-4">
                Still Have Questions?
              </CardTitle>
              <CardDescription className="text-lg">
                Can't find the answer you're looking for? Our team is here to
                help with any additional questions about our services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="text-center flex flex-col items-center">
                  <Phone className="w-8 h-8 text-[#4d0a97] mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Call Us</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Speak directly with our team
                  </p>
                  <Button 
                    onClick={handleCallClick}
                    size="lg" 
                    className="bg-[#4d0a97] hover:bg-[#a044e3] w-full max-w-[200px]"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Us
                  </Button>
                </div>
                <div className="text-center flex flex-col items-center">
                  <MessageCircle className="w-8 h-8 text-[#4d0a97] mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Live Chat</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get immediate assistance
                  </p>
                  <Button 
                    onClick={handleLiveChatClick}
                    size="lg" 
                    variant="outline"
                    className="border-[#4d0a97] text-[#4d0a97] hover:bg-[#4d0a97] hover:text-white w-full max-w-[200px]"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Live Chat
                  </Button>
                </div>
                <div className="text-center flex flex-col items-center">
                  <FileText className="w-8 h-8 text-[#4d0a97] mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Contact Form</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Send us your questions
                  </p>
                  <Button 
                    onClick={handleContactFormClick}
                    size="lg" 
                    variant="outline"
                    className="border-[#4d0a97] text-[#4d0a97] hover:bg-[#4d0a97] hover:text-white w-full max-w-[200px]"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Contact Form
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-16 bg-gradient-to-r from-[#4d0a97] to-[#a044e3] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold">Ready to Get Started?</h2>
              <p className="text-lg sm:text-xl text-gray-100">
                Now that your questions are answered, get your free appraisal
                quote and experience the NJREAP difference.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Instant online quotes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Professional USPAP-compliant reports</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Expert local knowledge</span>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/services">
                  <Button
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white hover:text-[#4d0a97] transition-all"
                  >
                    View Services
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <PropertySearch
                className="bg-white/95 backdrop-blur-sm shadow-2xl"
                title="Need a Quick Quote?"
                description="Ready to get started? Enter your address below using our New Jersey public records database."
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQs;
