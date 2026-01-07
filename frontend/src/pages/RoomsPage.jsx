import React, { useEffect, useRef, useState } from 'react';
import { Star, MapPin, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const RoomsPage = () => {
  const headerRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    gsap.fromTo(headerRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    gsap.fromTo(".room-card", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
  }, [activeFilter]);

  const rooms = [
    { id: 1, type: 'Villa', name: 'Luxury Villa in Pokhara', location: 'Pokhara', price: '18,000', guests: 6, rating: 4.9, image: '/images/pokhara_lakeside.png' },
    { id: 2, type: 'Suite', name: 'Presidential Suite', location: 'Kathmandu', price: '35,000', guests: 4, rating: 5.0, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80&fm=jpg' },
    { id: 3, type: 'Cottage', name: 'Mountain View Cottage', location: 'Nagarkot', price: '12,000', guests: 4, rating: 4.8, image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80&fm=jpg' },
    { id: 4, type: 'Apartment', name: 'Modern Apartment', location: 'Thamel', price: '8,500', guests: 2, rating: 4.6, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80&fm=jpg' },
    { id: 5, type: 'Villa', name: 'Lakeside Villa', location: 'Pokhara', price: '22,000', guests: 8, rating: 4.9, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&fm=jpg' },
    { id: 6, type: 'Cottage', name: 'Jungle Retreat', location: 'Chitwan', price: '15,000', guests: 4, rating: 4.7, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fm=jpg' },
  ];

  const filteredRooms = activeFilter === 'All' ? rooms : rooms.filter(room => room.type === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      {/* Header */}
      <div className="container mx-auto px-6 mb-12" ref={headerRef}>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Explore Our Rooms</h1>
          <p className="text-lg text-gray-500">From luxury villas to cozy cottages, find the perfect accommodation for your stay in Nepal.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center">
          {['All', 'Villa', 'Suite', 'Cottage', 'Apartment'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <Link to={`/hotel/${room.id}`} key={room.id} className="room-card group bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="relative aspect-4/3 overflow-hidden">
                <img 
                  src={room.image} 
                  alt={room.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold shadow-sm">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  {room.rating}
                </div>
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                  {room.type}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{room.name}</h3>
                
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                  <MapPin size={16} />
                  <span>{room.location}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">Rs. {room.price}</span>
                    <span className="text-sm text-gray-500">/night</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Users size={16} />
                    <span>{room.guests} guests</span>
                  </div>
                </div>

                <button className="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                  View Details <ArrowRight size={18} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;
