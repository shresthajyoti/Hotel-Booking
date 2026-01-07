import React, { useEffect, useRef } from 'react';
import { Wifi, Coffee, Car, Utensils, Dumbbell, Sparkles, Wind, Waves, CheckCircle } from 'lucide-react';
import gsap from 'gsap';

const ServicesPage = () => {
  const headerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(headerRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    gsap.fromTo(".service-card", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
  }, []);

  const services = [
    { 
      icon: <Wifi size={32} />, 
      title: 'High-Speed WiFi', 
      description: 'Stay connected with complimentary high-speed internet access throughout your stay.',
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      icon: <Coffee size={32} />, 
      title: 'Gourmet Dining', 
      description: 'Experience authentic Nepali and international cuisine prepared by expert chefs.',
      color: 'bg-orange-50 text-orange-600'
    },
    { 
      icon: <Car size={32} />, 
      title: 'Airport Shuttle', 
      description: 'Complimentary airport pickup and drop-off service for a hassle-free journey.',
      color: 'bg-green-50 text-green-600'
    },
    { 
      icon: <Dumbbell size={32} />, 
      title: 'Fitness Center', 
      description: 'State-of-the-art gym facilities to maintain your wellness routine.',
      color: 'bg-purple-50 text-purple-600'
    },
    { 
      icon: <Sparkles size={32} />, 
      title: 'Spa & Wellness', 
      description: 'Rejuvenate with traditional Nepali massages and modern spa treatments.',
      color: 'bg-pink-50 text-pink-600'
    },
    { 
      icon: <Utensils size={32} />, 
      title: 'Room Service', 
      description: '24/7 in-room dining with a curated menu of local and international dishes.',
      color: 'bg-yellow-50 text-yellow-600'
    },
    { 
      icon: <Wind size={32} />, 
      title: 'Concierge Service', 
      description: 'Personalized assistance for tours, bookings, and local recommendations.',
      color: 'bg-cyan-50 text-cyan-600'
    },
    { 
      icon: <Waves size={32} />, 
      title: 'Swimming Pool', 
      description: 'Relax by our infinity pool with stunning views of the Himalayas.',
      color: 'bg-indigo-50 text-indigo-600'
    },
  ];

  const premiumFeatures = [
    'Complimentary Breakfast Buffet',
    'Daily Housekeeping',
    'Valet Parking',
    'Business Center',
    'Event & Conference Facilities',
    'Kids Play Area',
    'Guided Trekking Tours',
    'Currency Exchange'
  ];

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      {/* Header */}
      <div className="container mx-auto px-6 mb-16" ref={headerRef}>
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Premium Services & Amenities</h1>
          <p className="text-lg text-gray-500">We go beyond accommodation to ensure your stay is comfortable, convenient, and unforgettable.</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div key={index} className="service-card group bg-gray-50 p-6 rounded-3xl hover:shadow-xl hover:bg-white transition-all duration-300 cursor-pointer">
              <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Features */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Additional Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {premiumFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="group flex items-center gap-3 bg-white p-4 rounded-xl hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-green-100"
              >
                <CheckCircle size={20} className="text-green-600 shrink-0 group-hover:text-green-700 group-hover:scale-110 transition-all duration-300" />
                <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 mt-20">
        <div className="bg-black text-white rounded-[40px] p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Experience World-Class Hospitality</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Book your stay with Roomora and enjoy premium services designed to make your Nepal journey extraordinary.
          </p>
          <a href="/search" className="inline-block bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors">
            Browse Hotels
          </a>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
