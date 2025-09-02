import { useState, useRef } from "react";
import Layout from "@/components/Layout";
import PropertySearch from "@/components/PropertySearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle,
  Send,
  Users,
  Star,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useSEO } from "@/hooks/useSEO";
import NJCountiesMap from "@/components/NJCountiesMap";

const Contact = () => {
  // SEO optimization
  useSEO({
    title: "Contact NJREAP - Get Your Real Estate Appraisal Quote Today",
    description: "Contact NJREAP for professional real estate appraisals and photography services in Northern and Central New Jersey. Get your free quote today!",
    keywords: "contact NJREAP, real estate appraisal quote NJ, property photography contact, Northern NJ appraiser contact, Central NJ real estate services",
    canonical: "https://njreap.com/contact",
    ogImage: "/images/pages/bg-contact.webp"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form validation setup
  const { fields, getFieldProps, validateAll, resetForm } = useFormValidation({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    },
    validationRules: {
      firstName: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
      lastName: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        maxLength: 100,
      },
      phone: {
        pattern: /^[\+]?[\d\s\-\(\)]{10,}$/,
        custom: (value: string) => {
          if (value && value.replace(/\D/g, '').length < 10) {
            return "Phone number must be at least 10 digits";
          }
          return null;
        }
      },
      message: {
        required: true,
        minLength: 10,
        maxLength: 1000,
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) {
      toast({
        title: "Please correct the errors",
        description: "Check the form fields and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        firstName: fields.firstName.value,
        lastName: fields.lastName.value,
        email: fields.email.value,
        phone: fields.phone.value,
        message: fields.message.value,
      };

      console.log('Sending contact form data:', formData);
      
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Email sent successfully:', data);
      
      // Removed Google Ads conversion tracking - now handled on specific pages
      
      setIsSubmitted(true);
      resetForm();

      toast({
        title: "Message sent successfully!",
        description: "We've received your inquiry and will get back to you within 24 hours. You should receive a confirmation email shortly.",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error sending message",
        description: "Please try again or contact us directly at info@njreap.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone",
      details: ["(908) 437-8505"],
      description: "Call us for immediate assistance and free quotes",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@njreap.com"],
      description: "Send us your questions anytime - we respond quickly",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Friday: 9:00 AM - 6:00 PM"],
      description: "Available for calls and consultations",
    },
  ];

  const serviceHighlights = [
    {
      icon: CheckCircle,
      title: "Professional Service",
      description: "USPAP-compliant appraisals by certified professionals",
    },
    {
      icon: Clock,
      title: "Fast Turnaround",
      description: "3 business day delivery guaranteed",
    },
    {
      icon: Users,
      title: "Client-Focused",
      description: "Personalized support and transparent communication",
    },
    {
      icon: Star,
      title: "Trusted Locally",
      description: "Serving Northern & Central NJ with local expertise",
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
            backgroundImage: `url('/images/pages/bg-contact.webp')`,
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
              Get In Touch
            </Badge>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6">Contact Us</h1>
            <p className="text-lg sm:text-xl text-gray-100 leading-relaxed">
              NJREAP is committed to personalized support and transparency.
              Reach out to us for all your real estate appraisal and photography
              needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-8 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              Ways to Reach Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the method that works best for you. We're here to help with
              any questions about our services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4d0a97] to-[#a044e3] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {method.details.map((detail, detailIndex) => (
                      <p
                        key={detailIndex}
                        className={`text-lg font-semibold text-[#4d0a97] ${
                          method.title === "Phone" ? "obfuscated-phone" : 
                          method.title === "Email" ? "obfuscated-email" : ""
                        }`}
                        style={{
                          userSelect: method.title === "Phone" ? "none" : "auto",
                        }}
                      >
                        {method.title === "Phone" || method.title === "Email" ? "" : detail}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Quote Form - Side by Side */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-start">
              {/* Contact Form - Left Side */}
              <div className="flex justify-center">
                <div className="w-full max-w-lg" data-contact-form>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center">
                        <Send className="w-6 h-6 mr-2 text-[#4d0a97]" />
                        Send Us a Message
                      </CardTitle>
                      <CardDescription>
                        Fill out the form below and we'll get back to you as
                        soon as possible.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name *
                              </label>
                              <Input
                                type="text"
                                placeholder="Your first name"
                                {...getFieldProps('firstName')}
                                className={getFieldProps('firstName').hasError ? 'border-red-500' : ''}
                              />
                              {getFieldProps('firstName').hasError && (
                                <div className="flex items-center mt-1 text-sm text-red-600">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  {getFieldProps('firstName').error}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name *
                              </label>
                              <Input
                                type="text"
                                placeholder="Your last name"
                                {...getFieldProps('lastName')}
                                className={getFieldProps('lastName').hasError ? 'border-red-500' : ''}
                              />
                              {getFieldProps('lastName').hasError && (
                                <div className="flex items-center mt-1 text-sm text-red-600">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  {getFieldProps('lastName').error}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address *
                            </label>
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              {...getFieldProps('email')}
                              className={getFieldProps('email').hasError ? 'border-red-500' : ''}
                            />
                            {getFieldProps('email').hasError && (
                              <div className="flex items-center mt-1 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {getFieldProps('email').error}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <Input
                              type="tel"
                              placeholder="(555) 123-4567"
                              {...getFieldProps('phone')}
                              className={getFieldProps('phone').hasError ? 'border-red-500' : ''}
                            />
                            {getFieldProps('phone').hasError && (
                              <div className="flex items-center mt-1 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {getFieldProps('phone').error}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Message *
                            </label>
                            <Textarea
                              placeholder="Tell us about your appraisal or photography needs..."
                              rows={4}
                              {...getFieldProps('message')}
                              className={getFieldProps('message').hasError ? 'border-red-500' : ''}
                            />
                            {getFieldProps('message').hasError && (
                              <div className="flex items-center mt-1 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {getFieldProps('message').error}
                              </div>
                            )}
                          </div>
                          <Button
                            type="submit"
                            className="w-full bg-[#4d0a97] hover:bg-[#a044e3]"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Sending..." : "Send Message"}
                          </Button>
                        </form>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Thank you for your message!
                          </h3>
                          <p className="text-gray-600 mb-4">
                            We've received your inquiry and will get back to you
                            within 24 hours. You should receive a confirmation email shortly.
                          </p>
                          <Button
                            onClick={() => {
                              setIsSubmitted(false);
                              resetForm();
                            }}
                            variant="outline"
                            className="border-[#4d0a97] text-[#4d0a97] hover:bg-[#4d0a97] hover:text-white"
                          >
                            Send Another Message
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Quote Form - Right Side */}
              <div className="flex justify-center">
                <div className="w-full max-w-lg">
                  <PropertySearch
                    title="Need a Quick Quote?"
                    description="Get an instant appraisal quote by entering your property address using our New Jersey public records database."
                    className="bg-white shadow-lg hover:shadow-lg transition-shadow"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="py-8 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              Why Contact NJREAP?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              When you reach out to us, you're connecting with a team committed
              to excellence and client satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {serviceHighlights.map((highlight, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <highlight.icon className="w-12 h-12 text-[#4d0a97] mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {highlight.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {highlight.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area Map */}
      <NJCountiesMap />

      {/* Final CTA */}
      <section className="py-8 sm:py-16 bg-gradient-to-r from-[#4d0a97] to-[#a044e3] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6">
              Ready to Experience Professional Service?
            </h2>
            <p className="text-lg sm:text-xl text-gray-100 mb-4 sm:mb-8">
              Contact NJREAP today and discover why we're New Jersey's trusted
              choice for real estate appraisals and photography.
            </p>
            <div className="flex justify-center">
              <Link to="/">
                <Button
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white hover:text-[#4d0a97] transition-all"
                >
                  Get Free Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
