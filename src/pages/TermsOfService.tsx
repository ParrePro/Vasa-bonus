import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import SEO from "@/components/SEO";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <SEO 
        title="Terms of Service - VasaBonus"
        description="Read the Terms of Service for VasaBonus, the classroom reward platform. Understand your rights and responsibilities when using our service."
        keywords="terms of service, terms and conditions, user agreement, VasaBonus terms"
        canonical="https://vasabonus.se/terms"
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600">Last updated: November 30, 2025</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-8 space-y-8">
              {/* Acceptance */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing or using VasaBonus ("the Service"), you agree to be bound by these Terms of 
                  Service. If you do not agree to these terms, please do not use the Service. These terms 
                  apply to all users, including teachers, students, and administrators.
                </p>
              </section>

              {/* Description of Service */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-700 leading-relaxed">
                  VasaBonus is a classroom reward platform that allows teachers to award points to students 
                  for positive behavior, academic achievements, and participation. Students can use these 
                  points to redeem rewards created by their teachers. The Service is designed for educational 
                  use in schools and classrooms.
                </p>
              </section>

              {/* Account Registration */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Registration</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To use VasaBonus, you must:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Create an account using Google or GitHub authentication</li>
                  <li>Provide accurate and complete information</li>
                  <li>Keep your account credentials secure</li>
                  <li>Be at least 13 years old, or have parental/guardian consent</li>
                  <li>Not share your account with others</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You are responsible for all activities that occur under your account.
                </p>
              </section>

              {/* User Roles */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Roles and Responsibilities</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Teachers</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Create and manage classes</li>
                      <li>Award and deduct points fairly and appropriately</li>
                      <li>Create appropriate rewards for students</li>
                      <li>Ensure student privacy is respected</li>
                      <li>Obtain necessary consents for student participation</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Students</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Join classes with valid join codes</li>
                      <li>Use the platform respectfully</li>
                      <li>Not attempt to manipulate points or rewards</li>
                      <li>Report any issues to teachers</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Acceptable Use */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree NOT to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Use the Service for any illegal purpose</li>
                  <li>Harass, bully, or harm other users</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Create fake accounts or impersonate others</li>
                  <li>Upload malicious content or code</li>
                  <li>Use automated systems to access the Service</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </section>

              {/* Points and Rewards */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Points and Rewards</h2>
                <p className="text-gray-700 leading-relaxed">
                  Points earned on VasaBonus have no monetary value and cannot be exchanged for cash. 
                  Rewards are virtual achievements or classroom privileges defined by teachers. We reserve 
                  the right to reset or adjust points if misuse is detected. Teachers have full discretion 
                  over point awards and reward fulfillment in their classes.
                </p>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
                <p className="text-gray-700 leading-relaxed">
                  The VasaBonus name, logo, design, and all related content are owned by VasaBonus or its 
                  licensors. You may not copy, modify, or distribute any part of the Service without our 
                  written permission. Content you create (class names, reward names, etc.) remains yours, 
                  but you grant us a license to display it within the Service.
                </p>
              </section>

              {/* Privacy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your use of the Service is also governed by our{" "}
                  <a href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</a>, 
                  which explains how we collect, use, and protect your personal data in compliance with 
                  GDPR and Swedish data protection laws.
                </p>
              </section>

              {/* Disclaimers */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers</h2>
                <p className="text-gray-700 leading-relaxed">
                  The Service is provided "as is" without warranties of any kind, express or implied. 
                  We do not guarantee that the Service will be uninterrupted, secure, or error-free. 
                  We are not responsible for any decisions made by teachers regarding point awards or 
                  rewards.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  To the maximum extent permitted by law, VasaBonus shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, or any loss of profits or 
                  revenues. Our total liability shall not exceed the amount you paid us in the 12 months 
                  prior to the claim (if any).
                </p>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
                <p className="text-gray-700 leading-relaxed">
                  You may stop using the Service and delete your account at any time. We may suspend or 
                  terminate your account if you violate these terms or for any other reason at our 
                  discretion. Upon termination, your right to use the Service ends immediately.
                </p>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may modify these Terms of Service at any time. We will notify users of significant 
                  changes by posting a notice on the Service or sending an email. Your continued use of 
                  the Service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms of Service are governed by the laws of Sweden. Any disputes shall be 
                  resolved in the courts of Stockholm, Sweden, unless otherwise required by applicable 
                  consumer protection laws.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about these Terms of Service, contact us:
                </p>
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <p className="text-gray-700"><strong>Email:</strong> support@vasabonus.se</p>
                  <p className="text-gray-700"><strong>Website:</strong> vasabonus.se/contact</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
