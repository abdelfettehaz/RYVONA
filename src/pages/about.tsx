import { FaMagic, FaRobot, FaUpload, FaUsers, FaGlobe, FaLeaf } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-purple-800 text-white py-24">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
              About Ryvona
            </span>
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto">
            Pioneering the Future of Custom Apparel Design
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Founded in Tunisia with global ambitions, Ryvona is transforming how designers and brands create custom apparel. 
                We combine cutting-edge technology with intuitive design tools to empower creators at every level.
              </p>
              <div className="bg-indigo-50 p-6 rounded-xl border-l-4 border-indigo-500">
                <h3 className="text-xl font-bold mb-3 text-indigo-800">Our Vision</h3>
                <p className="text-gray-700">
                  To make professional-grade design accessible to everyone while maintaining the highest standards of quality and sustainability.
                </p>
              </div>
            </div>
            <div className="lg:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
                alt="Ryvona design team" 
                className="rounded-xl shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Innovations Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
              Our Innovations
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaRobot className="text-3xl text-blue-500" />,
                title: "AI Design Generator",
                desc: "Our proprietary AI helps users create stunning designs in seconds, even without design experience."
              },
              {
                icon: <FaUpload className="text-3xl text-purple-500" />,
                title: "Seamless Upload",
                desc: "Direct import of designs in multiple formats with automatic optimization for printing."
              },
              {
                icon: <FaMagic className="text-3xl text-pink-500" />,
                title: "Smart Enhancement",
                desc: "Automatically improves resolution and prepares designs for perfect printing."
              },
              {
                icon: <FaUsers className="text-3xl text-green-500" />,
                title: "Collaboration Tools",
                desc: "Real-time co-design features for teams and clients."
              },
              {
                icon: <FaGlobe className="text-3xl text-yellow-500" />,
                title: "Global Marketplace",
                desc: "Connect designers with clients worldwide through our platform."
              },
              {
                icon: <FaLeaf className="text-3xl text-teal-500" />,
                title: "Sustainable Practices",
                desc: "Eco-friendly materials and production methods."
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">
            Challenges We've Overcome
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Building a platform that serves both professional designers and first-time creators
          </p>
          
          <div className="space-y-8">
            {[
              {
                title: "Bridging the Design Gap",
                description: "Creating tools simple enough for beginners but powerful enough for professionals required extensive user testing and iterative development."
              },
              {
                title: "Print-Perfect Designs",
                description: "Developing algorithms that automatically optimize designs for different fabrics and printing methods."
              },
              {
                title: "Global Accessibility",
                description: "Ensuring our platform performs well across different devices and internet speeds worldwide."
              }
            ].map((challenge, index) => (
              <div key={index} className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                <p className="text-gray-600">{challenge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Our Milestones
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "10K+",
                label: "Designs Created"
              },
              {
                number: "95%",
                label: "Customer Satisfaction"
              },
              {
                number: "50+",
                label: "Countries Served"
              }
            ].map((milestone, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold mb-2">{milestone.number}</div>
                <div className="text-xl">{milestone.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Experience our powerful design tools today
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/design-studio" 
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
            >
              Start Designing
            </Link>
            <Link
              to="/gallery"
              className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-full hover:bg-indigo-50 transition-all"
            >
              Explore Gallery
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;