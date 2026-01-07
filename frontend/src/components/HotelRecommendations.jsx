import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { MapPin, Star, Navigation, Loader2, Info, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
    html: `<div class="w-4 h-4 bg-[#0071e3] rounded-full border-2 border-white shadow-[0_0_0_4px_rgba(0,113,227,0.3)] animate-pulse-ring"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10]
});

// Inject CSS for the pulse animation
const style = document.createElement('style');
style.innerHTML = `
  @keyframes pulse-ring {
    0% { box-shadow: 0 0 0 0 rgba(0, 113, 227, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(0, 113, 227, 0); }
    100% { box-shadow: 0 0 0 0 rgba(0, 113, 227, 0); }
  }
  .animate-pulse-ring {
    animation: pulse-ring 2s infinite;
  }
`;
document.head.appendChild(style);

// Component to handle map updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const HotelRecommendations = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  
  const containerRef = useRef(null);
  const headerRef = useRef(null);

  // 1. Get User Location (Live Tracking)
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    const successHandler = (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      
      setUserLocation(prev => {
        return location;
      });

      // Only fetch hotels on first load to avoid spamming API
      if (hotels.length === 0 && loading) {
        fetchNearbyHotels(location);
      }
    };

    const errorHandler = (err) => {
      console.error(err);
      if (!userLocation) {
         // Fallback location (Kathmandu) if permission denied and no location yet
         const fallback = { lat: 27.7172, lng: 85.3240 };
         setUserLocation(fallback);
         fetchNearbyHotels(fallback);
      }
    };

    const watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [hotels.length, loading]);

  const recenterMap = () => {
    if (userLocation) {
      setSelectedHotel(null); // Clear selection to trigger map updater to focus on user
      setRouteCoords([]); // Clear route
    }
  };

  // 2. Fetch Hotels using Overpass API (OpenStreetMap)
  const fetchNearbyHotels = async (location) => {
    try {
      // Query for hotels within 5km (5000m)
      const radius = 5000;
      const query = `
        [out:json];
        (
          node["tourism"="hotel"](around:${radius},${location.lat},${location.lng});
          way["tourism"="hotel"](around:${radius},${location.lat},${location.lng});
          relation["tourism"="hotel"](around:${radius},${location.lat},${location.lng});
        );
        out center;
      `;

      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.elements && data.elements.length > 0) {
        processHotels(data.elements, location);
      } else {
        // If no hotels found in OSM, use mock data for demonstration
        console.log("No hotels found in OSM, using mock data");
        processHotels([], location, true); 
      }
    } catch (err) {
      console.error("Overpass API Error:", err);
      // Fallback to mock data on error
      processHotels([], location, true);
    }
  };

  // 3. Process and "AI" Recommendation Logic
  const processHotels = (elements, userLoc, useMock = false) => {
    let processedHotels = [];

    if (useMock || elements.length === 0) {
        // Generate realistic mock data around the user's location
        processedHotels = Array.from({ length: 10 }).map((_, i) => ({
            id: i,
            name: `Hotel ${['Everest', 'Himalaya', 'Kathmandu', 'Lakeside', 'Sunrise', 'Mountain', 'Heritage', 'Royal', 'Grand', 'Peace'][i]} View`,
            lat: userLoc.lat + (Math.random() - 0.5) * 0.02,
            lng: userLoc.lng + (Math.random() - 0.5) * 0.02,
            tags: { name: `Hotel ${['Everest', 'Himalaya', 'Kathmandu', 'Lakeside', 'Sunrise', 'Mountain', 'Heritage', 'Royal', 'Grand', 'Peace'][i]} View` }
        }));
    } else {
        processedHotels = elements.map(el => ({
            id: el.id,
            name: el.tags.name || "Unnamed Hotel",
            lat: el.lat || el.center.lat,
            lng: el.lon || el.center.lon,
            tags: el.tags
        })).filter(h => h.name !== "Unnamed Hotel"); // Filter out unnamed spots
    }

    // Enrich with simulated "AI" data (Ratings, Reviews, Images)
    const enrichedHotels = processedHotels.map(hotel => {
        const distance = calculateDistance(userLoc.lat, userLoc.lng, hotel.lat, hotel.lng);
        const rating = (3.5 + Math.random() * 1.5).toFixed(1); // Random rating 3.5 - 5.0
        const reviews = Math.floor(Math.random() * 500) + 50;
        
        // AI Score Calculation
        const score = (parseFloat(rating) * 2) + (Math.log(reviews) * 0.5) - (distance * 0.5);

        return {
            ...hotel,
            rating,
            user_ratings_total: reviews,
            distanceMeters: distance * 1000, // km to meters
            score,
            vicinity: `${(distance).toFixed(1)} km from center`,
            photos: [`https://images.unsplash.com/photo-${['1566073771259-6a8506099945', '1520250497591-112f2f40a3f4', '1551882547-ff40c63fe5fa', '1455587734955-080184874463'][Math.floor(Math.random() * 4)]}?auto=format&fit=crop&w=800&q=80`]
        };
    });

    // Sort by AI Score
    enrichedHotels.sort((a, b) => b.score - a.score);

    const top3 = enrichedHotels.slice(0, 3);
    const others = enrichedHotels.slice(3, 15); // Limit list size

    setRecommendations(top3);
    setHotels(others);
    setLoading(false);
  };

  // Helper: Haversine Distance (km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const handleHotelClick = (hotel) => {
    setSelectedHotel(hotel);
    if (userLocation) {
      fetchRoute(userLocation, hotel);
    }
  };

  const fetchRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        // OSRM returns [lon, lat], Leaflet needs [lat, lon]
        const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoords(coordinates);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  // Animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.header-content', {
        y: -30, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.2
      });

      if (!loading && recommendations.length > 0) {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('.map-section', { x: 50, opacity: 0, duration: 1, clearProps: 'all' })
          .from('.section-title', { x: -20, opacity: 0, duration: 0.6, stagger: 0.2 }, '-=0.6')
          .from('.hotel-card', { y: 30, opacity: 0, duration: 0.6, stagger: 0.1, clearProps: 'all' }, '-=0.4');
      }
    }, [containerRef, headerRef]);
    return () => ctx.revert();
  }, [loading, recommendations]);

  return (
    <div ref={containerRef} className="w-full max-w-[1400px] mx-auto p-6 md:p-8 space-y-8 font-sans">
      {/* Header */}
      <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div className="header-content space-y-2">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Explore Hotels</h2>
          <p className="text-lg text-gray-500 font-medium">Curated stays using OpenStreetMap data.</p>
        </div>
        
        {userLocation && (
          <div className="header-content flex items-center gap-2 bg-white px-5 py-2.5 rounded-full text-black text-sm font-semibold shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <Navigation className="w-4 h-4" />
            <span>{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-3xl border border-gray-100">
          <Loader2 className="w-10 h-10 text-black animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Scanning OpenStreetMap...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List Section */}
          <div className="lg:col-span-5 space-y-8 h-[800px] overflow-y-auto pr-4 custom-scrollbar">
            <div>
              <h3 className="section-title text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">Top Recommendations</h3>
              <div className="space-y-6">
                {recommendations.map((hotel, index) => (
                  <HotelCard 
                    key={hotel.id} 
                    hotel={hotel} 
                    isRecommended={true} 
                    rank={index + 1}
                    onClick={() => handleHotelClick(hotel)}
                    isSelected={selectedHotel?.id === hotel.id}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="section-title text-xl font-bold text-gray-900 mb-6 mt-10">More Places</h3>
              <div className="space-y-4">
                {hotels.map((hotel) => (
                  <HotelCard 
                    key={hotel.id} 
                    hotel={hotel} 
                    onClick={() => handleHotelClick(hotel)}
                    isSelected={selectedHotel?.id === hotel.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="map-section lg:col-span-7 h-[500px] lg:h-[800px] sticky top-6">
            <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200 relative group bg-white z-0">
              {userLocation && (
                <MapContainer 
                    center={[userLocation.lat, userLocation.lng]} 
                    zoom={14} 
                    scrollWheelZoom={false}
                    className="w-full h-full z-0"
                >
                    <MapUpdater center={selectedHotel ? [selectedHotel.lat, selectedHotel.lng] : [userLocation.lat, userLocation.lng]} zoom={selectedHotel ? 16 : 14} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* User Marker */}
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                        <Popup>You are here</Popup>
                    </Marker>

                    {/* Route Line */}
                    {routeCoords.length > 0 && selectedHotel && (
                      <Polyline 
                        positions={routeCoords} 
                        pathOptions={{ color: '#0071E3', weight: 5, opacity: 0.7, lineCap: 'round' }} 
                      />
                    )}

                    {/* Hotel Markers */}
                    {[...recommendations, ...hotels].map((hotel) => (
                        <Marker 
                            key={hotel.id} 
                            position={[hotel.lat, hotel.lng]}
                            icon={hotelIcon}
                            eventHandlers={{
                                click: () => handleHotelClick(hotel),
                            }}
                        >
                            <Popup>
                                <div className="font-bold">{hotel.name}</div>
                                <div className="text-xs">Rating: {hotel.rating} ★</div>
                                <a 
                                  href={`https://www.openstreetmap.org/directions?from=${userLocation.lat},${userLocation.lng}&to=${hotel.lat},${hotel.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#0071E3] text-xs hover:underline block mt-1 font-medium"
                                >
                                  Get Directions (OSM)
                                </a>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
              )}
              
              <div className="absolute bottom-6 left-6 bg-white px-5 py-3 rounded-xl shadow-lg text-sm font-bold text-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-1000">
                Select a marker to explore
              </div>

              {/* Recenter Button */}
              <button 
                onClick={recenterMap}
                className="absolute top-4 right-4 bg-white p-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors z-1000 group/btn"
                title="Locate Me"
              >
                <Navigation className="w-5 h-5 text-gray-700 group-hover/btn:text-[#0071e3] transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HotelCard = ({ hotel, isRecommended, rank, onClick, isSelected }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        hotel-card group relative flex flex-col sm:flex-row gap-5 p-3 rounded-2xl cursor-pointer transition-all duration-300
        ${isSelected 
          ? 'bg-white ring-1 ring-black/5 shadow-xl scale-[1.01]' 
          : 'bg-white hover:bg-gray-50 border border-transparent hover:border-gray-200 hover:shadow-lg'
        }
      `}
    >
      <div className="w-full sm:w-40 h-40 shrink-0 rounded-xl overflow-hidden relative">
        <img 
          src={hotel.photos[0]} 
          alt={hotel.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {isRecommended && (
          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 text-black">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            #{rank} Top Pick
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col py-1 pr-2">
        <div className="flex justify-between items-start">
          <div className="w-full">
            <h4 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
              {hotel.name}
            </h4>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                <Star className="w-3.5 h-3.5 text-black fill-black" />
                {hotel.rating}
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500 font-medium">{hotel.user_ratings_total} reviews</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed font-medium">
          {hotel.vicinity}
        </p>
        
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            {(hotel.distanceMeters / 1000).toFixed(1)} km away
          </div>
          
          <button className="text-sm font-bold text-black flex items-center gap-1 group-hover:gap-2 transition-all opacity-0 group-hover:opacity-100">
            View Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelRecommendations;
