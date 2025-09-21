import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Download, Share2, ArrowRight, Home, ShoppingBag } from 'lucide-react';

interface PaymentSuccessState {
  orderId: string;
  amount: number;
  currency: string;
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<PaymentSuccessState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get order details from navigation state
    const state = location.state as PaymentSuccessState;
    if (state) {
      setOrderDetails(state);
    } else {
      // If no state, redirect to home
      navigate('/');
      return;
    }
    setIsLoading(false);
  }, [location.state, navigate]);

  const handleDownloadReceipt = () => {
    // In real app, this would generate and download a PDF receipt
    console.log('Downloading receipt for order:', orderDetails?.orderId);
    alert('Receipt download started!');
  };

  const handleShareOrder = () => {
    // In real app, this would open share dialog
    const shareText = `I just ordered a custom Ryvona! Order ID: ${orderDetails?.orderId}`;
    if (navigator.share) {
      navigator.share({
        title: 'My Custom T-Shirt Order',
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Order details copied to clipboard!');
    }
  };

  const currencySymbols = {
    EUR: '€',
    USD: '$',
    TND: 'د.ت'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16">
      {/* Success Header */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Payment Successful!
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Thank you for your order! Your payment has been processed successfully and your order is being prepared.
          </p>
        </div>
      </section>

      {/* Order Details */}
      <section className="py-16">
        <div className="container mx-auto px-4 py-8 mt-24">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Confirmation</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Order Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono font-medium text-gray-900">{orderDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-bold text-lg text-gray-900">
                      {currencySymbols[orderDetails.currency as keyof typeof currencySymbols]}{orderDetails.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Paid
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order Confirmation</p>
                      <p className="text-sm text-gray-600">You'll receive an email confirmation shortly</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Design Review</p>
                      <p className="text-sm text-gray-600">Our team will review your design within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Production & Shipping</p>
                      <p className="text-sm text-gray-600">Your order will be produced and shipped within 5-7 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              <Download size={20} />
              <span>Download Receipt</span>
            </button>
            
            <button
              onClick={handleShareOrder}
              className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              <Share2 size={20} />
              <span>Share Order</span>
            </button>
            
            <Link
              to="/orders"
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <ShoppingBag size={20} />
              <span>View Orders</span>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">What would you like to do next?</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/design-studio"
                className="group p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <ArrowRight size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Create Another Design</p>
                    <p className="text-sm text-gray-600">Start a new project</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/templates"
                className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors">
                    <ArrowRight size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Browse Templates</p>
                    <p className="text-sm text-gray-600">Find inspiration</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/gallery"
                className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-700 transition-colors">
                    <ArrowRight size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">View Gallery</p>
                    <p className="text-sm text-gray-600">See community designs</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/"
                className="group p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center group-hover:bg-orange-700 transition-colors">
                    <Home size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Go Home</p>
                    <p className="text-sm text-gray-600">Back to homepage</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Our support team is here to help with any questions about your order
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Contact Support
            </Link>
            <a
              href="mailto:support@tshirtdesigner.com"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentSuccess; 