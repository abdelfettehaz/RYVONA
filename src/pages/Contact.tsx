import React, { useState } from 'react'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPaperPlane } from 'react-icons/fa'

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus({ type: 'success', message: data.message })
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send message' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 20}%`,
              width: `${60 + i * 10}px`,
              height: `${60 + i * 10}px`,
              background: 'rgba(122, 115, 209, 0.2)',
              borderRadius: '50%',
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + i * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-5 md:grid-cols-1">
              {/* Contact Info Section */}
              <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-purple-600 text-white p-8 lg:p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-purple-600/50 animate-pulse"></div>
                <div className="relative z-10">
                  <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Get in Touch
                  </h2>
                  <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                    We'd love to hear from you. Please fill out this form or shoot us an email. 
                    Our team is always ready to help you with any questions or concerns.
                  </p>

                  {/* Contact Info Items */}
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 group">
                      <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                        <FaMapMarkerAlt className="text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Our Location</h3>
                        <p className="text-blue-100">R377+FGR، Campus Universitaire de, Manouba 2010</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 group">
                      <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                        <FaPhone className="text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Phone Number</h3>
                        <p className="text-blue-100">+216 57 229 597</p>
                        <p className="text-blue-100">+216 21 863 580</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 group">
                      <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                        <FaEnvelope className="text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Email Address</h3>
                        <p className="text-blue-100">ryvona-support@gmail.com</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                    <div className="flex space-x-4">
                      {[
                        { icon: FaFacebookF, href: '#', label: 'Facebook' },
                        { icon: FaTwitter, href: '#', label: 'Twitter' },
                        { icon: FaInstagram, href: '#', label: 'Instagram' },
                        { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' }
                      ].map((social, index) => (
                        <a
                          key={index}
                          href={social.href}
                          className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300"
                          aria-label={social.label}
                        >
                          <social.icon className="text-xl" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form Section */}
              <div className="lg:col-span-3 bg-white/95 backdrop-blur-sm p-8 lg:p-12">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-8 relative">
                  Send us a Message
                  <div className="absolute bottom-0 left-0 w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                </h2>

                {/* Status Messages */}
                {status.type && (
                  <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                    status.type === 'success' 
                      ? 'bg-green-50 border-green-500 text-green-700' 
                      : 'bg-red-50 border-red-500 text-red-700'
                  }`}>
                    {status.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                      placeholder="Enter subject"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
                      placeholder="Enter your message"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact 