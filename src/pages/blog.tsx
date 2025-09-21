import { useState } from 'react';
import { FaMagic, FaLeaf, FaTimes, FaArrowRight, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  icon?: React.ReactNode;
  readTime?: string;
  date: string;
  author: string;
  content: string;
  image?: string;
}

const BlogPage = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const featuredPosts = [
    {
      id: 1,
      title: "How Our AI Transforms Text Prompts Into Wearable Art",
      excerpt: "A behind-the-scenes look at Ryvona's AI image generator and how it interprets creative prompts.",
      category: "AI Technology",
      icon: <FaMagic className="text-pink-500 text-2xl" />,
      readTime: "6 min read",
      date: "June 10, 2023",
      author: "Sarah Chen",
      content: `
        <h2 class="text-xl font-bold mb-4">Understanding Our AI Design Process</h2>
        <p class="mb-4">Our proprietary AI system combines natural language processing with generative adversarial networks (GANs) to transform your creative prompts into stunning apparel designs.</p>
        
        <h3 class="font-bold mb-2">The Transformation Process:</h3>
        <ol class="list-decimal pl-5 mb-4 space-y-2">
          <li><strong>Text Analysis:</strong> Our NLP engine extracts key design elements (colors, themes, styles) from your prompt</li>
          <li><strong>Style Matching:</strong> Compares against our database of 10,000+ design patterns</li>
          <li><strong>Image Generation:</strong> Creates multiple design variations using GAN technology</li>
          <li><strong>Print Optimization:</strong> Automatically adjusts resolution and color profiles for perfect printing</li>
        </ol>
        
        <div class="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 class="font-bold mb-2">Pro Tip:</h4>
          <p>For best results, use specific descriptors like "vibrant sunset colors," "minimalist line art," or "90s retro cartoon style" to guide the AI.</p>
        </div>
        
        <h3 class="font-bold mb-2">Real-World Example:</h3>
        <p class="mb-2">Prompt: "Cyberpunk samurai with neon lighting"</p>
        <p>Our AI identified:</p>
        <ul class="list-disc pl-5 mb-4">
          <li>Theme: Cyberpunk/futuristic</li>
          <li>Color palette: Neon blues and purples</li>
          <li>Style: Japanese ukiyo-e influences</li>
        </ul>
      `
    },
    {
      id: 2,
      title: "The Sustainable Future of Custom Apparel Printing",
      excerpt: "How Ryvona reduces environmental impact with eco-friendly inks and production methods.",
      category: "Sustainability",
      icon: <FaLeaf className="text-green-500 text-2xl" />,
      readTime: "5 min read",
      date: "May 25, 2023",
      author: "Jamal Kouri",
      content: `
        <h2 class="text-xl font-bold mb-4">Our Green Printing Revolution</h2>
        <p class="mb-4">At Ryvona, we've implemented a comprehensive sustainability program that reduces environmental impact at every production stage:</p>
        
        <h3 class="font-bold mb-2">Key Initiatives:</h3>
        <ul class="list-disc pl-5 mb-4 space-y-2">
          <li><strong>Water-Based Inks:</strong> 100% PVC-free, biodegradable formulas that save 3L of water per shirt compared to conventional plastisol</li>
          <li><strong>Solar-Powered Facilities:</strong> Our Tunisian production center runs on 80% renewable energy</li>
          <li><strong>Smart Cut-and-Sew:</strong> AI-optimized fabric cutting reduces textile waste by 22%</li>
          <li><strong>On-Demand Production:</strong> We only print what's ordered, eliminating overstock waste</li>
        </ul>
        
        <div class="bg-green-50 p-4 rounded-lg mb-4">
          <h4 class="font-bold mb-2">Environmental Impact:</h4>
          <p>Since implementing these changes in 2022, we've achieved:</p>
          <ul class="list-disc pl-5">
            <li>40% reduction in carbon footprint</li>
            <li>35% less water usage</li>
            <li>Zero hazardous waste to landfill</li>
          </ul>
        </div>
        
        <h3 class="font-bold mb-2">Future Goals:</h3>
        <p>By 2025, we aim to source 100% organic cotton and achieve carbon-neutral shipping worldwide.</p>
      `
    }
  ];

  const blogPosts = [
    {
      id: 3,
      title: "5 Psychology Principles for Impactful Ryvonas",
      excerpt: "Leverage color theory and visual hierarchy to create designs that resonate.",
      category: "Design Tips",
      date: "May 15, 2023",
      author: "Emma Rodriguez",
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      content: `
        <h2 class="text-xl font-bold mb-4">Design Psychology Fundamentals</h2>
        <p class="mb-4">Understanding these psychological principles will help you create apparel designs that connect emotionally with viewers:</p>
        
        <h3 class="font-bold mb-2">1. Color Psychology</h3>
        <p class="mb-4">Different colors evoke specific emotional responses. For protest shirts, red conveys urgency while blue communicates trust.</p>
        
        <h3 class="font-bold mb-2">2. Gestalt Principles</h3>
        <p class="mb-4">Viewers naturally group similar elements. Use this to create cohesive designs where elements feel connected.</p>
        
        <h3 class="font-bold mb-2">3. Focal Points</h3>
        <p class="mb-4">The eye needs a clear entry point. Establish visual hierarchy with size, color, and positioning.</p>
        
        <h3 class="font-bold mb-2">4. Negative Space</h3>
        <p class="mb-4">Strategic empty space makes designs feel more premium and helps key elements stand out.</p>
        
        <h3 class="font-bold mb-2">5. Emotional Storytelling</h3>
        <p>Designs that tell a story or convey a clear message create stronger connections with wearers.</p>
      `
    },
    {
      id: 4,
      title: "From Prompt to Product: A Customer Journey",
      excerpt: "Follow a real case study from AI-generated concept to final printed product.",
      category: "Case Study",
      date: "April 28, 2023",
      author: "Michael Tan",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      content: `
        <h2 class="text-xl font-bold mb-4">Case Study: "Tunisian Street Art" Collection</h2>
        <p class="mb-4">Follow the journey of designer Amira's "Tunisian Street Art" collection from initial concept to finished product:</p>
        
        <h3 class="font-bold mb-2">Phase 1: Concept Development</h3>
        <p class="mb-4">Initial prompt: "Vibrant Tunisian street art with Arabic calligraphy elements in a contemporary style"</p>
        <p class="mb-4">AI generated 12 variations in under 2 minutes. Amira selected 3 favorites and blended elements from each.</p>
        
        <h3 class="font-bold mb-2">Phase 2: Refinement</h3>
        <p class="mb-4">Using our design tools, Amira:</p>
        <ul class="list-disc pl-5 mb-4">
          <li>Adjusted color saturation for better print results</li>
          <li>Added subtle texture to mimic spray paint effects</li>
          <li>Positioned the design for optimal placement on different garment types</li>
        </ul>
        
        <h3 class="font-bold mb-2">Phase 3: Production</h3>
        <p class="mb-4">The final design was printed using our direct-to-garment technology on organic cotton tees, with:</p>
        <ul class="list-disc pl-5">
          <li>300gsm premium fabric weight</li>
          <li>Water-based inks for vibrant, durable colors</li>
          <li>Recycled paper packaging</li>
        </ul>
      `
    },
    {
      id: 5,
      title: "Optimizing AI Prompts for Fashion Designs",
      excerpt: "Pro tips to get the best results from Ryvona's AI generator.",
      category: "Tutorial",
      date: "March 10, 2023",
      author: "David Park",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      content: `
        <h2 class="text-xl font-bold mb-4">Mastering AI Prompt Engineering</h2>
        <p class="mb-4">Get designer-quality results from our AI with these proven prompt structures:</p>
        
        <h3 class="font-bold mb-2">The Formula:</h3>
        <p class="mb-4 font-mono bg-gray-100 p-2 rounded">[Subject] + [Style] + [Color Palette] + [Details] + [Context]</p>
        
        <h3 class="font-bold mb-2">Examples:</h3>
        <div class="space-y-4 mb-4">
          <div class="bg-blue-50 p-3 rounded-lg">
            <p class="font-semibold">Basic Prompt:</p>
            <p class="font-mono">"A wolf howling at the moon"</p>
          </div>
          <div class="bg-green-50 p-3 rounded-lg">
            <p class="font-semibold">Optimized Prompt:</p>
            <p class="font-mono">"A majestic wolf howling at a full moon, in a minimalist line art style, using only black and white, with geometric shapes forming the wolf silhouette, suitable for a premium Ryvona"</p>
          </div>
        </div>
        
        <h3 class="font-bold mb-2">Advanced Tips:</h3>
        <ul class="list-disc pl-5 space-y-2">
          <li>Use art movements for style ("Bauhaus", "Art Deco")</li>
          <li>Reference famous artists ("in the style of Picasso")</li>
          <li>Specify color relationships ("analogous color scheme")</li>
          <li>Indicate intended use ("for a gym tank top")</li>
        </ul>
      `
    },
    {
      id: 6,
      title: "Comparing Printing Methods: DTG vs. Screen Printing",
      excerpt: "Which technique works best for different design types and quantities.",
      category: "Guide",
      date: "February 22, 2023",
      author: "Leila Moussa",
      image: "https://images.unsplash.com/photo-1465433360938-e02f97448763?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      content: `
        <h2 class="text-xl font-bold mb-4">Printing Technology Showdown</h2>
        <p class="mb-4">At Ryvona, we use both Direct-to-Garment (DTG) and screen printing based on your project needs:</p>
        
        <div class="overflow-x-auto mb-6">
          <table class="min-w-full bg-white border border-gray-200">
            <thead>
              <tr class="bg-gray-100">
                <th class="py-2 px-4 border-b text-left">Factor</th>
                <th class="py-2 px-4 border-b text-left">DTG Printing</th>
                <th class="py-2 px-4 border-b text-left">Screen Printing</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="py-2 px-4 border-b">Best For</td>
                <td class="py-2 px-4 border-b">Complex designs, small batches</td>
                <td class="py-2 px-4 border-b">Simple designs, large quantities</td>
              </tr>
              <tr>
                <td class="py-2 px-4 border-b">Color Detail</td>
                <td class="py-2 px-4 border-b">Unlimited colors, photorealistic</td>
                <td class="py-2 px-4 border-b">Limited color separations</td>
              </tr>
              <tr>
                <td class="py-2 px-4 border-b">Minimum Order</td>
                <td class="py-2 px-4 border-b">1 piece</td>
                <td class="py-2 px-4 border-b">24 pieces</td>
              </tr>
              <tr>
                <td class="py-2 px-4 border-b">Cost Efficiency</td>
                <td class="py-2 px-4 border-b">Better for small runs</td>
                <td class="py-2 px-4 border-b">Better for bulk</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h3 class="font-bold mb-2">Our Recommendation:</h3>
        <p class="mb-2">Choose DTG when you need:</p>
        <ul class="list-disc pl-5 mb-4">
          <li>Full-color designs</li>
          <li>Small quantities or samples</li>
          <li>Quick turnaround</li>
        </ul>
        <p class="mb-2">Choose screen printing for:</p>
        <ul class="list-disc pl-5">
          <li>Simple, bold designs</li>
          <li>Orders of 24+ pieces</li>
          <li>Specialty inks (metallic, glow-in-the-dark)</li>
        </ul>
      `
    }
  ];

  const openModal = (post: BlogPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal/Popup Window */}
      {isModalOpen && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium mb-3">
                    {selectedPost.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold">{selectedPost.title}</h2>
                  <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                    <span className="flex items-center">
                      <FaUser className="mr-1" /> {selectedPost.author}
                    </span>
                    <span className="flex items-center">
                      <FaCalendarAlt className="mr-1" /> {selectedPost.date}
                    </span>
                    <span>{selectedPost.readTime}</span>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
              
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />
              
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-purple-800 text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Ryvona Blog
            </span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            AI fashion insights, design tips, and sustainable innovation
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-8 text-gray-900 border-b pb-2">
          Featured Stories
        </h2>
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {featuredPosts.map(post => (
            <div key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                    {post.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-500">{post.category}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                  <button 
                    onClick={() => openModal(post)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                  >
                    Read article <FaArrowRight className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Posts */}
      <section className="py-8 max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-8 text-gray-900 border-b pb-2">
          Latest Articles
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium mb-3">
                  {post.category}
                </span>
                <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{post.date}</span>
                  <button 
                    onClick={() => openModal(post)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                  >
                    Read more <FaArrowRight className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to transform your ideas into wearable designs?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Try Ryvona's AI design tools today - no experience needed!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/design-studio" 
              className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Designing
            </Link>
            <Link
              to="/templates"
              className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;