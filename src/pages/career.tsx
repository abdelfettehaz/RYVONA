import { FaRocket, FaLeaf, FaUsers, FaLightbulb, FaAward, FaChartLine, FaPalette, FaSmile, FaGlobe } from 'react-icons/fa';

const JourneyPage = () => {
  const milestones = [
    {
      year: "2020",
      title: "Founding Vision",
      description: "Ryvona was born in Tunis with a mission to democratize custom apparel design through technology.",
      icon: <FaLightbulb className="text-yellow-500 text-2xl" />,
      achievements: [
        "Concept development",
        "Initial team formation",
        "First prototype"
      ]
    },
    {
      year: "2021",
      title: "AI Breakthrough",
      description: "Developed our proprietary AI design generator that revolutionized the creative process.",
      icon: <FaRocket className="text-pink-500 text-2xl" />,
      achievements: [
        "Launched beta version",
        "First 1,000 users",
        "Partnership with local designers"
      ]
    },
    {
      year: "2022",
      title: "Sustainable Shift",
      description: "Transitioned to eco-friendly production methods and materials.",
      icon: <FaLeaf className="text-green-500 text-2xl" />,
      achievements: [
        "40% reduction in carbon footprint",
        "Water-based inks adoption",
        "Solar-powered facility"
      ]
    },
    {
      year: "2023",
      title: "Global Expansion",
      description: "Expanded our services internationally with localized support.",
      icon: <FaUsers className="text-blue-500 text-2xl" />,
      achievements: [
        "Serving 50+ countries",
        "Multilingual platform",
        "International design contests"
      ]
    },
    {
      year: "2024",
      title: "Industry Recognition",
      description: "Awarded for innovation in fashion technology and sustainability.",
      icon: <FaAward className="text-purple-500 text-2xl" />,
      achievements: [
        "Best AI Fashion Startup 2024",
        "Eco Excellence Award",
        "Featured in TechCrunch"
      ]
    },
    {
      year: "Future",
      title: "Next Horizons",
      description: "Continuing to push boundaries in AI-driven fashion design.",
      icon: <FaChartLine className="text-indigo-500 text-2xl" />,
      achievements: [
        "3D design integration",
        "AR virtual try-on",
        "Blockchain for design ownership"
      ]
    }
  ];

  const stats = [
    { value: "10K+", label: "Designs Created", icon: <FaPalette className="text-3xl" /> },
    { value: "96%", label: "Customer Satisfaction", icon: <FaSmile className="text-3xl" /> },
    { value: "30+", label: "Countries Served", icon: <FaGlobe className="text-3xl" /> },
    { value: "40%", label: "Carbon Reduction", icon: <FaLeaf className="text-3xl" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-purple-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Our Journey
            </span>
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto">
            From Tunisian startup to global innovator in AI-powered apparel design
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 transform -translate-x-1/2"></div>
          
          {/* Milestones */}
          <div className="space-y-24">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative group">
                {/* Year Marker (Desktop) */}
                <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-indigo-500 text-indigo-600 font-bold absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-lg hover:scale-110 transition-transform duration-300">
                  {milestone.year}
                </div>

                {/* Mobile Year */}
                <div className="md:hidden text-sm font-medium text-gray-500 mb-2 pl-4">
                  {milestone.year}
                </div>

                {/* Content Row - Alternates between left and right */}
                <div className={`flex flex-col md:flex-row ${index % 2 === 0 ? '' : 'md:flex-row-reverse'} gap-8`}>
                  {/* Content Card */}
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-lg h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <div className="flex items-center mb-4">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                          {milestone.icon}
                        </div>
                        <h3 className="text-xl font-bold">{milestone.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{milestone.description}</p>
                      <ul className="space-y-2">
                        {milestone.achievements.map((achievement, i) => (
                          <li key={i} className="flex items-start">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2 mr-2"></span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Image */}
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pl-8' : 'md:pr-8'}`}>
                    <img 
                      src={`pexels-yi-ren-57040649-3184061${index}.jpg`}
                      alt={milestone.title}
                      className="w-full h-64 md:h-80 object-cover rounded-xl shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            By The Numbers
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-xl">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Culture */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
              Our Culture
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Innovation First",
                description: "We encourage experimentation and reward creative problem-solving.",
                icon: <FaLightbulb className="text-3xl text-yellow-500" />
              },
              {
                title: "Sustainable Mindset",
                description: "Every decision considers environmental impact and long-term sustainability.",
                icon: <FaLeaf className="text-3xl text-green-500" />
              },
              {
                title: "Customer-Centric",
                description: "Designers are at the heart of everything we build and improve.",
                icon: <FaUsers className="text-3xl text-blue-500" />
              }
            ].map((value, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl hover:shadow-md transition-shadow duration-300">
                <div className="w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Vision */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Shaping the Future of Fashion Tech
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We're just getting started. Join us as we continue to revolutionize how the world creates and wears custom designs.
          </p>
        </div>
      </section>
    </div>
  );
};

export default JourneyPage;







