import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { hotels } from '../data/hotels';
import gsap from 'gsap';
import api from '../utils/api';

const SearchPage = () => {
  const [allHotels, setAllHotels] = useState([]);
  const [displayedHotels, setDisplayedHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(null);
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/properties');
      if (res.data.success) {
        const apiProperties = res.data.data.map(p => ({
          id: p._id,
          name: p.name,
          location: p.location,
          price: p.pricePerNight,
          rating: p.rating,
          latitude: p.latitude,
          longitude: p.longitude,
          image: p.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
          amenities: p.amenities || ["Wifi", "Parking"]
        }));

        const finalHotels = apiProperties.length > 0 ? apiProperties : hotels;
        setAllHotels(finalHotels);
        setDisplayedHotels(finalHotels);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setAllHotels(hotels);
      setDisplayedHotels(hotels);
    } finally {
      setLoading(false);
    }
  };

  const handleNearMeToggle = (isAuto = false) => {
    if (isNearMeActive && !isAuto) {
      setIsNearMeActive(false);
      setDisplayedHotels(allHotels);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setUserCoords(coords);
        sortByProximity(coords);
        setIsNearMeActive(true);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
        if (!isAuto) alert("Could not access your location. Please enable location permissions.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const sortByProximity = (coords) => {
    const sorted = [...allHotels].map(h => ({
      ...h,
      distance: calculateDistance(coords.lat, coords.lon, h.latitude, h.longitude)
    })).sort((a, b) => a.distance - b.distance);
    setDisplayedHotels(sorted);
  };

  useEffect(() => {
    if (!loading) {
      gsap.fromTo(".hotel-card",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [loading, displayedHotels]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-6">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isNearMeActive ? 'Hotels Near You' : 'Find your perfect stay in Nepal'}
            </h1>
            <p className="text-gray-500">Showing {displayedHotels.length} properties</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleNearMeToggle}
              className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium transition-all ${isNearMeActive
                ? 'bg-[#0071e3] text-white border-[#0071e3]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                } ${isLocating ? 'opacity-70 cursor-wait' : ''}`}
              disabled={isLocating}
            >
              <MapPin size={16} className={isLocating ? 'animate-bounce' : ''} />
              {isLocating ? 'Locating...' : isNearMeActive ? 'Near Me Active' : 'Near Me'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-black transition-colors">
              <Filter size={16} /> Filters
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search hotels..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-black w-64"
                onChange={(e) => {
                  const query = e.target.value.toLowerCase();
                  setDisplayedHotels(allHotels.filter(h =>
                    h.name.toLowerCase().includes(query) ||
                    h.location.toLowerCase().includes(query)
                  ));
                }}
              />
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedHotels.map((hotel, index) => (
            <div key={hotel.id} className="hotel-card bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 group flex flex-col h-full">
              {/* Image Section */}
              <div className="relative h-72 overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full flex items-center gap-1 shadow-sm">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold">{hotel.rating}</span>
                  </div>
                  {hotel.distance && hotel.distance !== Infinity && (
                    <div className={`px-3 py-1.5 backdrop-blur-md text-white rounded-full flex items-center gap-1 shadow-sm ${index === 0 ? 'bg-green-600/90' : 'bg-[#0071e3]/90'}`}>
                      <MapPin size={12} />
                      <span className="text-xs font-bold">
                        {index === 0 ? 'Closest: ' : ''}
                        {hotel.distance.toFixed(1)} km
                      </span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle favorite
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
                    <p className="text-xl font-bold text-[#1d1d1f]">Rs. {hotel.price.toLocaleString()}</p>
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
