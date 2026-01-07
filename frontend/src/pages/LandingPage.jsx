import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, ArrowRight, Star } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('Villa');
  const heroTextRef = useRef(null);
  const searchBarRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Background images for carousel - Iconic Nepal
  const backgroundImages = [
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070&auto=format&fit=crop', // Pokhara Lake & Boat
    'https://images.unsplash.com/photo-1526716173434-a1b560f2065d?q=80&w=2070&auto=format&fit=crop', // Boudhanath Stupa
    'https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=2070&auto=format&fit=crop', // Bhaktapur Architecture
    'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=2070&auto=format&fit=crop', // Himalayas
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2070&auto=format&fit=crop'  // Luxury Resort Pool
  ];

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(heroTextRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(searchBarRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.4"
    );
  }, []);

  // Scroll Animations for Bento Grid
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.bento-item', {
        scrollTrigger: {
          trigger: '.bento-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      });
    });
    return () => ctx.revert();
  }, []);

  // Auto-slide background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const rooms = [
    { id: 1, type: 'Villa', name: 'Fishtail Lodge', location: 'Lakeside, Pokhara', rating: '4.9', price: '18,500', image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=2070&auto=format&fit=crop' },
    { id: 2, type: 'Villa', name: 'Club Himalaya', location: 'Nagarkot, Bhaktapur', rating: '4.8', price: '14,000', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop' },
    { id: 3, type: 'Villa', name: 'Moksha Mustang', location: 'Jomsom, Mustang', rating: '4.9', price: '28,000', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop' },
    { id: 4, type: 'Villa', name: 'The Dwarika\'s Hotel', location: 'Battisputali, Kathmandu', rating: '5.0', price: '35,000', image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=2070&auto=format&fit=crop' },
    { id: 5, type: 'Apartment', name: 'Thamel Eco Resort', location: 'Thamel, Kathmandu', rating: '4.6', price: '8,500', image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=2070&auto=format&fit=crop' },
    { id: 6, type: 'Apartment', name: 'Temple Tree Resort', location: 'Gaurighat, Pokhara', rating: '4.7', price: '12,500', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2070&auto=format&fit=crop' },
  ];

  const filteredRooms = rooms.filter(room => room.type === activeTab);

  const statsNumberRef = useRef(null);

  const handleStatsHover = () => {
    if (statsNumberRef.current) {
      let counter = { val: 0 };
      gsap.to(counter, {
        val: 300,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          if (statsNumberRef.current) {
            statsNumberRef.current.innerText = Math.ceil(counter.val);
          }
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Hero Section with Auto-Sliding Background */}
      <section className="relative h-[600px] lg:h-[700px]">
        <div className="absolute inset-0 overflow-hidden">
        {/* Background Images Carousel */}
        {backgroundImages.map((image, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={image} 
              alt={`Luxury Resort Nepal ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          </div>
        ))}
        </div>

        {/* Hero Content - Centered Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-15 px-6 pb-0 mt-20">
          <div className="text-center text-white" ref={heroTextRef}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-8 border border-white/20 shadow-lg">
              <Star size={14} className="text-white fill-white" />
              <span className="text-xs font-semibold tracking-wide">4.9 Rating • Certified Excellence</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold mb-6 tracking-tight drop-shadow-xl">
              Enjoy Your Holiday
            </h1>
            
            <p className="text-xl md:text-2xl font-medium opacity-90 drop-shadow-lg max-w-2xl mx-auto leading-relaxed">
              Experience the finest hotels in Nepal at the best prices.
            </p>
          </div>
        </div>

        {/* Simple Search Bar - Positioned at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-30 px-6 translate-y-[50%]">
          <div ref={searchBarRef} className="max-w-5xl mx-auto bg-white/80 backdrop-blur-2xl rounded-4xl shadow-2xl p-4 border border-white/40">
            <div className="flex flex-col md:flex-row items-center gap-2">
              {/* Location */}
              <div className="flex-1 px-6 py-3 w-full md:w-auto border-b md:border-b-0 md:border-r border-gray-200/50">
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Location</label>
                <select className="w-full outline-none text-[15px] font-medium text-gray-900 bg-transparent cursor-pointer">
                  <option value="kathmandu">Kathmandu</option>
                  <option value="pokhara">Pokhara</option>
                  <option value="chitwan">Chitwan</option>
                  <option value="lumbini">Lumbini</option>
                  <option value="nagarkot">Nagarkot</option>
                  <option value="mustang">Mustang</option>
                  <option value="bhaktapur">Bhaktapur</option>
                  <option value="bandipur">Bandipur</option>
                </select>
              </div>

              {/* Check In */}
              <div className="flex-1 px-6 py-3 w-full md:w-auto border-b md:border-b-0 md:border-r border-gray-200/50">
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Check In</label>
                <input 
                  type="date" 
                  className="w-full outline-none text-[15px] font-medium text-gray-900 bg-transparent cursor-pointer"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Check Out */}
              <div className="flex-1 px-6 py-3 w-full md:w-auto border-b md:border-b-0 md:border-r border-gray-200/50">
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Check Out</label>
                <input 
                  type="date" 
                  className="w-full outline-none text-[15px] font-medium text-gray-900 bg-transparent cursor-pointer"
                />
              </div>

              {/* Guest */}
              <div className="flex-1 px-6 py-3 w-full md:w-auto">
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Guest</label>
                <select className="w-full outline-none text-[15px] font-medium text-gray-900 bg-transparent cursor-pointer">
                  <option value="1">1 adult</option>
                  <option value="2">2 adults</option>
                  <option value="3">3 adults</option>
                  <option value="4">4 adults</option>
                  <option value="5">5+ adults</option>
                </select>
              </div>

              {/* Search Button */}
              <Link 
                to="/search" 
                className="bg-[#1D1D1F] text-white px-8 py-4 rounded-3xl font-semibold hover:bg-black transition-all shadow-lg hover:shadow-xl w-full md:w-auto text-center"
              >
                Search
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Bento Grid Style */}
      <section className="container mx-auto px-6 mt-40 mb-32">
        <div className="bento-grid grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Top Left - Main Text Card */}
          <div className="bento-item lg:col-span-2 bg-white rounded-[2.5rem] p-12 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow min-h-[400px]">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-600 mb-8 tracking-wide uppercase">
                About Us
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight mb-6 text-[#1D1D1F] tracking-tight">
                Your Ultimate Stay Partner.
              </h2>
              <p className="text-[#86868B] text-lg leading-relaxed max-w-md">
                Roomora is your ultimate travel partner, offering curated stays, quality service, and a passion for authentic experiences.
              </p>
            </div>
          </div>

          {/* Top Middle - Stats Card 1 */}
          <div 
            className="bento-item lg:col-span-1 bg-white rounded-[2.5rem] p-10 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow min-h-[400px] group cursor-default"
            onMouseEnter={handleStatsHover}
          >
            <div>
              <h3 className="text-6xl font-semibold text-[#1D1D1F] mb-2 tracking-tighter">
                <span ref={statsNumberRef}>300</span>+
              </h3>
              <p className="text-[#86868B] font-medium text-lg">Hotels Partnered</p>
            </div>
            <Link to="/contact" className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-6 py-4 rounded-full font-semibold text-sm hover:bg-[#E5E5EA] transition-all flex items-center justify-between group">
              Contact Us
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Top Right - Stats Card 2 */}
          <div className="bento-item lg:col-span-1 bg-[#1D1D1F] rounded-[2.5rem] p-10 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow min-h-[400px]">
            <div>
              <h3 className="text-6xl font-semibold text-white mb-2 tracking-tighter">20+</h3>
              <p className="text-gray-400 font-medium text-lg">Destinations</p>
            </div>
            <Link to="/map" className="w-full bg-white/10 text-white px-6 py-4 rounded-full font-semibold text-sm hover:bg-white/20 transition-all flex items-center justify-between group backdrop-blur-md">
              View Map
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Bottom Left - Large Image */}
          <div className="bento-item lg:col-span-3 h-[450px] rounded-[2.5rem] overflow-hidden relative group shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1600&q=80" 
              alt="Luxury Resort" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
          </div>

          {/* Bottom Right - Stats Card 3 with Avatars & Live Reactions */}
          <div className="bento-item lg:col-span-1 bg-white rounded-[2.5rem] p-10 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow h-[450px] relative group">
            
            {/* Floating Emojis Container */}
            <div className="absolute inset-0 pointer-events-none z-0">
              {/* We will use a simple CSS animation for continuous floating emojis */}
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-3xl animate-float-up opacity-0"
                  style={{
                    left: `${Math.random() * 80 + 10}%`,
                    bottom: '0%', // Start at the bottom edge, visible
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${Math.random() * 4 + 4}s`, // Slower, more majestic
                    animationIterationCount: 'infinite'
                  }}
                >
                  {['❤️', '😊', '🎉', '👍', '😍', '🌟', '🔥', '👏'][Math.floor(Math.random() * 8)]}
                </div>
              ))}
            </div>

            <div className="relative z-10">
              <h3 className="text-6xl font-semibold text-[#1D1D1F] mb-2 tracking-tighter">1.5k+</h3>
              <p className="text-[#86868B] font-medium text-lg">Happy Customers</p>
            </div>
            
            <div className="relative z-10">
              <div className="flex -space-x-4 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-14 h-14 rounded-full border-4 border-white overflow-hidden shadow-sm relative group/avatar">
                    <img 
                      src={`https://i.pravatar.cc/150?img=${i + 10}`} 
                      alt="User" 
                      className="w-full h-full object-cover" 
                    />
                    {/* Heart pop on hover */}
                    <div className="absolute inset-0 bg-black/20 hidden group-hover/avatar:flex items-center justify-center backdrop-blur-[1px]">
                      <span className="text-xl">❤️</span>
                    </div>
                  </div>
                ))}
                <div className="w-14 h-14 rounded-full border-4 border-white bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center text-xs font-bold shadow-sm">
                  +2k
                </div>
              </div>
              
              {/* Live Indicator */}
              <div className="flex items-center gap-2 bg-green-50 w-fit px-3 py-1.5 rounded-full border border-green-100">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-green-700">Live Activity</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Rooms Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
               <h2 className="text-4xl font-semibold text-[#1D1D1F] mb-2 tracking-tight">Featured Stays</h2>
               <p className="text-[#86868B] text-lg">Handpicked for your comfort.</p>
            </div>
            
            <div className="flex bg-[#F5F5F7] p-1 rounded-full">
              {['Villa', 'Apartment'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    activeTab === tab ? 'bg-white shadow-sm text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <Link 
                key={room.id}
                to="/search"
                className="group bg-white rounded-4xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={room.image} 
                    alt={room.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-[#1D1D1F] shadow-sm">
                    Rs. {room.price}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-[#1D1D1F] leading-tight group-hover:text-blue-600 transition-colors">
                      {room.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#86868B] mt-2">
                    <MapPin size={14} />
                    <span>{room.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-[#1D1D1F] mt-4 bg-[#F5F5F7] w-fit px-3 py-1 rounded-full">
                    <Star size={12} className="fill-black text-black" /> {room.rating}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
