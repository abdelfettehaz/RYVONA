// File: TermsOfService.tsx
import React from "react";

type TProps = { contactEmail?: string };

export const TermsOfServicePage: React.FC<TProps> = ({
  contactEmail = "support@ryvona.com",
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Ryvona Terms of Service</h1>
            <p className="mt-2 text-indigo-100">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="p-8 space-y-8">
            <section className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  Welcome to <strong className="text-indigo-600">Ryvona</strong>. These Terms govern your use of our design,
                  printing, and e-commerce services. By accessing or using our platform, you agree to these Terms.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                Account Responsibilities
              </h2>
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <ul className="space-y-3 list-disc pl-5 text-gray-700">
                  <li>You must be at least 12 years old to use Ryvona</li>
                  <li>Provide accurate and current registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>You are responsible for all activities under your account</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                User Content
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-green-800">You Retain Ownership</h3>
                  <p className="text-gray-700 mt-2">
                    You keep all rights to your original designs while granting Ryvona a license to process and print them.
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-red-800">Prohibited Content</h3>
                  <ul className="space-y-2 list-disc pl-5 text-gray-700 mt-2">
                    <li>Illegal or infringing material</li>
                    <li>Adult or sexually explicit content</li>
                    <li>Hate speech or harassment</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                Purchases & Payments
              </h2>
              <div className="bg-purple-50 p-4 rounded-lg">
                <ul className="space-y-3 list-disc pl-5 text-gray-700">
                  <li>All prices are in USD unless specified otherwise</li>
                  <li>Payment is required at time of purchase</li>
                  <li>Sales tax will be added where applicable</li>
                  <li>Ryvona may refuse any order at our discretion</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                Shipping & Returns
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800">Shipping Policy</h3>
                  <ul className="space-y-2 list-disc pl-5 text-gray-700 mt-2">
                    <li>Processing time: 3-5 business days</li>
                    <li>Shipping times vary by destination</li>
                    <li>Tracking information provided</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-orange-800">Returns</h3>
                  <ul className="space-y-2 list-disc pl-5 text-gray-700 mt-2">
                    <li>14-day return window for defective items</li>
                    <li>Customer pays return shipping</li>
                    <li>Refund issued upon receipt and inspection</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                Intellectual Property
              </h2>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  The Ryvona platform, including all software, designs, and branding, is protected by copyright,
                  trademark, and other intellectual property laws. You may not reproduce, modify, or distribute
                  any part of our Service without express written permission.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                Termination
              </h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  Ryvona may suspend or terminate your account at any time for violations of these Terms.
                  You may terminate your account by contacting support.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                Limitation of Liability
              </h2>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Ryvona shall not be liable for any indirect, incidental, special, or consequential damages
                  resulting from your use of our Service or inability to use our Service.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                Governing Law
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
                  where Ryvona is established, without regard to its conflict of law provisions.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                Contact Information
              </h2>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  For any questions about these Terms:
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