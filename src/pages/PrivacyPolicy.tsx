import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";

const PrivacyPolicy = () => {
  // SEO optimization
  useSEO({
    title: "Privacy Policy | NJREAP - Data Protection & Information Security",
    description: "Read NJREAP's privacy policy to understand how we collect, use, and protect your personal information when using our real estate appraisal and photography services.",
    keywords: "privacy policy, data protection, NJREAP privacy, personal information security, real estate appraisal privacy",
    canonical: "https://njreap.com/privacy-policy",
    noindex: true
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#4d0a97] to-[#a044e3] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge
              variant="outline"
              className="text-white border-white/30 mb-4"
            >
              Privacy
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Website Privacy Policy
            </h1>
            <p className="text-sm text-gray-300 mt-4">
              Last modified: June 18, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  Business Identification
                </h2>
                <p className="mb-6">
                  <strong>Company Name:</strong> New Jersey Real Estate Appraisals and Photography LLC (NJREAP)<br/>
                  <strong>Contact Information:</strong><br/>
                  Email: <a href="mailto:info@njreap.com?subject=%5BNJREAP%5D%20Request%20for%20Information" className="text-[#4d0a97] hover:underline obfuscated-email"></a><br/>
                  Phone: <a href="tel:+19084378505" className="text-[#4d0a97] hover:underline obfuscated-phone"></a><br/>
                  Service Area: Northern & Central New Jersey<br/>
                  Website: <a href="https://njreap.com" className="text-[#4d0a97] hover:underline">njreap.com</a>
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  Introduction
                </h2>
                <p className="mb-6">
                  New Jersey Real Estate Appraisals and Photography LLC
                  ("Company," "NJREAP," or "We") respect your privacy and are committed to
                  protecting it through our compliance with this policy.
                </p>
                <p className="mb-6">
                  This policy describes the types of information we may collect
                  from you or that you may provide when you visit the website
                  njreap.com (our "Website") and our practices for collecting,
                  using, maintaining, protecting, and disclosing that
                  information.
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  Information We Collect
                </h2>
                <p className="mb-4">We collect several types of information, including:</p>
                
                <h3 className="text-xl font-semibold text-[#4d0a97] mb-3">Personal Information:</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Name, phone number, email address</li>
                  <li>Billing and mailing addresses</li>
                  <li>Payment information (processed securely through third-party processors)</li>
                </ul>

                <h3 className="text-xl font-semibold text-[#4d0a97] mb-3">Property Information:</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Property addresses and legal descriptions</li>
                  <li>Interior and exterior photographs</li>
                  <li>Property measurements and details</li>
                  <li>Appraisal notes and observations</li>
                  <li>Access codes and special instructions (when provided)</li>
                </ul>

                <h3 className="text-xl font-semibold text-[#4d0a97] mb-3">Client-Provided Documents:</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Building permits and certificates</li>
                  <li>Floor plans and surveys</li>
                  <li>Previous appraisals or assessments</li>
                  <li>Property disclosure statements</li>
                </ul>

                <h3 className="text-xl font-semibold text-[#4d0a97] mb-3">Technical Information:</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li>IP address, browser type, and device information</li>
                  <li>Website usage analytics (via Google Analytics)</li>
                  <li>Cookies and tracking technologies</li>
                </ul>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  How We Collect Information
                </h2>
                <ul className="list-disc pl-6 mb-6">
                  <li>Through forms on our website (contact, booking, and quote requests)</li>
                  <li>During on-site property visits and inspections</li>
                  <li>Via third-party booking tools and CRM systems</li>
                  <li>Through payment processors for invoicing</li>
                  <li>From public records and MLS databases when necessary for appraisals</li>
                </ul>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  Purpose of Data Collection
                </h2>
                <p className="mb-4">We collect and use your information to:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Schedule and coordinate property appointments</li>
                  <li>Deliver professional appraisal and photography services</li>
                  <li>Process payments and send invoices</li>
                  <li>Communicate with clients about services and updates</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Improve our services through quality control and analytics</li>
                  <li>Create marketing materials (only with explicit written consent)</li>
                </ul>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  Photo Usage and Consent
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 font-medium">
                    <strong>Important:</strong> We do not use property photos for marketing, portfolio, or promotional purposes without prior written consent from the property owner or authorized representative. All property images are kept confidential and used solely for the intended appraisal or photography service unless explicit permission is granted for other uses.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  Appraisal Confidentiality
                </h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800">
                    All appraisal reports and supporting data are kept strictly confidential and are only shared with authorized parties, including the client, lenders, and other parties as required by law or with explicit client consent. We maintain the highest standards of confidentiality in accordance with USPAP (Uniform Standards of Professional Appraisal Practice) guidelines.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  How We Share Information
                </h2>
                <p className="mb-4">We may share your information with:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Authorized parties as required for appraisal services (lenders, attorneys, etc.)</li>
                  <li>Third-party service providers (cloud storage, payment processors, CRM systems)</li>
                  <li>Professional service providers (accountants, legal counsel) when necessary</li>
                  <li>Regulatory authorities when required by law</li>
                  <li>MLS systems for comparative market analysis (in accordance with MLS rules)</li>
                </ul>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  Third-Party Services
                </h2>
                <p className="mb-4">We work with the following types of third-party services:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li><strong>Google Workspace:</strong> Email and document storage</li>
                  <li><strong>Payment Processors:</strong> Stripe for secure payment processing</li>
                  <li><strong>Cloud Storage:</strong> Secure image and document hosting</li>
                  <li><strong>Analytics:</strong> Google Analytics for website performance</li>
                  <li><strong>Booking Platforms:</strong> Scheduling and appointment management</li>
                </ul>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  Cookies and Tracking
                </h2>
                <p className="mb-4">
                  Our website uses cookies and tracking technologies for analytics, user preferences, and site functionality:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Google Analytics:</strong> We use Google Analytics to understand website usage patterns and improve user experience</li>
                  <li><strong>Microsoft Clarity:</strong> We use Microsoft Clarity to analyze user behavior through session recordings and heatmaps to improve website usability and user experience</li>
                  <li><strong>Essential Cookies:</strong> Required for basic website functionality and security</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p className="mb-6">
                  You can opt out of cookies through your browser settings or by using cookie preference tools. Note that disabling certain cookies may affect website functionality.
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  Data Storage and Protection
                </h2>
                <ul className="list-disc pl-6 mb-6">
                  <li>All personal data is protected with industry-standard encryption</li>
                  <li>Property images are stored in secure, password-protected cloud systems</li>
                  <li>Client records are retained for 7 years as required by appraisal regulations</li>
                  <li>Access to client data is limited to authorized personnel only</li>
                  <li>Regular security audits and updates are performed</li>
                </ul>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  Your Rights
                </h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Access, correct, or delete your personal information</li>
                  <li>Withdraw consent for future use of your property in our portfolio</li>
                  <li>Request copies of data we hold about you</li>
                  <li>Opt out of marketing communications</li>
                  <li>File a complaint with relevant authorities</li>
                </ul>
                <p className="mb-6">
                  To exercise these rights, contact us at{" "}
                  <a href="mailto:info@njreap.com?subject=[NJREAP] Data Request" className="text-[#4d0a97] hover:underline">
                    info@njreap.com
                  </a>
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  Children's Privacy
                </h2>
                <p className="mb-6">
                  Our services are not intended for individuals under 13 years of age. 
                  We do not knowingly collect personal information from children under 13.
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  State Privacy Rights
                </h2>
                <p className="mb-4">
                  Residents of certain states (California, Colorado, Connecticut, Delaware, Florida, 
                  Indiana, Iowa, Montana, Oregon, Tennessee, Texas, Utah, and Virginia) have additional rights regarding their personal information.
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  Policy Updates
                </h2>
                <p className="mb-6">
                  We may update this privacy policy periodically. Users will be notified of material 
                  changes via email or website notice. Please review this policy regularly for updates.
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  Contact Information
                </h2>
                <p className="mb-4">
                  For questions about this privacy policy or to exercise your privacy rights, contact us:
                </p>
                <ul className="list-none mb-6">
                  <li><strong>Email:</strong> <a href="mailto:info@njreap.com?subject=%5BNJREAP%5D%20Request%20for%20Information" className="text-[#4d0a97] hover:underline obfuscated-email"></a></li>
                  <li><strong>Phone:</strong> <a href="tel:+19084378505" className="text-[#4d0a97] hover:underline obfuscated-phone"></a></li>
                  <li><strong>Contact Form:</strong> <a href="/contact" className="text-[#4d0a97] hover:underline">njreap.com/contact</a></li>
                </ul>

                <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Last Updated:</strong> June 18, 2025
                  </p>
                  <p className="text-sm text-gray-600">
                    This privacy policy reflects our commitment to transparency and data protection. 
                    For immediate assistance with privacy-related questions, please contact us directly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
