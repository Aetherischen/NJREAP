import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";

const TermsOfService = () => {
  // SEO optimization
  useSEO({
    title: "Terms of Service | NJREAP - Legal Terms & Conditions",
    description: "Review NJREAP's terms of service for our real estate appraisal and photography services. Understand your rights and responsibilities when using our services.",
    keywords: "terms of service, legal terms, NJREAP terms, real estate appraisal terms, service conditions",
    canonical: "https://njreap.com/terms-of-service",
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
              Legal
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-100 leading-relaxed">
              New Jersey Real Estate Appraisals and Photography LLC
            </p>
            <p className="text-lg text-gray-200 mt-2">
              174 Lamington Rd, P.O. Box 421 Oldwick, NJ 08858
            </p>
            <p className="text-sm text-gray-300 mt-4">
              Last modified: June 18, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  1. Acceptance of the Terms of Service
                </h2>
                <p className="mb-6">
                  These Terms of Service are entered into by and between you and
                  New Jersey Real Estate Appraisals and Photography LLC
                  ("Company," "we," "us," or "Firm"). The following terms and
                  conditions, together with any documents they expressly
                  incorporate by reference (collectively, "Terms of Service"),
                  govern your access to and use of njreap.com, including any
                  content, functionality, and services offered on or through
                  njreap.com (the "Website"), whether as a guest or a registered
                  user, as well as your engagement with any services provided by
                  the Firm, including but not limited to Appraisal Services,
                  Virtual Home Tours, Floor Plans, Professional
                  Photography, Real Estate Videography, and Aerial Photography ("Services").
                </p>
                <p className="mb-6">
                  Please read the Terms of Service carefully before you start to
                  use the Website or engage our Services. By using the Website
                  or engaging our Services, you accept and agree to be bound and
                  abide by these Terms of Service and our Privacy Policy, found
                  at njreap.com/legal/privacy, incorporated herein by reference.
                  If you do not want to agree to these Terms of Service or the
                  Privacy Policy, you must not access or use the Website or
                  engage our Services.
                </p>
                <p className="mb-8">
                  This Website and our Services are offered and available only
                  to users who are 13 years of age or older and reside in the
                  United States or any of its territories or possessions. By
                  using this Website or our Services, you represent and warrant
                  that you are of legal age to form a binding contract with the
                  Company and meet all of the foregoing eligibility
                  requirements, including but not limited to those in our
                  Privacy Policy. If you do not meet all of these requirements,
                  you must not access or use the Website or engage our Services.
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  2. Changes to the Terms of Service
                </h2>
                <p className="mb-8">
                  We may revise and update these Terms of Service from time to
                  time in our sole discretion. All changes are effective
                  immediately when we post them and apply to all access to and
                  use of the Website and Services thereafter. Your continued use
                  of the Website or Services following the posting of revised
                  Terms of Service means that you accept and agree to the
                  changes. You are expected to check this page each time you
                  access this Website or engage our Services so you are aware of
                  any changes, as they are binding on you.
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  3. Accessing the Website and Account Security
                </h2>
                <p className="mb-4">
                  We reserve the right to withdraw or amend this Website, and
                  any service or material we provide on the Website, in our sole
                  discretion without notice. We will not be liable if for any
                  reason all or any part of the Website is unavailable at any
                  time or for any period. From time to time, we may restrict
                  user access, including registered user access, to some parts
                  of the Website or the entire Website.
                </p>
                <p className="mb-4">You are responsible for both:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>
                    Making all arrangements necessary for you to have access to
                    the Website.
                  </li>
                  <li>
                    Ensuring that all persons who access the Website through
                    your internet connection are aware of these Terms of Service
                    and comply with them.
                  </li>
                </ul>
                <p className="mb-8">
                  To access the Website or some of the resources it offers, you
                  may be asked to provide certain registration details or other
                  information. It is a condition of your use of the Website that
                  all the information you provide on the Website is correct,
                  current, and complete. You agree that all information you
                  provide to register with this Website or otherwise, including,
                  but not limited to, through the use of any interactive
                  features on the Website, is governed by our Privacy Policy
                  njreap.com/legal/privacy, and you consent to all actions we
                  take with respect to your information consistent with our
                  Privacy Policy.
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  4. Intellectual Property Rights
                </h2>
                <p className="mb-4">
                  The Website and its entire contents, features, and
                  functionality (including but not limited to all information,
                  software, text, displays, images, video, and audio, and the
                  design, selection, and arrangement thereof) are owned by the
                  Company, its licensors, or other providers of such material
                  and are protected by United States and international
                  copyright, trademark, patent, trade secret, and other
                  intellectual property or proprietary rights laws.
                </p>
                <p className="mb-4">
                  These Terms of Service permit you to use the Website for your
                  personal, non-commercial use only. You must not reproduce,
                  distribute, modify, create derivative works of, publicly
                  display, publicly perform, republish, download, store, or
                  transmit any of the material on our Website, except as
                  follows:
                </p>
                <ul className="list-disc pl-6 mb-8">
                  <li>
                    Your computer may temporarily store copies of such materials
                    in RAM incidental to your accessing and viewing those
                    materials.
                  </li>
                  <li>
                    You may store files that are automatically cached by your
                    Web browser for display enhancement purposes.
                  </li>
                  <li>
                    You may print or download one copy of a reasonable number of
                    pages of the Website for your own personal, non-commercial
                    use and not for further reproduction, publication, or
                    distribution.
                  </li>
                  <li>
                    If we provide desktop, mobile, or other applications for
                    download, you may download a single copy to your computer or
                    mobile device solely for your own personal, non-commercial
                    use, provided you agree to be bound by our end user license
                    agreement for such applications.
                  </li>
                </ul>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  5. Trademarks
                </h2>
                <p className="mb-8">
                  The Company name, the term NJREAP, the Company logo, and all
                  related names, logos, product and service names, designs, and
                  slogans are trademarks of the Company or its affiliates or
                  licensors. You must not use such marks without the prior
                  written permission of the Company. All other names, logos,
                  product and service names, designs, and slogans on this
                  Website are the trademarks of their respective owners.
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  6. Prohibited Uses
                </h2>
                <p className="mb-4">
                  You may use the Website only for lawful purposes and in
                  accordance with these Terms of Service. You agree not to use
                  the Website:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>
                    In any way that violates any applicable federal, state,
                    local, or international law or regulation.
                  </li>
                  <li>
                    For the purpose of exploiting, harming, or attempting to
                    exploit or harm minors in any way.
                  </li>
                  <li>
                    To send, knowingly receive, upload, download, use, or re-use
                    any material that does not comply with the Content
                    Standards.
                  </li>
                  <li>
                    To transmit, or procure the sending of, any advertising or
                    promotional material, including any "junk mail," "chain
                    letter," "spam," or any other similar solicitation.
                  </li>
                  <li>
                    To impersonate or attempt to impersonate the Company, a
                    Company employee, another user, or any other person or
                    entity.
                  </li>
                </ul>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  7. User Contributions
                </h2>
                <p className="mb-6">
                  The Website may contain message boards, chat rooms, personal
                  web pages or profiles, forums, bulletin boards, and other
                  interactive features (collectively, "Interactive Services")
                  that allow users to post, submit, publish, display, or
                  transmit to other users or other persons (hereinafter, "post")
                  content or materials (collectively, "User Contributions") on
                  or through the Website.
                </p>
                <p className="mb-8">
                  All User Contributions must comply with the Content Standards
                  set out in these Terms of Service. Any User Contribution you
                  post to the site will be considered non-confidential and
                  non-proprietary. By providing any User Contribution on the
                  Website, you grant us and our affiliates and service
                  providers, and each of their and our respective licensees,
                  successors, and assigns the right to use, reproduce, modify,
                  perform, display, distribute, and otherwise disclose to third
                  parties any such material for any purpose.
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  8. Monitoring and Enforcement; Termination
                </h2>
                <p className="mb-4">We have the right to:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li>
                    Remove or refuse to post any User Contributions for any or
                    no reason in our sole discretion.
                  </li>
                  <li>
                    Take any action with respect to any User Contribution that
                    we deem necessary or appropriate.
                  </li>
                  <li>
                    Disclose your identity or other information about you to any
                    third party who claims that material posted by you violates
                    their rights.
                  </li>
                  <li>
                    Take appropriate legal action, including without limitation,
                    referral to law enforcement, for any illegal or unauthorized
                    use of the Website.
                  </li>
                  <li>
                    Terminate or suspend your access to all or part of the
                    Website for any or no reason.
                  </li>
                </ul>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  9. Content Standards
                </h2>
                <p className="mb-4">
                  These content standards apply to any and all User
                  Contributions and use of Interactive Services. User
                  Contributions must in their entirety comply with all
                  applicable federal, state, local, and international laws and
                  regulations. Without limiting the foregoing, User
                  Contributions must not:
                </p>
                <ul className="list-disc pl-6 mb-8">
                  <li>
                    Contain any material that is defamatory, obscene, indecent,
                    abusive, offensive, harassing, violent, hateful,
                    inflammatory, or otherwise objectionable.
                  </li>
                  <li>
                    Promote sexually explicit or pornographic material,
                    violence, or discrimination.
                  </li>
                  <li>
                    Infringe any patent, trademark, trade secret, copyright, or
                    other intellectual property rights.
                  </li>
                  <li>
                    Violate the legal rights of others or contain any material
                    that could give rise to civil or criminal liability.
                  </li>
                  <li>
                    Promote any illegal activity or advocate any unlawful act.
                  </li>
                </ul>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  10. Scope of Services
                </h2>
                <p className="mb-8">
                  The Firm shall provide to the Client the Services as described
                  in the relevant Client Engagement Letter and/or Services
                  Agreement in accordance with these Terms of Service unless
                  expressly stated otherwise. This includes, but is not limited
                  to, Appraisal Services, Virtual Home Tours, Floor Plans,
                  Professional Photography, Real Estate Videography, and Aerial Photography. Detailed descriptions of each Service,
                  including the scope and specifications thereof, are available
                  in the "Learn More" section under Services for each respective
                  Service on the Firm's website.
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  11. Client's Obligations
                </h2>
                <p className="mb-4">Client shall:</p>
                <ul className="list-disc pl-6 mb-8">
                  <li>
                    Cooperate with Appraiser in all matters relating to the
                    Appraisal Services and provide such access to Client's
                    premises.
                  </li>
                  <li>
                    Respond promptly to any Appraiser request to provide
                    direction, information, approvals, authorizations, or
                    decisions.
                  </li>
                  <li>
                    Provide such Client materials or information as Appraiser
                    may request in a timely manner.
                  </li>
                  <li>
                    Comply with all applicable laws in relation to the Appraisal
                    Services.
                  </li>
                </ul>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  12. Appraiser Independence and Professional Standards
                </h2>
                <p className="mb-8">
                  As required by law and professional standards, all services
                  provided by the Firm are performed independently, impartially,
                  and objectively. The Firm cannot agree to provide results or
                  opinions that are contingent on predetermined amounts or
                  outcomes and cannot ensure that the results will facilitate
                  any specific objective of the Client or others or advance any
                  particular cause.
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  13. Disclaimer of Warranties
                </h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                  <p className="font-semibold text-gray-900">
                    YOUR USE OF THE WEBSITE, ITS CONTENT, AND ANY SERVICES OR
                    ITEMS OBTAINED THROUGH THE WEBSITE IS AT YOUR OWN RISK. THE
                    WEBSITE, ITS CONTENT, AND ANY SERVICES OR ITEMS OBTAINED
                    THROUGH THE WEBSITE ARE PROVIDED ON AN "AS IS" AND "AS
                    AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER
                    EXPRESS OR IMPLIED.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  14. Limitation on Liability
                </h2>
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
                  <p className="font-semibold text-gray-900">
                    TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE
                    MAXIMUM MONETARY LIABILITY OF APPRAISER, FIRM, OR CLIENT TO
                    ONE ANOTHER OR TO ANY THIRD PARTY FOR ANY AND ALL CLAIMS OR
                    CAUSES OF ACTION RELATING TO THE APPRAISAL OR APPRAISAL
                    SERVICES AGREEMENT SHALL BE LIMITED TO THE AMOUNT OF
                    COMPENSATION ACTUALLY RECEIVED BY APPRAISER FROM CLIENT.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  15. Governing Law and Jurisdiction
                </h2>
                <p className="mb-8">
                  All matters relating to the Website, Services, and these Terms
                  of Service, and any dispute or claim arising therefrom or
                  related thereto shall be governed by and construed in
                  accordance with the internal laws of the State of New Jersey.
                  Any legal suit, action, or proceeding arising out of, or
                  related to, these Terms of Service, the Website, or Services
                  shall be instituted exclusively in the federal courts of the
                  United States or the courts of the State of New Jersey, in
                  each case located in the County of Hunterdon.
                </p>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  16. Limitation on Time to File Claims
                </h2>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
                  <p className="font-semibold text-gray-900">
                    ANY CAUSE OF ACTION OR CLAIM YOU MAY HAVE ARISING OUT OF OR
                    RELATING TO THESE TERMS OF SERVICE, THE WEBSITE, OR SERVICES
                    MUST BE COMMENCED WITHIN ONE (1) YEAR AFTER THE CAUSE OF
                    ACTION ACCRUES; OTHERWISE, SUCH CAUSE OF ACTION OR CLAIM IS
                    PERMANENTLY BARRED.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-[#4d0a97] mb-4">
                  17. Contact Information
                </h2>
                <p className="mb-4">
                  This website is operated by the Company. All notices of
                  copyright infringement claims should be sent to the Company
                  through the contact submission at njreap.com/contact. All
                  other feedback, comments, requests for technical support, and
                  other communications relating to the Website or Services
                  should be directed to:{" "}
                  <a
                    href="mailto:info@njreap.com?subject=%5BNJREAP%5D%20Legal%20Inquiry"
                    className="text-[#4d0a97] hover:underline obfuscated-email"
                  >
                  </a>
                  .
                </p>

                <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Last Updated:</strong> June 18, 2025
                  </p>
                  <p className="text-sm text-gray-600">
                    If you have any questions about these Terms of Service,
                    please contact us at{" "}
                    <a
                      href="mailto:info@njreap.com?subject=%5BNJREAP%5D%20Legal%20Inquiry"
                      className="text-[#4d0a97] hover:underline obfuscated-email"
                    >
                    </a>{" "}
                    or through our{" "}
                    <a
                      href="/contact"
                      className="text-[#4d0a97] hover:underline"
                    >
                      contact page
                    </a>
                    .
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

export default TermsOfService;
