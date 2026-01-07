import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { hotels } from '../data/hotels';
import gsap from 'gsap';
import api from '../utils/api';

const SearchPage = () => {


  const [allHotels, setAllHotels] = useState(hotels);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/properties');
      if (res.data.success) {
        // Map backend properties to match frontend hotel structure
        const apiProperties = res.data.data.map(p => ({
          id: p._id,
          name: p.name,
          location: p.location,
          price: p.pricePerNight,
          rating: p.rating,
          image: p.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
          amenities: p.amenities || ["Wifi", "Parking"]
        }));

        // Merge API properties with mock data, avoiding duplicates if any
        setAllHotels([...apiProperties, ...hotels]);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      gsap.fromTo(".hotel-card",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [loading]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-6">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find your perfect stay in Nepal</h1>
            <p className="text-gray-500">Showing {allHotels.length} properties</p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-black transition-colors">
              <Filter size={16} /> Filters
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search hotels..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm outline-none focus:border-black w-64"
              />
            </div>
          </div>
        </div>

        {/* Hotel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allHotels.map((hotel) => (
            <div key={hotel.id} className="hotel-card group bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 border border-gray-100/50 flex flex-col">
              {/* Image Section */}
              <div className="relative h-72 overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Top Overlay Elements */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-[#1d1d1f]">{hotel.rating}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-2.5 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-colors shadow-sm text-[#1d1d1f] hover:text-red-500"
                  >
                    <Heart size={18} />
                  </button>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-[#1d1d1f] leading-tight group-hover:text-[#0071e3] transition-colors">
                      {hotel.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#86868b] text-sm font-medium">
                    <MapPin size={14} />
                    {hotel.location}
                  </div>
                </div>

                {/* Amenities Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {hotel.amenities.map((amenity, index) => (
                    <span key={index} className="px-3 py-1 bg-[#f5f5f7] text-[#1d1d1f] text-xs font-semibold rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Footer: Price & Action */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-[#86868b] text-xs font-medium uppercase tracking-wide">Price per night</p>
                    <p className="text-xl font-bold text-[#1d1d1f]">Rs. {hotel.price}</p>
                  </div>

                  <Link
                    to={`/hotel/${hotel.id}`}
                    className="bg-[#0071e3] text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-[#0077ed] transition-colors shadow-sm hover:shadow-md active:scale-95 transform duration-200"
                  >
                    Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
