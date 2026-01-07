import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled || isOpen ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50' : 'bg-transparent'
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
          {localStorage.getItem('isAuthenticated') === 'true' ? (
            <>
              <Link 
                to={localStorage.getItem('userType') === 'owner' ? '/dashboard' : '/portal'} 
                className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all ${
                  scrolled || location.pathname !== '/' 
                    ? 'text-[#1D1D1F] hover:bg-gray-100' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {localStorage.getItem('userType') === 'owner' ? 'Dashboard' : 'My Portal'}
              </Link>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className={`px-5 py-2 rounded-full text-[12px] font-medium transition-all ${
                  scrolled || location.pathname !== '/'
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
                className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all ${
                  scrolled || location.pathname !== '/' 
                    ? 'text-[#1D1D1F] hover:bg-gray-100' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Login
              </Link>
              <Link 
                to="/contact" 
                className={`px-5 py-2 rounded-full text-[12px] font-medium transition-all ${
                  scrolled || location.pathname !== '/'
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
             {localStorage.getItem('isAuthenticated') === 'true' ? (
               <>
                 <Link 
                   to={localStorage.getItem('userType') === 'owner' ? '/dashboard' : '/portal'} 
                   className="text-center text-sm font-medium text-[#1D1D1F]"
                 >
                   {localStorage.getItem('userType') === 'owner' ? 'Dashboard' : 'My Portal'}
                 </Link>
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
