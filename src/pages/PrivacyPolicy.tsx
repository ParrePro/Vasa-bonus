import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <SEO 
        title="Privacy Policy - VasaBonus"
        description="Learn how VasaBonus collects, uses, and protects your personal data. We are committed to GDPR compliance and protecting your privacy."
        keywords="privacy policy, GDPR, data protection, VasaBonus privacy"
        canonical="https://vasabonus.se/privacy"
      />
      
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src="/favicon.png" alt="VasaBonus" className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              VasaBonus
            </span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </nav>
      </header>

      {/* Content */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: November 30, 2025</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-8 space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  VasaBonus ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                  explains how we collect, use, disclose, and safeguard your information when you use our 
                  classroom reward platform. We comply with the General Data Protection Regulation (GDPR) 
                  and Swedish data protection laws.
                </p>
              </section>

              {/* Data Controller */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Data Controller</h2>
                <p className="text-gray-700 leading-relaxed">
                  VasaBonus is the data controller for the personal data collected through this platform.
                </p>
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <p className="text-gray-700"><strong>Contact:</strong> privacy@vasabonus.se</p>
                  <p className="text-gray-700"><strong>Location:</strong> Stockholm, Sweden</p>
                </div>
              </section>

              {/* Data We Collect */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data We Collect</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We collect the following types of personal data:
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Account Information</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Email address</li>
                      <li>Full name</li>
                      <li>Profile picture (if provided via Google/GitHub)</li>
                      <li>User role (teacher, student, or developer)</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Usage Data</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Points earned and spent</li>
                      <li>Class memberships</li>
                      <li>Rewards purchased</li>
                      <li>Avatar customization preferences</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Technical Data</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Browser type and version</li>
                      <li>Device information</li>
                      <li>IP address (for security purposes)</li>
                      <li>Cookies and similar technologies</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Data */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Use Your Data</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use your personal data for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Account Management:</strong> To create and manage your account</li>
                  <li><strong>Service Delivery:</strong> To provide the classroom reward features</li>
                  <li><strong>Communication:</strong> To send important updates about your account</li>
                  <li><strong>Security:</strong> To protect against unauthorized access and abuse</li>
                  <li><strong>Improvement:</strong> To analyze usage and improve our service</li>
                </ul>
              </section>

              {/* Legal Basis */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Legal Basis for Processing</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We process your personal data based on:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Contract:</strong> Processing necessary to provide our service</li>
                  <li><strong>Consent:</strong> Where you have given explicit consent</li>
                  <li><strong>Legitimate Interests:</strong> For security and service improvement</li>
                  <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
                </ul>
              </section>

              {/* Data Sharing */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Sharing</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may share your data with:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Teachers:</strong> Your name and points data are visible to your teachers</li>
                  <li><strong>Classmates:</strong> Your name and tier may be visible on class leaderboards</li>
                  <li><strong>Service Providers:</strong> Supabase (database), authentication providers (Google, GitHub)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  We do not sell your personal data to third parties.
                </p>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal data for as long as your account is active. If you delete your 
                  account, we will delete your personal data within 30 days, except where we are required 
                  to retain it for legal purposes.
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Under GDPR, you have the following rights:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900">Right to Access</h3>
                    <p className="text-gray-600 text-sm">Request a copy of your personal data</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900">Right to Rectification</h3>
                    <p className="text-gray-600 text-sm">Correct inaccurate personal data</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900">Right to Erasure</h3>
                    <p className="text-gray-600 text-sm">Request deletion of your data</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900">Right to Portability</h3>
                    <p className="text-gray-600 text-sm">Export your data in a common format</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900">Right to Object</h3>
                    <p className="text-gray-600 text-sm">Object to certain processing activities</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900">Right to Restrict</h3>
                    <p className="text-gray-600 text-sm">Limit how we use your data</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  To exercise these rights, contact us at <strong>privacy@vasabonus.se</strong> or use the 
                  account settings in your dashboard.
                </p>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar technologies to maintain your session and provide our service. 
                  Essential cookies are required for the platform to function. For more details, see our 
                  cookie consent banner when you first visit the site.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  VasaBonus is designed for use in educational settings. Students under 16 should have 
                  parental or guardian consent before using the platform. Teachers and schools are 
                  responsible for ensuring appropriate consent is obtained.
                </p>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Data Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal 
                  data, including encryption in transit (HTTPS), secure authentication, and access controls.
                </p>
              </section>

              {/* Changes */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of significant 
                  changes by posting a notice on our platform or sending you an email.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about this Privacy Policy or wish to exercise your rights, contact us:
                </p>
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <p className="text-gray-700"><strong>Email:</strong> privacy@vasabonus.se</p>
                  <p className="text-gray-700 mt-2">
                    You also have the right to lodge a complaint with the Swedish Authority for Privacy 
                    Protection (IMY) at <a href="https://www.imy.se" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">www.imy.se</a>.
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
