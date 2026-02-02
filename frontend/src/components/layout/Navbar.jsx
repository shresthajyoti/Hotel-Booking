import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, User } from 'lucide-react';
import api from '../../utils/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasBookings, setHasBookings] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userType = localStorage.getItem('userType');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNavbarData();
      // Setup polling for notifications
      const interval = setInterval(fetchNavbarData, 60000); // Every 60 seconds
      return () => clearInterval(interval);
    }
  }, [location, isAuthenticated]);

  const fetchNavbarData = async () => {
    try {
      const [notifRes, bookingsRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/dashboard/bookings')
      ]);

      if (notifRes.data.success) {
        setNotifications(notifRes.data.data || []);
        setUnreadCount((notifRes.data.data || []).filter(n => !n.isRead).length);
      }

      if (bookingsRes.data.success) {
        setHasBookings(bookingsRes.data.data.length > 0);
      }
    } catch (error) {
      console.error("Error fetching navbar data:", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put(`/notifications/read-all`);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled || isOpen ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50' : 'bg-transparent'
        } py-4`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#1D1D1F] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className={`text-xl font-semibold tracking-tight transition-colors ${scrolled || isOpen || location.pathname !== '/' ? 'text-[#1D1D1F]' : 'text-white'}`}>
            Roomora
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className={`hidden md:flex items-center space-x-8 text-[13px] font-medium tracking-wide ${scrolled || location.pathname !== '/' ? 'text-[#1D1D1F]/80' : 'text-white/90'}`}>
          <Link
            to="/"
            className={`transition-colors hover:text-[#1D1D1F] ${location.pathname === '/' ? 'text-[#1D1D1F]' : ''} ${!scrolled && location.pathname === '/' ? 'hover:text-white' : ''}`}
          >
            Homepage
          </Link>
          <Link
            to="/search"
            className={`transition-colors hover:text-[#1D1D1F] ${location.pathname === '/search' ? 'text-[#1D1D1F]' : ''} ${!scrolled && location.pathname === '/' ? 'hover:text-white' : ''}`}
          >
            Find a Stay
          </Link>
          <Link
            to="/about"
            className={`transition-colors hover:text-[#1D1D1F] ${location.pathname === '/about' ? 'text-[#1D1D1F]' : ''} ${!scrolled && location.pathname === '/' ? 'hover:text-white' : ''}`}
          >
            About
          </Link>
          <Link
            to="/rooms"
            className={`transition-colors hover:text-[#1D1D1F] ${location.pathname === '/rooms' ? 'text-[#1D1D1F]' : ''} ${!scrolled && location.pathname === '/' ? 'hover:text-white' : ''}`}
          >
            Rooms
          </Link>
          <Link
            to="/map"
            className={`transition-colors hover:text-[#1D1D1F] ${location.pathname === '/map' ? 'text-[#1D1D1F]' : ''} ${!scrolled && location.pathname === '/' ? 'hover:text-white' : ''}`}
          >
            Map
          </Link>
          <Link
            to="/services"
            className={`transition-colors hover:text-[#1D1D1F] ${location.pathname === '/services' ? 'text-[#1D1D1F]' : ''} ${!scrolled && location.pathname === '/' ? 'hover:text-white' : ''}`}
          >
            Services
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {(userType === 'owner' || (userType === 'traveler' && hasBookings)) && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2 rounded-full transition-all relative ${scrolled || location.pathname !== '/' || showNotifications
                      ? 'text-[#1D1D1F] hover:bg-gray-100'
                      : 'text-white hover:bg-white/10'
                      } ${showNotifications ? (scrolled || location.pathname !== '/' ? 'bg-gray-100' : 'bg-white/20') : ''}`}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                        <button onClick={handleMarkAllRead} className="text-[11px] font-semibold text-[#0071e3] hover:underline">Mark all read</button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => handleMarkAsRead(notif._id)}
                              className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group relative ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                            >
                              {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0071e3]"></div>}
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'booking' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                  <Bell size={14} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[13px] font-bold text-gray-900 leading-tight mb-1">{notif.title}</p>
                                  <p className="text-xs text-gray-600 leading-normal">{notif.message}</p>
                                  <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                    {new Date(notif.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Bell size={20} className="text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">No new notifications</p>
                          </div>
                        )}
                      </div>
                      {/* Portal link removed as per user request */}
                    </div>
                  )}
                </div>
              )}

              {/* Profile button removed as per user request */}
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className={`px-5 py-2 rounded-full text-[12px] font-medium transition-all ${scrolled || location.pathname !== '/'
                  ? 'bg-[#1D1D1F] text-white hover:bg-black shadow-sm'
                  : 'bg-white text-[#1D1D1F] hover:bg-gray-100 shadow-lg'
                  }`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all ${scrolled || location.pathname !== '/'
                  ? 'text-[#1D1D1F] hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
                  }`}
              >
                Login
              </Link>
              <Link
                to="/contact"
                className={`px-5 py-2 rounded-full text-[12px] font-medium transition-all ${scrolled || location.pathname !== '/'
                  ? 'bg-[#1D1D1F] text-white hover:bg-black shadow-sm'
                  : 'bg-white text-[#1D1D1F] hover:bg-gray-100 shadow-lg'
                  }`}
              >
                Contact
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden transition-colors ${scrolled || isOpen || location.pathname !== '/' ? 'text-[#1D1D1F]' : 'text-white'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl shadow-lg py-6 px-6 flex flex-col space-y-4 border-t border-gray-100">
          <Link
            to="/"
            className={`font-medium text-sm ${location.pathname === '/' ? 'text-[#1D1D1F]' : 'text-gray-500'}`}
          >
            Homepage
          </Link>
          <Link
            to="/search"
            className={`font-medium text-sm ${location.pathname === '/search' ? 'text-[#1D1D1F]' : 'text-gray-500'}`}
          >
            Find a Stay
          </Link>
          <Link
            to="/about"
            className={`font-medium text-sm ${location.pathname === '/about' ? 'text-[#1D1D1F]' : 'text-gray-500'}`}
          >
            About
          </Link>
          <Link
            to="/rooms"
            className={`font-medium text-sm ${location.pathname === '/rooms' ? 'text-[#1D1D1F]' : 'text-gray-500'}`}
          >
            Rooms
          </Link>
          <Link
            to="/map"
            className={`font-medium text-sm ${location.pathname === '/map' ? 'text-[#1D1D1F]' : 'text-gray-500'}`}
          >
            Map
          </Link>
          <Link
            to="/services"
            className={`font-medium text-sm ${location.pathname === '/services' ? 'text-[#1D1D1F]' : 'text-gray-500'}`}
          >
            Services
          </Link>
          <div className="pt-4 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                {(userType === 'owner' || (userType === 'traveler' && hasBookings)) && (
                  <Link
                    to={userType === 'owner' ? "/dashboard" : "/portal"}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 text-sm font-medium text-[#1D1D1F]"
                  >
                    <Bell size={16} /> My Notifications
                    {unreadCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">{unreadCount}</span>
                    )}
                  </Link>
                )}
                {/* Account link removed as per user request */}
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/login';
                  }}
                  className="bg-[#1D1D1F] text-white px-6 py-3 rounded-full text-center text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-center text-sm font-medium text-gray-600">
                  Login
                </Link>
                <Link to="/contact" className="bg-[#1D1D1F] text-white px-6 py-3 rounded-full text-center text-sm font-medium">
                  Contact
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
