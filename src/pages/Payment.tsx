import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CreditCard, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { PaymentInfo } from '../types';
import apiService from '../services/api';

const Payment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState<PaymentInfo>({
    order_id: '',
    service: searchParams.get('service') || '',
    price: parseFloat(searchParams.get('price') || '0'),
    currency: (searchParams.get('currency') as 'EUR' | 'USD' | 'TND') || 'EUR',
    card_number: '',
    expiry: '',
    cvv: '',
    card_name: '',
    billing_address: '',
    city: '',
    postal_code: '',
    country: ''
  });

  const [errors, setErrors] = useState<Partial<PaymentInfo>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [userInfo, setUserInfo] = useState<{ role: string; country: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/payment' } });
      return;
    }

    // Fetch user info first
    const fetchUserInfo = async () => {
      try {
        const userResult = await apiService.getUserInfo();
        if (userResult.success && userResult.user) {
          setUserInfo({
            role: userResult.user.role,
            country: userResult.user.country || ''
          });
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();

    // Generate order ID
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setFormData(prev => ({ ...prev, order_id: orderId }));
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentInfo> = {};

    // Card number validation
    if (!formData.card_number.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.card_number = 'Please enter a valid 16-digit card number';
    }

    // Expiry validation
    if (!formData.expiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiry = 'Please enter expiry in MM/YY format';
    } else {
      const [month, year] = formData.expiry.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(year) < currentYear || 
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiry = 'Card has expired';
      }
    }

    // CVV validation
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    // Required fields
    if (!formData.card_name.trim()) newErrors.card_name = 'Cardholder name is required';
    if (!formData.billing_address.trim()) newErrors.billing_address = 'Billing address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'card_number') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Format expiry date
    if (name === 'expiry') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .substring(0, 5);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[name as keyof PaymentInfo]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDirectSubmission = async () => {
    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to submit orders.');
        return;
      }

      // Convert price to TND if user is Tunisian
      const isTunisian = userInfo?.country?.toLowerCase() === 'tunisia';
      let totalPrice = formData.price;
      
      if (isTunisian) {
        totalPrice = totalPrice * 3.3; // EUR to TND conversion rate
      }

      const response = await fetch('/api/submit-order-for-admin.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ 
          order_id: formData.order_id,
          service: formData.service,
          total_price: totalPrice,
          currency: isTunisian ? 'TND' : 'EUR',
          quantity: 1
        })
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit order');
      }
      
      if (result.success) {
        alert('Order submitted successfully! You will be notified when it is approved.');
        navigate('/orders');
      } else {
        throw new Error(result.message || 'Failed to submit order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert(`Failed to submit order: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is Tunisian and bypass payment
    if (userInfo?.role === 'user' && userInfo?.country?.toLowerCase() === 'tunisia') {
      await handleDirectSubmission();
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await apiService.processPayment(formData);
      
      if (response.success) {
        // Redirect to success page
        navigate('/payment-success', { 
          state: { 
            orderId: formData.order_id,
            amount: formData.price,
            currency: formData.currency
          }
        });
      } else {
        throw new Error(response.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const currencySymbols = {
    EUR: '€',
    USD: '$',
    TND: 'د.ت'
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  // Show special interface for Tunisian users
  if (userInfo?.role === 'user' && userInfo?.country?.toLowerCase() === 'tunisia') {
    const convertedPrice = formData.price * 3.3;
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16">
        <div className="w-full px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🇹🇳 Tunisian User</h1>
              <p className="text-gray-600">Your order will be submitted directly to admin for review</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{formData.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Price:</span>
                  <span className="font-medium">€{formData.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Converted Price:</span>
                  <span className="font-medium text-green-600">د.ت{convertedPrice.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">د.ت{convertedPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleDirectSubmission}
                disabled={isProcessing}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isProcessing ? 'Submitting Order...' : '📩 Submit Order to Admin'}
              </button>
              <p className="text-sm text-gray-500 mt-4">
                No payment required. You will be notified when your order is approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16">
      <div className="w-full px-4 py-8 mt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Secure payment powered by industry-standard encryption</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="card_number"
                      value={formData.card_number}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.card_number ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  {errors.card_number && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.card_number}
                    </p>
                  )}
                </div>

                {/* Card Details Row */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Expiry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.expiry ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.expiry && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.expiry}
                      </p>
                    )}
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.cvv ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.cvv}
                      </p>
                    )}
                  </div>

                  {/* Card Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Type
                    </label>
                    <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="flex space-x-2">
                        <div className="w-8 h-5 bg-blue-600 rounded"></div>
                        <div className="w-8 h-5 bg-red-600 rounded"></div>
                        <div className="w-8 h-5 bg-yellow-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="card_name"
                    value={formData.card_name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.card_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.card_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.card_name}
                    </p>
                  )}
                </div>

                {/* Billing Address */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="billing_address"
                        value={formData.billing_address}
                        onChange={handleInputChange}
                        placeholder="123 Main Street"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.billing_address ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.billing_address && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.billing_address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="New York"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postal_code"
                          value={formData.postal_code}
                          onChange={handleInputChange}
                          placeholder="10001"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.postal_code ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.postal_code && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.postal_code}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.country ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="TN">Tunisia</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.country}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Pay {currencySymbols[formData.currency]}{formData.price}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{formData.service}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-lg">
                    {currencySymbols[formData.currency]}{formData.price}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-medium">{formData.currency}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-sm">{formData.order_id}</span>
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{currencySymbols[formData.currency]}{formData.price}</span>
                </div>
              </div>

              {/* Security Features */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">Secure Payment</span>
                </div>
                <ul className="text-xs text-green-700 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    SSL Encrypted
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    PCI Compliant
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    256-bit Security
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment; 