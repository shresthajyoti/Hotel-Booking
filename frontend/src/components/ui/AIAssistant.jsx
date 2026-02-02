import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, MapPin, Star, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { hotels } from '../../data/hotels';
import { Mistral } from '@mistralai/mistralai';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hi! I'm your Roomora AI assistant. I'll help you find the perfect hotel in Nepal. We have ${hotels.length} properties across several locations.\n\nWhere would you like to stay?`,
      sender: 'ai',
      timestamp: new Date(),
      suggestions: [
        "Use my location",
        `Kathmandu (${hotels.filter(h => h.location.includes('Kathmandu')).length} hotels)`,
        `Pokhara (${hotels.filter(h => h.location.includes('Pokhara')).length} hotels)`,
        "Show all hotels"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    location: null,
    budget: null
  });
  const [userCoords, setUserCoords] = useState(null);
  const [conversationStep, setConversationStep] = useState('location');

  const panelRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      gsap.to(panelRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize Mistral AI client
  const mistralClient = useRef(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
    if (apiKey && apiKey !== 'your_mistral_api_key_here') {
      mistralClient.current = new Mistral({ apiKey });
    }
  }, []);

  // Helper: Calculate distance between two coordinates in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleUseLocation = () => {
    if ("geolocation" in navigator) {
      setIsTyping(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setUserCoords(coords);

          // Send automated message about finding nearby hotels
          const userMsg = "Find hotels near me";
          handleSendAutomatedMessage(userMsg, coords);
        },
        (error) => {
          console.error("Error getting location:", error);
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: "I couldn't access your location. Please check your browser permissions.",
            sender: 'ai',
            timestamp: new Date(),
            suggestions: ["Search Kathmandu", "Search Pokhara"]
          }]);
          setIsTyping(false);
        }
      );
    }
  };

  const handleSendAutomatedMessage = async (text, coords = null) => {
    const newUserMessage = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    try {
      const response = await generateAIResponse(text, coords);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        ...response,
        sender: 'ai',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = async (userMessage, coordsOverride = null) => {
    const message = userMessage.toLowerCase();
    const currentCoords = coordsOverride || userCoords;

    // If no API key is configured, fall back to local logic
    if (!mistralClient.current) {
      return generateLocalResponse(message);
    }

    try {
      const hotelsByLocation = {
        kathmandu: hotels.filter(h => h.location.includes('Kathmandu')),
        pokhara: hotels.filter(h => h.location.includes('Pokhara')),
        chitwan: hotels.filter(h => h.location.includes('Chitwan')),
      };

      const hotelDatabase = hotels.map(h =>
        `${h.name} (${h.location}) - Rs.${h.price}/night, Rating: ${h.rating}/5, Amenities: ${h.amenities.join(', ')}`
      ).join('\n');

      const hotelContext = `You are Roomora's helpful AI assistant for Nepal hotel bookings. 
Answer questions SHORT and SWEET (2 sentences max). 

HOTEL DATABASE:
${hotelDatabase}

RULES:
1. Always end your response with exactly 3-4 relevant suggestion chips in this format: [SUGGESTIONS: Suggestion 1, Suggestion 2, Suggestion 3]
2. Suggestions should be very short clickable topics (e.g., "Kathmandu Hotels", "Under Rs. 10000", "Top Rated").
3. Be friendly and professional.`;

      const historyMessages = messages.slice(-6).map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.text
      }));

      const chatResponse = await mistralClient.current.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: hotelContext },
          ...historyMessages,
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        maxTokens: 300
      });

      const aiFullText = chatResponse.choices[0].message.content;

      let aiText = aiFullText;
      let dynamicSuggestions = [];
      const suggestionsMatch = aiFullText.match(/\[SUGGESTIONS:\s*(.*?)\]/i);

      if (suggestionsMatch) {
        aiText = aiFullText.replace(suggestionsMatch[0], '').trim();
        dynamicSuggestions = suggestionsMatch[1].split(',').map(s => s.trim()).filter(s => s);
      }

      // Check for search intent to show hotel cards
      let recommendedHotels = [];
      const searchKeywords = ['show', 'recommend', 'find', 'best', 'cheap', 'hotels in', 'stay in', 'under', 'below', 'price', 'rs'];

      if (searchKeywords.some(kw => message.includes(kw))) {
        let tempBudget = null;

        // Extract budget from message (e.g., "under 1000", "below 5000")
        const budgetMatch = message.match(/(?:under|below|rs\.?|price)\s*([\d,]+)/i);
        if (budgetMatch) {
          const amount = parseInt(budgetMatch[1].replace(/,/g, ''));
          if (!isNaN(amount)) {
            tempBudget = { max: amount };
            // Also update persistent preference if it's a clear budget request
            if (message.includes('under') || message.includes('below')) {
              setUserPreferences(p => ({ ...p, budget: tempBudget }));
            }
          }
        }

        // Simple location extraction for quick recommendation refinement
        if (message.includes('kathmandu')) setUserPreferences(p => ({ ...p, location: 'kathmandu' }));
        else if (message.includes('pokhara')) setUserPreferences(p => ({ ...p, location: 'pokhara' }));
        else if (message.includes('chitwan')) setUserPreferences(p => ({ ...p, location: 'chitwan' }));

        const recommendations = getRecommendations(tempBudget, currentCoords);
        recommendedHotels = recommendations.hotels || [];
      }

      if (message.includes('near me') || message.includes('nearby')) {
        const recommendations = getRecommendations(null, currentCoords);
        recommendedHotels = recommendations.hotels || [];
        if (recommendedHotels.length > 0) {
          aiText = `Showing ${recommendedHotels.length} hotels closest to your current location!`;
        }
      }

      if (dynamicSuggestions.length === 0) {
        dynamicSuggestions = ["Kathmandu Hotels", "Pokhara Hotels", "Best Rated", "Start over"];
      }

      return {
        text: aiText,
        suggestions: dynamicSuggestions,
        hotels: recommendedHotels
      };

    } catch (error) {
      console.error('Mistral AI Error:', error);
      return generateLocalResponse(message);
    }
  };

  const generateLocalResponse = (message) => {
    if (message.includes('change location') || message.includes('start over')) {
      setUserPreferences({ location: null, budget: null });
      setConversationStep('location');
      return {
        text: `Let's start fresh! Where would you like to stay?`,
        suggestions: [
          `Kathmandu (${hotels.filter(h => h.location.includes('Kathmandu')).length} hotels)`,
          `Pokhara (${hotels.filter(h => h.location.includes('Pokhara')).length} hotels)`,
          `Chitwan (${hotels.filter(h => h.location.includes('Chitwan')).length} hotels)`,
          "Show all hotels"
        ]
      };
    }

    if (conversationStep === 'location') {
      const locations = ['kathmandu', 'pokhara', 'chitwan', 'lumbini', 'nagarkot'];
      const foundLocation = locations.find(loc => message.includes(loc));

      if (foundLocation || message.includes('all')) {
        setUserPreferences(prev => ({ ...prev, location: foundLocation || 'all' }));
        setConversationStep('budget');

        let locationHotels = hotels;
        if (foundLocation) {
          locationHotels = hotels.filter(h => h.location.toLowerCase().includes(foundLocation));
        }
        const prices = locationHotels.map(h => h.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        return {
          text: `Great! I found ${locationHotels.length} hotels in ${foundLocation ? foundLocation.charAt(0).toUpperCase() + foundLocation.slice(1) : 'Nepal'}.\n\nPrices range from Rs. ${minPrice.toLocaleString()} to Rs. ${maxPrice.toLocaleString()} per night.\n\nWhat's your budget?`,
          suggestions: [
            "Under Rs. 10,000",
            "Rs. 10,000 - 20,000",
            "Above Rs. 20,000",
            "Any budget"
          ]
        };
      }

      return {
        text: "Which location interests you?",
        suggestions: [
          `Kathmandu (${hotels.filter(h => h.location.includes('Kathmandu')).length} hotels)`,
          `Pokhara (${hotels.filter(h => h.location.includes('Pokhara')).length} hotels)`,
          "Show all hotels"
        ]
      };
    }

    if (conversationStep === 'budget') {
      let budgetRange = null;

      if (message.includes('under')) {
        budgetRange = { max: 10000 };
      } else if (message.includes('10,000') && message.includes('20,000')) {
        budgetRange = { min: 10000, max: 20000 };
      } else if (message.includes('above')) {
        budgetRange = { min: 20000 };
      } else if (message.includes('any')) {
        budgetRange = { any: true };
      }

      if (budgetRange) {
        setUserPreferences(prev => ({ ...prev, budget: budgetRange }));
        setConversationStep('recommend');
        return getRecommendations(budgetRange);
      }

      return {
        text: "Please select a budget range:",
        suggestions: [
          "Under Rs. 10,000",
          "Rs. 10,000 - 20,000",
          "Above Rs. 20,000",
          "Any budget"
        ]
      };
    }

    if (message.includes('near me') || message.includes('nearby')) {
      if (!userCoords) {
        return {
          text: "I need your location to find nearby hotels! Click 'Use my location' below.",
          suggestions: ["Use my location", "Show all hotels"]
        };
      }
      return getRecommendations();
    }

    return {
      text: "I'm here to help you find the perfect hotel! You can ask about locations, prices, or specific amenities.",
      suggestions: ["Use my location", "Kathmandu Hotels", "Pokhara Hotels", "Start over"]
    };
  };

  const getRecommendations = (budgetOverride = null, coordsOverride = null) => {
    let filteredHotels = [...hotels];
    const budget = budgetOverride || userPreferences.budget;
    const coords = coordsOverride || userCoords;

    // Sorting by proximity if location is shared
    if (coords) {
      filteredHotels = filteredHotels.map(h => ({
        ...h,
        distance: calculateDistance(coords.lat, coords.lon, h.latitude, h.longitude)
      })).sort((a, b) => a.distance - b.distance);
    } else {
      filteredHotels.sort((a, b) => b.rating - a.rating);
    }

    // Filter by location if not doing proximity search
    if (!coords && userPreferences.location && userPreferences.location !== 'all') {
      filteredHotels = filteredHotels.filter(h =>
        h.location.toLowerCase().includes(userPreferences.location)
      );
    }

    // Filter by budget
    if (budget && !budget.any) {
      filteredHotels = filteredHotels.filter(h => {
        if (budget.max && !budget.min) {
          return h.price < budget.max;
        }
        if (budget.min && !budget.max) {
          return h.price > budget.min;
        }
        if (budget.min && budget.max) {
          return h.price >= budget.min && h.price <= budget.max;
        }
        return true;
      });
    }

    const topHotels = filteredHotels.slice(0, 6);

    if (topHotels.length === 0) {
      const isBudgetSearch = !!(budget && !budget.any);
      return {
        text: isBudgetSearch
          ? "I couldn't find any hotels within that budget. Would you like to see our most affordable options instead?"
          : "No hotels found matching your exact criteria. Here are our best properties!",
        suggestions: isBudgetSearch
          ? ["Show affordable hotels", "Change location", "Start over"]
          : ["Show all hotels", "Change location"],
        hotels: isBudgetSearch ? [] : hotels.slice(0, 4)
      };
    }

    const locationText = coords ? "closest to you" : "matching your preferences";
    return {
      text: `Found ${topHotels.length} amazing hotels ${locationText}!`,
      suggestions: ["Show more", "Refine search", "Start over"],
      hotels: topHotels
    };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessageText = inputValue;
    const newUserMessage = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const aiResponseData = await generateAIResponse(userMessageText);
      const aiResponse = {
        id: Date.now() + 1,
        ...aiResponseData,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting to my brain right now. Please try again!",
        sender: 'ai',
        timestamp: new Date(),
        suggestions: ["Start over", "Show all hotels"]
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion === "Use my location") {
      handleUseLocation();
      return;
    }
    setInputValue(suggestion);
    setTimeout(() => {
      const form = document.querySelector('#ai-chat-form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };

  const HotelCard = ({ hotel }) => {
    const handleViewDetails = () => {
      setIsOpen(false);
      setTimeout(() => {
        navigate(`/hotel/${hotel.id}`);
      }, 100);
    };

    const handleBookNow = () => {
      localStorage.setItem('selectedHotel', JSON.stringify(hotel));
      setIsOpen(false);
      setTimeout(() => {
        navigate('/booking');
      }, 100);
    };

    return (
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="relative h-40 overflow-hidden">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold">{hotel.rating}</span>
          </div>
        </div>
        <div className="p-4">
          <h4 className="font-bold text-base text-gray-900 mb-1.5">{hotel.name}</h4>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <MapPin size={12} />
            {hotel.location}
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-gray-900">Rs. {hotel.price.toLocaleString()}</span>
            <span className="text-xs text-gray-500">/night</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleViewDetails}
              className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-xl transition-colors"
            >
              Details
            </button>
            <button
              onClick={handleBookNow}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              Book <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-2xl transition-all hover:scale-105 ${isOpen ? 'hidden' : 'flex'} items-center gap-2`}
      >
        <Sparkles size={24} />
        <span className="font-bold hidden md:inline">Ask AI</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div
            ref={panelRef}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] opacity-0 scale-95 overflow-hidden"
          >
            <div className="p-5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Roomora AI</h3>
                  <p className="text-xs text-gray-500">Smart Hotel Recommendations</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, idx) => (
                <div key={msg.id}>
                  {msg.sender === 'user' ? (
                    <div className="flex justify-end mb-4">
                      <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%] shadow-sm">
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <Sparkles size={16} className="text-blue-600" />
                        </div>
                        <div className="bg-gray-50 rounded-2xl rounded-tl-md p-4 max-w-[85%]">
                          <p className="text-sm text-gray-700 leading-relaxed whitesp-pre-wrap">{msg.text}</p>
                        </div>
                      </div>

                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 ml-11">
                          {msg.suggestions.map((suggestion, sidx) => (
                            <button
                              key={sidx}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="px-4 py-2 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-gray-700 hover:text-blue-600 rounded-full text-sm font-medium transition-all hover:shadow-sm active:scale-95"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}

                      {msg.hotels && msg.hotels.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11 mt-4">
                          {msg.hotels.map(hotel => (
                            <HotelCard key={hotel.id} hotel={hotel} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="text-blue-600 animate-pulse" />
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-5 border-t border-gray-100 bg-white">
              <form id="ai-chat-form" onSubmit={handleSendMessage}>
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-2 pr-3 border border-gray-100 focus-within:border-blue-300 transition-colors">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about hotels, prices, or locations..."
                    className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
              <p className="text-[10px] text-center text-gray-400 mt-3">
                Roomora AI uses Mistral AI. Recommendations depend on your Mistral API key set in .env
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
