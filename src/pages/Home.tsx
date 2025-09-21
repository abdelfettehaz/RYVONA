import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTshirt, FaPaintBrush, FaTruck, FaMedal, FaStar,
  FaCog, FaFacebookF, FaTiktok, FaInstagram,
  FaArrowRight, FaHeart
} from 'react-icons/fa';

import { motion, useAnimation, useInView } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Home: React.FC = () => {
  const [counters, setCounters] = useState({
    projects: 0,
    customers: 0,
    guarantee: 0,
    experts: 0
  });

  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
      animateCounters();
    }
  }, [isInView, controls]);

  const animateCounters = () => {
    const targets = { projects: 1250, customers: 2000, guarantee: 99, experts: 150 };
    const duration = 2000;
    const steps = 100;
    const stepValue = Object.keys(targets).reduce((acc, key) => {
      acc[key] = targets[key as keyof typeof targets] / steps;
      return acc;
    }, {} as any);

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setCounters({
        projects: Math.min(Math.round(stepValue.projects * currentStep), targets.projects),
        customers: Math.min(Math.round(stepValue.customers * currentStep), targets.customers),
        guarantee: Math.min(Math.round(stepValue.guarantee * currentStep), targets.guarantee),
        experts: Math.min(Math.round(stepValue.experts * currentStep), targets.experts)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);
  };

  /* const _designs = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
      title: "Vintage Retro Wave",
      description: "Classic retro design with modern twist",
      category: "Vintage",
      price: 29.99,
      likes: 1243,
      isNew: true
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
      title: "Minimalist Geometry",
      description: "Clean and simple design for everyday wear",
      category: "Minimalist",
      price: 24.99,
      likes: 876,
      isNew: false
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
      title: "Urban Street Art",
      description: "Bold and edgy streetwear design",
      category: "Artistic",
      price: 34.99,
      likes: 1567,
      isNew: true
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
      title: "Athletic Performance",
      description: "High-performance sportswear design",
      category: "Sports",
      price: 39.99,
      likes: 2045,
      isNew: false
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1527719327859-c6ce80353573?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
      title: "Abstract Expression",
      description: "Unique artistic expression",
      category: "Artistic",
      price: 27.99,
      likes: 932,
      isNew: true
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
      title: "Summer Vibes",
      description: "Fresh summer collection",
      category: "Trending",
      price: 22.99,
      likes: 1876,
      isNew: false
    }
  ]; */

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Fashion Designer",
      content: "The design tools are incredibly intuitive. I've created my entire collection using this platform and the print quality is exceptional.",
      avatar: "depositphotos_95937072-stock-photo-woman-taking-selfie.jpg",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Streetwear Entrepreneur",
      content: "As a small business owner, this platform has been game-changing. The ability to create professional designs without expensive software is invaluable.",
      avatar: "../istockphoto-1460836430-612x612.jpg",
      rating: 5
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "Graphic Artist",
      content: "I love the creative freedom this platform offers. The templates are great starting points but the customization options are where it really shines.",
      avatar: "positive-carefree-woman-with-curly-hair-dressed-hoodie-smiles-happily-makes-peace-gesture-takes-selfie-urban-place-being-good-mood-after-sport-training-people-emotions-sporty-lifestyle_273609-59906 (1).jpg",
      rating: 4
    }
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-gray-900">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 opacity-95"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-7xl mx-auto px-6 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Design Your Signature Style
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-4xl mx-auto">
            Create stunning custom apparel with our professional design tools. Perfect for fashion brands, artists, and anyone who loves unique style.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/design-studio"
              className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold rounded-full hover:shadow-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <FaPaintBrush className="mr-3" />
              Start Designing Now
            </Link>
            <Link
              to="/Gallery"
              className="flex items-center justify-center px-8 py-4 bg-white/10 text-white border border-white/20 font-semibold rounded-full hover:bg-white/20 transition-all"
            >
              Explore Gallery
              <FaArrowRight className="ml-3" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Brands Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-500 mb-8">Trusted by leading brands worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
            {['Nike', 'Adidas', 'Supreme', 'Gucci', 'Puma', 'Levi\'s'].map((brand, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-2xl font-bold text-gray-700"
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Designs */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                Trending Designs
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most popular designs created by talented artists worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
                  alt="Vintage Retro Wave" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  NEW
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <div>
                    <h3 className="text-white text-xl font-bold mb-1">Vintage Retro Wave</h3>
                    <p className="text-gray-200 mb-3">Classic retro design with modern twist</p>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">$29.99</span>
                      <div className="flex items-center text-yellow-400">
                        <FaHeart className="mr-1" />
                        <span className="text-white">1243</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
                  alt="Minimalist Geometry" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <div>
                    <h3 className="text-white text-xl font-bold mb-1">Minimalist Geometry</h3>
                    <p className="text-gray-200 mb-3">Clean and simple design for everyday wear</p>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">$24.99</span>
                      <div className="flex items-center text-yellow-400">
                        <FaHeart className="mr-1" />
                        <span className="text-white">876</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
                  alt="Urban Street Art" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  NEW
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <div>
                    <h3 className="text-white text-xl font-bold mb-1">Urban Street Art</h3>
                    <p className="text-gray-200 mb-3">Bold and edgy streetwear design</p>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">$34.99</span>
                      <div className="flex items-center text-yellow-400">
                        <FaHeart className="mr-1" />
                        <span className="text-white">1567</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
                  alt="Athletic Performance" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <div>
                    <h3 className="text-white text-xl font-bold mb-1">Athletic Performance</h3>
                    <p className="text-gray-200 mb-3">High-performance sportswear design</p>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">$39.99</span>
                      <div className="flex items-center text-yellow-400">
                        <FaHeart className="mr-1" />
                        <span className="text-white">2045</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1527719327859-c6ce80353573?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
                  alt="Abstract Expression" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  NEW
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <div>
                    <h3 className="text-white text-xl font-bold mb-1">Abstract Expression</h3>
                    <p className="text-gray-200 mb-3">Unique artistic expression</p>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">$27.99</span>
                      <div className="flex items-center text-yellow-400">
                        <FaHeart className="mr-1" />
                        <span className="text-white">932</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
                  alt="Summer Vibes" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <div>
                    <h3 className="text-white text-xl font-bold mb-1">Summer Vibes</h3>
                    <p className="text-gray-200 mb-3">Fresh summer collection</p>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">$22.99</span>
                      <div className="flex items-center text-yellow-400">
                        <FaHeart className="mr-1" />
                        <span className="text-white">1876</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design Studio Preview */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
                  Powerful Design Studio
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Our intuitive design tools give you complete creative freedom to bring your vision to life.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Advanced vector editing tools",
                  "Thousands of fonts and graphics",
                  "AI-powered design suggestions",
                  "Collaboration features for teams"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-1 mr-3 text-pink-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/design-studio"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold rounded-full hover:shadow-lg transition-all transform hover:scale-105"
              >
                Try Design Studio
                <FaArrowRight className="ml-2" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
                  alt="Design Studio Preview"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <FaPaintBrush className="text-xl" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Design Saved</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                Why Choose Ryvona?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge technology with premium materials to deliver exceptional products
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaPaintBrush className="text-4xl" />,
                title: "Professional Design Tools",
                description: "Advanced canvas editor with unlimited creative possibilities and real-time previews.",
                color: "text-pink-500"
              },
              {
                icon: <FaTshirt className="text-4xl" />,
                title: "Premium Quality Materials",
                description: "Only the finest fabrics that are soft, durable, and comfortable for everyday wear.",
                color: "text-indigo-500"
              },
              {
                icon: <FaTruck className="text-4xl" />,
                title: "Fast & Reliable Shipping",
                description: "Worldwide delivery with tracking and premium packaging to protect your designs.",
                color: "text-purple-500"
              },
              {
                icon: <FaMedal className="text-4xl" />,
                title: "Sustainable Production",
                description: "Eco-friendly processes and materials that reduce environmental impact.",
                color: "text-green-500"
              },
              {
                icon: <FaStar className="text-4xl" />,
                title: "Artist Community",
                description: "Join a thriving community of designers and get inspired by their creations.",
                color: "text-yellow-500"
              },
              {
                icon: <FaCog className="text-4xl" />,
                title: "Custom Solutions",
                description: "Bulk orders and custom solutions for businesses and organizations.",
                color: "text-blue-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className={`w-16 h-16 rounded-xl ${feature.color} bg-opacity-10 flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                What Our Customers Say
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied customers who trust our platform
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Swiper
              spaceBetween={30}
              centeredSlides={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
              }}
              navigation={true}
              modules={[Autoplay, Pagination, Navigation]}
              className="mySwiper pb-12"
            >
              {testimonials.map((testimonial) => (
                <SwiperSlide key={testimonial.id}>
                  <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
                    <div className="flex items-center mb-6">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h4 className="font-bold text-lg">{testimonial.name}</h4>
                        <p className="text-gray-500">{testimonial.role}</p>
                      </div>
                      <div className="ml-auto flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < testimonial.rating ? "text-yellow-400" : "text-gray-300"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg italic">"{testimonial.content}"</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={ref} className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            animate={controls}
            variants={staggerContainer}
            className="grid md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: counters.projects, label: "Projects Completed", suffix: "+" },
              { value: counters.customers, label: "Happy Customers", suffix: "+" },
              { value: counters.guarantee, label: "Satisfaction Guarantee", suffix: "%" },
              { value: counters.experts, label: "Design Experts", suffix: "+" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="p-6"
              >
                <div className="text-5xl font-bold mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <p className="text-xl opacity-90">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Create Something Amazing?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Join our community of designers and start bringing your creative visions to life today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/Gallery"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-semibold rounded-full hover:shadow-xl transition-all transform hover:scale-105 shadow-lg"
              >
                See Gallery
              </Link>
              <Link
                to="/Templates"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all"
              >
                See Templates
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            {/* Branding */}
            <div className="mb-8 md:mb-0">
              <Link to="/" className="flex items-center">
                <FaTshirt className="text-2xl text-indigo-400 mr-2" />
                <span className="text-xl font-bold">RyVona</span>
              </Link>
              <p className="text-gray-400 mt-2 max-w-xs">
                Creative design and printing solutions
              </p>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><Link to="/about" className="text-gray-400 hover:text-white">About</Link></li>
                  <li><Link to="/career" className="text-gray-400 hover:text-white">Journey</Link></li>
                  <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy</Link></li>
                  <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms</Link></li>
                  <li><Link to="/rules" className="text-gray-400 hover:text-white">Rules</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
                <ul className="space-y-2">
                  <li className="text-gray-400">ryvona-support@gmail.com</li>
                  <li className="text-gray-400">+216 57229597</li>
                  <li className="text-gray-400">+33 57229597</li>
                  <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Form</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} RyVona. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="https://www.facebook.com/profile.php?id=61579287251775" className="text-gray-500 hover:text-white">
                <FaFacebookF />
              </a>
              <a href="https://www.instagram.com/ryvona_store" className="text-gray-500 hover:text-white">
                <FaInstagram />
              </a>
              <a href="https://www.tiktok.com/@ryvona0" className="text-gray-500 hover:text-white fa-brands fa-tiktok">
                <FaTiktok />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Home;
