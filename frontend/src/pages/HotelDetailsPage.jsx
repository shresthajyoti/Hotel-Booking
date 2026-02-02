import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Coffee, Car, Utensils, CheckCircle, ArrowLeft, Navigation } from 'lucide-react';
import gsap from 'gsap';
import { hotels } from '../data/hotels';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../utils/api';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import hotelPinIcon from '../assets/hotel-pin.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Hotel Icon
const hotelIcon = new L.Icon({
  iconUrl: hotelPinIcon,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Pulsing User Location Icon
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div class="w-4 h-4 bg-[#0071e3] rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10]
});

const HotelDetailsPage = () => {
  const { id } = useParams();
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [hotelData, setHotelData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch hotel details
  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true);
        // Check mock data first
        const mockHotel = hotels.find(h => h.id.toString() === id?.toString());
        if (mockHotel) {
          setHotelData({
            ...mockHotel,
            pricePerNight: mockHotel.price,
            images: [mockHotel.image, mockHotel.image, mockHotel.image]
          });
        } else {
          // Try API
          const res = await api.get(`/properties/${id}`);
          if (res.data?.success) setHotelData(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching hotel details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id]);

  // GSAP animations
  useEffect(() => {
    if (headerRef.current && contentRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8 })
        .fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4");
    }
  }, [hotelData]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => console.error('Error getting location:', err)
      );
    }
  }, []);

  const getAmenityIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('wifi')) return <Wifi size={20} />;
    if (lower.includes('coffee') || lower.includes('breakfast')) return <Coffee size={20} />;
    if (lower.includes('car') || lower.includes('shuttle')) return <Car size={20} />;
    if (lower.includes('restaurant') || lower.includes('dining')) return <Utensils size={20} />;
    return <CheckCircle size={20} />;
  };

  const fetchRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes?.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        setRouteCoords(coordinates);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const handleNavigate = () => {
    if (!userLocation) return alert('Please allow location access to use navigation');
    if (!hotelData?.latitude || !hotelData?.longitude) return alert('Hotel location not available');

    if (showRoute) {
      setShowRoute(false);
      setRouteCoords([]);
    } else {
      setShowRoute(true);
      fetchRoute(userLocation, { lat: hotelData.latitude, lng: hotelData.longitude });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!hotelData) return <div className="min-h-screen flex items-center justify-center">Hotel not found</div>;

  const hotel = {
    ...hotelData,
    price: hotelData.pricePerNight || hotelData.price || 0,
    images: hotelData.images?.length > 0 ? hotelData.images : [hotelData.image, hotelData.image, hotelData.image],
    amenities: (hotelData.amenities || []).map(name => ({ icon: getAmenityIcon(name), name }))
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="container mx-auto px-6">
        <Link to="/search" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-6">
          <ArrowLeft size={20} /> Back to Search
        </Link>

        {/* Header */}
        <div ref={headerRef} className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin size={18} />
                <span>{hotel.location}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-3xl font-bold text-blue-600">
                Rs. {hotel.price.toLocaleString()}<span className="text-lg text-gray-400 font-normal">/night</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold mt-1">
                <Star size={16} className="text-yellow-400 fill-yellow-400" /> {hotel.rating || 0} (120 reviews)
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px] md:h-[500px] rounded-3xl overflow-hidden">
            <div className="md:col-span-2 h-full">
              <img src={hotel.images[0]} alt="Main" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="flex flex-col gap-4 h-full">
              <div className="h-1/2 overflow-hidden">
                <img src={hotel.images[1]} alt="Sub 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="h-1/2 overflow-hidden">
                <img src={hotel.images[2]} alt="Sub 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">About this stay</h2>
            <p className="text-gray-600 leading-relaxed mb-8 text-lg">{hotel.description}</p>

            <h2 className="text-2xl font-bold mb-6">Amenities</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {hotel.amenities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="text-blue-600">{a.icon}</div>
                  <span className="font-medium text-gray-700">{a.name}</span>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Location</h2>
              {hotel.latitude && hotel.longitude ? (
                <div className="bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 relative h-[400px] w-full">
                  <MapContainer center={[hotel.latitude, hotel.longitude]} zoom={15} scrollWheelZoom={false} className="w-full h-full">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[hotel.latitude, hotel.longitude]} icon={hotelIcon}>
                      <Popup>{hotel.name}</Popup>
                    </Marker>
                    {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}><Popup>You are here</Popup></Marker>}
                    {routeCoords.length > 0 && showRoute && <Polyline positions={routeCoords} pathOptions={{ color: '#0071e3', weight: 4, opacity: 0.7 }} />}
                  </MapContainer>
                  <button onClick={handleNavigate} className={`${showRoute ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0071e3] hover:bg-[#0077ed]'} text-white px-6 py-3 rounded-full font-bold shadow-lg absolute bottom-6 right-6 flex items-center gap-2`}>
                    <Navigation size={20} /> {showRoute ? 'Hide Route' : 'Navigate'}
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-gray-100 rounded-xl text-center text-gray-500">Map not available</div>
              )}
            </div>
          </div>

          {/* Right Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 sticky top-28">
              <h3 className="text-xl font-bold mb-6">Book your stay</h3>
              <div className="space-y-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dates</label>
                  <div className="font-medium">Oct 12 - Oct 16</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Guests</label>
                  <div className="font-medium">2 Adults, 1 Room</div>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Rs. {hotel.price.toLocaleString()} x 4 nights</span>
                  <span>Rs. {(hotel.price * 4).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service fee</span>
                  <span>Rs. 5,000</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Rs. {(hotel.price * 4 + 5000).toLocaleString()}</span>
                </div>
              </div>
              <Link
                to="/booking"
                state={{ hotelId: hotel._id || hotel.id, hotelName: hotel.name, price: hotel.price, total: hotel.price * 4 + 5000, dates: "Oct 12 - Oct 16", roomType: "Deluxe Room" }}
                className="block w-full bg-black text-white text-center py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                Reserve Now
              </Link>
              <p className="text-center text-xs text-gray-400 mt-4">You won't be charged yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailsPage;
