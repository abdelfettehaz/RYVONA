import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  popular: boolean;
}

const Pricing: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<'EUR' | 'USD' | 'TND'>('EUR');

  const currencySymbols = {
    EUR: '€',
    USD: '$',
    TND: 'د.ت'
  };

  const exchangeRates = {
    EUR: { EUR: 1, USD: 1.1, TND: 3.4 },
    USD: { EUR: 0.91, USD: 1, TND: 3.1 },
    TND: { EUR: 0.29, USD: 0.32, TND: 1 }
  };

  const pricingPlans: PricingPlan[] = [
    {
      id: 'single-view',
      name: 'Single View',
      price: 13.99,
      currency: 'EUR',
      description: 'Perfect for one design on a single t-shirt view',
      features: [
        '1 Design on front view',
        'Basic customization',
        'Standard support',
        'PNG format download',
        '72h turnaround time'
      ],
      popular: false
    },
    {
      id: 'double-view',
      name: 'Double View',
      price: 15.99,
      currency: 'EUR',
      description: 'Two designs on different t-shirt views',
      features: [
        '2 Designs (front + back)',
        'Basic customization',
        'Standard support',
        'PNG format download',
        'Vector file option',
        '48h turnaround time'
      ],
      popular: true
    },
    {
      id: 'triple-view',
      name: 'Triple View',
      price: 17.99,
      currency: 'EUR',
      description: 'Three designs on different t-shirt views',
      features: [
        '3 Designs (front + back + sleeve)',
        'Advanced customization',
        'Priority support',
        'Multiple format options',
        'Vector files included',
        '24h turnaround time'
      ],
      popular: false
    },
    {
      id: 'quad-view',
      name: 'Quad View',
      price: 19.99,
      currency: 'EUR',
      description: 'Complete package with four t-shirt views',
      features: [
        '4 Designs (front + back + both sleeves)',
        'Full customization',
        'Priority support',
        'All file formats',
        'Source files included',
        '12h turnaround time',
        'Unlimited revisions'
      ],
      popular: false
    },
    {
      id: 'complete-package',
      name: 'Complete Package',
      price: 22.99,
      currency: 'EUR',
      description: 'Everything included after completing 4 views',
      features: [
        'All 4 views completed',
        'Full customization',
        '24/7 premium support',
        'All file formats',
        'Source files included',
        '6h turnaround time',
        'Unlimited revisions',
        'Additional mockups',
        'Commercial license'
      ],
      popular: false
    }
  ];

  const getConvertedPrice = (price: number, fromCurrency: string, toCurrency: string) => {
    const rate = (exchangeRates as any)[fromCurrency][toCurrency];
    return Math.round(price * rate * 100) / 100;
  };

  // const _handlePlanSelection = async (plan: PricingPlan) => {
  //   try {
  //     const convertedPrice = getConvertedPrice(plan.price, plan.currency, selectedCurrency);
  //     const paymentUrl = `/payment?service=${encodeURIComponent(plan.name)}&price=${convertedPrice}&currency=${selectedCurrency}`;
  //     window.location.href = paymentUrl;
  //   } catch (error) {
  //     console.error('Error selecting plan:', error);
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ryvona Packages
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Choose the perfect package based on how many t-shirt views you need designed.
            Premium quality designs with fast turnaround times.
          </p>
          
          {/* Currency Selector */}
          <div className="inline-flex bg-white/20 backdrop-blur-sm rounded-full p-2">
            {(['EUR', 'USD', 'TND'] as const).map((currency) => (
              <button
                key={currency}
                onClick={() => setSelectedCurrency(currency)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCurrency === currency
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {currency} ({currencySymbols[currency]})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => {
              const convertedPrice = getConvertedPrice(plan.price, plan.currency, selectedCurrency);
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    plan.popular ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                        <Star size={16} className="mr-1" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">
                        {currencySymbols[selectedCurrency]}
                      </span>
                      <span className="text-6xl font-bold text-gray-900">
                        {convertedPrice}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
    <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
    <p className="text-gray-600 mb-6">Sorry, the page you are looking for does not exist.</p>
    <a href="/" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Go Home</a>
  </div>
);

export default Pricing;