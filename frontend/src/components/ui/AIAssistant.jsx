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
      text: `Hi! I'll help you find the perfect hotel in Nepal. We have ${hotels.length} properties across 5 locations.\n\nWhere would you like to stay?`, 
      sender: 'ai',
      timestamp: new Date(),
      suggestions: [
        `Kathmandu (${hotels.filter(h => h.location.includes('Kathmandu')).length} hotels)`,
        `Pokhara (${hotels.filter(h => h.location.includes('Pokhara')).length} hotels)`,
        `Chitwan (${hotels.filter(h => h.location.includes('Chitwan')).length} hotels)`,
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

  const generateAIResponse = async (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // If no API key is configured, fall back to local logic
    if (!mistralClient.current) {
      return generateLocalResponse(message);
    }

    try {
      // Build detailed hotel data for AI context
      const hotelsByLocation = {
        kathmandu: hotels.filter(h => h.location.includes('Kathmandu')),
        pokhara: hotels.filter(h => h.location.includes('Pokhara')),
        chitwan: hotels.filter(h => h.location.includes('Chitwan')),
        lumbini: hotels.filter(h => h.location.includes('Lumbini')),
        nagarkot: hotels.filter(h => h.location.includes('Nagarkot'))
      };

      // Create a comprehensive hotel database string
      const hotelDatabase = hotels.map(h => 
        `${h.name} (${h.location}) - Rs.${h.price}/night, Rating: ${h.rating}/5, Amenities: ${h.amenities.join(', ')}, Description: ${h.description}`
      ).join('\n');

      const hotelContext = `You are a helpful hotel booking assistant for a Nepal hotel booking platform. Answer questions SHORT and SWEET.

HOTEL DATABASE (${hotels.length} total):
${hotelDatabase}

LOCATION SUMMARY:
- Kathmandu: ${hotelsByLocation.kathmandu.length} hotels (Rs.${Math.min(...hotelsByLocation.kathmandu.map(h => h.price)).toLocaleString()} - Rs.${Math.max(...hotelsByLocation.kathmandu.map(h => h.price)).toLocaleString()})
- Pokhara: ${hotelsByLocation.pokhara.length} hotels (Rs.${Math.min(...hotelsByLocation.pokhara.map(h => h.price)).toLocaleString()} - Rs.${Math.max(...hotelsByLocation.pokhara.map(h => h.price)).toLocaleString()})
- Chitwan: ${hotelsByLocation.chitwan.length} hotels (Rs.${Math.min(...hotelsByLocation.chitwan.map(h => h.price)).toLocaleString()} - Rs.${Math.max(...hotelsByLocation.chitwan.map(h => h.price)).toLocaleString()})
- Lumbini: ${hotelsByLocation.lumbini.length} hotels (Rs.${Math.min(...hotelsByLocation.lumbini.map(h => h.price)).toLocaleString()})
- Nagarkot: ${hotelsByLocation.nagarkot.length} hotels (Rs.${Math.min(...hotelsByLocation.nagarkot.map(h => h.price)).toLocaleString()})

HOW TO BOOK:
1. Browse hotels or use this AI assistant to find the perfect hotel
2. Click on a hotel card to view full details
3. Click "Book Now" button on the hotel details page
4. Fill in your booking details (check-in, check-out, guests)
5. Review your booking and confirm
6. Complete payment to secure your reservation

BOOKING INFORMATION:
- Payment Methods: Credit/Debit cards, Online banking, Mobile wallets
- Cancellation: Free cancellation up to 24 hours before check-in
- Check-in Time: 2:00 PM
- Check-out Time: 12:00 PM
- ID Required: Valid government ID at check-in
- Confirmation: Instant booking confirmation via email

PLATFORM FEATURES:
- AI-powered hotel recommendations
- Real-time availability
- Secure payment processing
- 24/7 customer support
- Best price guarantee
- Easy cancellation and modifications

CONVERSATION STATE:
- Selected location: ${userPreferences.location || 'none'}
- Budget: ${userPreferences.budget ? JSON.stringify(userPreferences.budget) : 'none'}
- Step: ${conversationStep}

RESPONSE RULES:
1. Keep responses SHORT (2-3 sentences) unless user asks for "more details" or "tell me more"
2. If user asks "more details", "tell me more", or "explain", provide comprehensive information (up to 5-6 sentences)
3. Use ONLY data from the hotel database and booking information above
4. Be specific with hotel names, prices, and amenities
5. Answer booking questions (how to book, payment, cancellation) clearly
6. Always be helpful and friendly
7. If asked about specific hotels, provide their description too`;

      // Format conversation history for Mistral
      // Take last 10 messages to maintain context without exceeding token limits
      const historyMessages = messages.slice(-10).map(msg => ({
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
        temperature: 0.5,
        maxTokens: message.includes('more') || message.includes('detail') || message.includes('tell me') || message.includes('explain') ? 300 : 150
      });

      const aiText = chatResponse.choices[0].message.content;

      // Parse the AI response and determine next steps
      if (conversationStep === 'location') {
        const locations = ['kathmandu', 'pokhara', 'chitwan', 'lumbini', 'nagarkot'];
        const foundLocation = locations.find(loc => message.includes(loc));
        
        if (foundLocation || message.includes('all')) {
          setUserPreferences(prev => ({ ...prev, location: foundLocation || 'all' }));
          setConversationStep('budget');
          
          return {
            text: aiText,
            suggestions: [
              "Under Rs. 10,000",
              "Rs. 10,000 - 20,000",
              "Above Rs. 20,000",
              "Any budget"
            ]
          };
        }
        
        return {
          text: aiText,
          suggestions: [
            `Kathmandu (${hotels.filter(h => h.location.includes('Kathmandu')).length} hotels)`,
            `Pokhara (${hotels.filter(h => h.location.includes('Pokhara')).length} hotels)`,
            `Chitwan (${hotels.filter(h => h.location.includes('Chitwan')).length} hotels)`,
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
          const recommendations = getRecommendations(budgetRange);
          return {
            text: aiText,
            ...recommendations
          };
        }
        
        return {
          text: aiText,
          suggestions: [
            "Under Rs. 10,000",
            "Rs. 10,000 - 20,000",
            "Above Rs. 20,000",
            "Any budget"
          ]
        };
      }

      if (message.includes('change location') || message.includes('start over')) {
        setUserPreferences({ location: null, budget: null });
        setConversationStep('location');
        return {
          text: aiText,
          suggestions: [
            `Kathmandu (${hotels.filter(h => h.location.includes('Kathmandu')).length} hotels)`,
            `Pokhara (${hotels.filter(h => h.location.includes('Pokhara')).length} hotels)`,
            "Show all hotels"
          ]
        };
      }

      if (message.includes('show') || message.includes('recommend')) {
        const recommendations = getRecommendations();
        return {
          text: aiText,
          ...recommendations
        };
      }

      // For general questions (amenities, prices, ratings, booking info, etc.), just return AI response
      // The AI has full hotel database and booking information
      const generalQuestions = [
        'which', 'what', 'how many', 'how to', 'how do', 'how can',
        'cheapest', 'expensive', 'best', 'worst', 'top',
        'spa', 'pool', 'restaurant', 'gym', 'wifi', 'parking',
        'rating', 'price', 'amenities', 'facilities',
        'tell me', 'explain', 'describe', 'more details', 'more about',
        'book', 'booking', 'reserve', 'reservation',
        'payment', 'pay', 'credit card', 'debit',
        'cancel', 'cancellation', 'refund',
        'check-in', 'check-out', 'checkout', 'checkin',
        'policy', 'policies', 'rules',
        'contact', 'support', 'help',
        'available', 'availability'
      ];
      const isGeneralQuestion = generalQuestions.some(q => message.includes(q));
      
      if (isGeneralQuestion) {
        return {
          text: aiText,
          suggestions: conversationStep === 'location' 
            ? ["Kathmandu", "Pokhara", "Chitwan", "Show all hotels"]
            : conversationStep === 'budget'
            ? ["Under Rs. 10,000", "Rs. 10,000 - 20,000", "Above Rs. 20,000"]
            : ["Start over", "Show all hotels"]
        };
      }

      return {
        text: aiText,
        suggestions: ["Start over", "Show all hotels"]
      };

    } catch (error) {
      console.error('Mistral AI Error:', error);
      // Fallback to local logic if API fails
      return generateLocalResponse(message);
    }
  };

  // Fallback local response function
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

    if (message.includes('show') || message.includes('recommend')) {
      return getRecommendations();
    }

    return {
      text: "I'm here to help you find the perfect hotel!",
      suggestions: ["Start over", "Show all hotels"]
    };
  };

  const getRecommendations = (budgetOverride = null) => {
    let filteredHotels = hotels;
    const budget = budgetOverride || userPreferences.budget;

    // Filter by location
    if (userPreferences.location && userPreferences.location !== 'all') {
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

    filteredHotels.sort((a, b) => b.rating - a.rating);
    const topHotels = filteredHotels.slice(0, 6);

    if (topHotels.length === 0) {
      return {
        text: "No hotels found. Let me show you our best options!",
        suggestions: ["Show all hotels", "Change location"],
        hotels: hotels.slice(0, 4)
      };
    }

    return {
      text: `Found ${topHotels.length} amazing hotels for you!`,
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
      // Add a small delay for better UX
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
        text: "I'm having trouble connecting right now. Please try again!",
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
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
          <div 
            ref={panelRef}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] opacity-0 scale-95"
          >
            <div className="p-5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AI Assistant</h3>
                  <p className="text-xs text-gray-500">Powered by Mistral AI</p>
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
              {messages.length === 1 && !isTyping && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-32 h-32 mb-6 relative">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                    <div className="absolute inset-4 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-80"></div>
                    <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
                      <Sparkles size={32} className="text-blue-600" />
                    </div>
                  </div>
                  <p className="text-center text-gray-600 mb-8 max-w-sm">
                    {messages[0].text}
                  </p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={msg.id}>
                  {idx > 0 && msg.sender === 'user' && (
                    <div className="flex justify-end mb-4">
                      <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%]">
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  )}
                  
                  {msg.sender === 'ai' && idx > 0 && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <p className="text-sm text-gray-700">{msg.text}</p>
                      </div>

                      {msg.suggestions && (
                        <div className="flex flex-wrap gap-2">
                          {msg.suggestions.map((suggestion, sidx) => (
                            <button
                              key={sidx}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-sm font-medium transition-all hover:shadow-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}

                      {msg.hotels && msg.hotels.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          {msg.hotels.map(hotel => (
                            <HotelCard key={hotel.id} hotel={hotel} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {messages.length === 1 && messages[0].suggestions && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {messages[0].suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-sm font-medium transition-all hover:shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                  <button
                    onClick={() => handleSuggestionClick("Show more")}
                    className="px-4 py-2.5 text-blue-600 text-sm font-medium"
                  >
                    Show more
                  </button>
                </div>
              )}

              {isTyping && (
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="p-5 border-t border-gray-100">
              <form id="ai-chat-form" onSubmit={handleSendMessage}>
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-2 pr-3">
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me anything..." 
                    className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm placeholder:text-gray-400"
                  />
                  <button 
                    type="submit" 
                    disabled={!inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
