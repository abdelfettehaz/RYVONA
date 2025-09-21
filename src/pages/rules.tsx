// File: CommunityRules.tsx

export const CommunityRulesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Ryvona Community Rules</h1>
            <p className="mt-2 text-indigo-100">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="p-8 space-y-8">
            {/* Introduction */}
            <section className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-gray-700">
                  These rules apply to all interactions on Ryvona - including designs, AI generations, and communications.
                  Violations may result in content removal, account suspension, or legal action.
                </p>
              </div>
            </section>

            {/* Communication Rules */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                ⚠️ Admin Communication Rules
              </h2>
              
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                <h3 className="text-lg font-medium text-red-800">Strictly Prohibited:</h3>
                <ul className="space-y-3 list-disc pl-5 text-gray-700 mt-2">
                  <li>
                    <strong>Profanity/Slurs:</strong> No swear words, racial slurs, or hate speech in messages
                  </li>
                  <li>
                    <strong>Harassment:</strong> No threats, bullying, or sexual advances toward staff
                  </li>
                  <li>
                    <strong>Spam:</strong> No repeated unsolicited messages
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800">✅ Appropriate Use:</h3>
                <ul className="space-y-2 list-disc pl-5 text-gray-700 mt-2">
                  <li>Order inquiries</li>
                  <li>Design assistance requests</li>
                  <li>Technical support questions</li>
                  <li>Policy clarification</li>
                </ul>
              </div>

              <p className="text-gray-600 text-sm">
                <strong>Note:</strong> Our support team will immediately terminate conversations that violate these rules.
              </p>
            </section>

            {/* AI Generation Rules */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                🖼️ AI Image Generation Rules
              </h2>

              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                <h3 className="text-lg font-medium text-red-800">Banned Content:</h3>
                <ul className="space-y-3 list-disc pl-5 text-gray-700 mt-2">
                  <li>
                    <strong>Sexual Content:</strong> No nudity, sexual acts, or suggestive poses
                  </li>
                  <li>
                    <strong>Violence:</strong> No graphic violence, gore, or weapons
                  </li>
                  <li>
                    <strong>Illegal Activity:</strong> No drug use, criminal behavior, or CSAM
                  </li>
                  <li>
                    <strong>Hate Symbols:</strong> No racist, sexist, or discriminatory imagery
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-lg font-medium text-yellow-800">⚠️ Automatic Filters:</h3>
                <p className="text-gray-700 mt-2">
                  Our system automatically blocks generation attempts containing:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2 text-gray-700">
                  <li>Sexual terms (e.g., "nude", "nsfw")</li>
                  <li>Violent terms (e.g., "gore", "kill")</li>
                  <li>Hate speech keywords</li>
                </ul>
              </div>
            </section>

            {/* Printing Restrictions */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                🚫 Printing Prohibitions
              </h2>

              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-red-800">We Will Not Print:</h3>
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <h4 className="font-medium text-gray-800">Content Type</h4>
                    <ul className="list-disc pl-5 space-y-2 mt-2 text-gray-700">
                      <li>Swear words/text</li>
                      <li>Sexual imagery</li>
                      <li>Drug references</li>
                      <li>Hate symbols</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Examples</h4>
                    <ul className="list-disc pl-5 space-y-2 mt-2 text-gray-700">
                      <li>F***, B****, etc.</li>
                      <li>Nudity/sexual poses</li>
                      <li>Marijuana leaves</li>
                      <li>Swastikas, KKK imagery</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800">Moderation Process:</h3>
                <ol className="list-decimal pl-5 space-y-3 mt-2 text-gray-700">
                  <li>Automated scan for banned keywords/imagery</li>
                  <li>Human review by our moderation team</li>
                  <li>Order cancellation if violations are found</li>
                  <li>Repeat offenders may face account suspension</li>
                </ol>
              </div>
            </section>

            {/* Consequences */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                ⚖️ Enforcement Actions
              </h2>

              <div className="bg-gray-100 p-4 rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Violation</th>
                      <th className="text-left py-2">First Offense</th>
                      <th className="text-left py-2">Repeat Offense</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3">Inappropriate Messages</td>
                      <td className="py-3">Warning + 7-day chat ban</td>
                      <td className="py-3">Permanent chat ban</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">Banned AI Generations</td>
                      <td className="py-3">24-hour generation suspension</td>
                      <td className="py-3">Permanent generation access removal</td>
                    </tr>
                    <tr>
                      <td className="py-3">Prohibited Print Content</td>
                      <td className="py-3">Order cancellation + warning</td>
                      <td className="py-3">Account suspension</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Appeal Process */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200">
                🛡️ Appeal Process
              </h2>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  If you believe your content was wrongly flagged:
                </p>
                <ol className="list-decimal pl-5 space-y-2 mt-2 text-gray-700">
                  <li>Email <strong>appeals@ryvona.com</strong> within 7 days</li>
                  <li>Include your order/user ID</li>
                  <li>Provide explanation/evidence</li>
                </ol>
                <p className="text-gray-700 mt-3">
                  We review appeals within 3-5 business days.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};