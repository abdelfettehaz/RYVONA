// File: PrivacyPolicy.tsx
import React from "react";

type Props = { contactEmail?: string };

export const PrivacyPolicyPage: React.FC<Props> = ({
  contactEmail = "support@ryvona.com",
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Ryvona Privacy Policy</h1>
            <p className="mt-2 text-indigo-100">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="p-8 space-y-8">
            <section className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-indigo-600">Ryvona</strong> ("we", "us", "our") operates the website and services
                that allow users to create and place designs on apparel, generate images using AI tools,
                purchase printed products, and contact administrators via our support features.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                Information We Collect
              </h2>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-indigo-800">Personal Data:</h3>
                <ul className="space-y-2 list-disc pl-5 text-gray-700 mt-2">
                  <li>Account information (name, email, password)</li>
                  <li>Payment and shipping details</li>
                  <li>Designs and images you upload or generate</li>
                  <li>Communication history with our support team</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                How We Use Your Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-indigo-800">Service Operations</h3>
                  <ul className="space-y-2 list-disc pl-5 text-gray-700 mt-2">
                    <li>Process and fulfill your orders</li>
                    <li>Provide customer support</li>
                    <li>Improve our products and services</li>
                  </ul>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-indigo-800">Legal Compliance</h3>
                  <ul className="space-y-2 list-disc pl-5 text-gray-700 mt-2">
                    <li>Prevent fraudulent activity</li>
                    <li>Comply with legal obligations</li>
                    <li>Enforce our terms and policies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                Content Guidelines
              </h2>
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                <h3 className="text-lg font-medium text-red-800">Prohibited Content</h3>
                <ul className="space-y-2 list-disc pl-5 text-gray-700 mt-2">
                  <li>Adult, pornographic, or explicit sexual content</li>
                  <li>Content that exploits or endangers minors</li>
                  <li>Hate speech, harassment, or violent content</li>
                  <li>Infringement of intellectual property rights</li>
                </ul>
              </div>
              <p className="text-gray-700 mt-4">
                Ryvona reserves the right to refuse any content that violates these guidelines or that we deem inappropriate.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                Data Security
              </h2>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <h3 className="text-lg font-medium text-green-800">Our Protections</h3>
                <ul className="space-y-2 list-disc pl-5 text-gray-700 mt-2">
                  <li>Encryption of sensitive data</li>
                  <li>Regular security audits</li>
                  <li>Limited access to personal information</li>
                </ul>
              </div>
              <p className="text-gray-700 mt-4">
                While we implement strong security measures, no system is 100% secure. Please protect your account credentials.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                Your Rights
              </h2>
              <div className="bg-purple-50 p-4 rounded-lg">
                <ul className="space-y-3 list-disc pl-5 text-gray-700">
                  <li>Request correction of inaccurate information</li>
                  <li>Delete your account and personal data</li>
                  <li>Object to certain processing activities</li>
                </ul>
              </div>
              <p className="text-gray-700 mt-4">
                To exercise these rights, contact us at{" "}
                <a href={`mailto:${contactEmail}`} className="text-indigo-600 hover:underline font-medium">
                  {contactEmail}
                </a>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                Contact Ryvona
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  For any privacy-related concerns or questions:
                </p>
                <p className="mt-2 text-indigo-600 font-medium">
                  Email: <a href={`mailto:${contactEmail}`} className="hover:underline">{contactEmail}</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};