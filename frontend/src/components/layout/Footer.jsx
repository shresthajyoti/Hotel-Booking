import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#F5F5F7] text-[#1D1D1F] pt-16 pb-8 text-[12px] leading-relaxed">
      <div className="container mx-auto px-6">

        {/* Top Section: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12 border-b border-gray-200 pb-12">

          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-[#1D1D1F] rounded-md flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-lg font-semibold tracking-tight">Roomora</span>
            </Link>
            <p className="text-[#86868B] max-w-xs mb-6">
              Experience the finest hotels in Nepal. Curated stays, exceptional service, and unforgettable memories.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[#86868B] hover:text-[#1D1D1F] transition-colors"><Facebook size={18} /></a>
              <a href="#" className="text-[#86868B] hover:text-[#1D1D1F] transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-[#86868B] hover:text-[#1D1D1F] transition-colors"><Instagram size={18} /></a>
              <a href="#" className="text-[#86868B] hover:text-[#1D1D1F] transition-colors"><Linkedin size={18} /></a>
            </div>
          </div>

          {/* Column 1 */}
          <div>
            <h3 className="font-semibold text-[#1D1D1F] mb-4">Shop and Learn</h3>
            <ul className="space-y-2 text-[#86868B]">
              <li><Link to="/search" className="hover:underline">Find a Stay</Link></li>
              <li><Link to="/rooms" className="hover:underline">Rooms</Link></li>
              <li><Link to="/services" className="hover:underline">Services</Link></li>
              <li><Link to="/map" className="hover:underline">Map</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-semibold text-[#1D1D1F] mb-4">Account</h3>
            <ul className="space-y-2 text-[#86868B]">
              <li><Link to="/login" className="hover:underline">Manage Your ID</Link></li>
              <li>
                {localStorage.getItem('isAuthenticated') === 'true' ? (
                  localStorage.getItem('userType') === 'owner' ? (
                    <Link to="/dashboard" className="hover:underline">Hotel Owner Dashboard</Link>
                  ) : null
                ) : (
                  <Link to="/dashboard" className="hover:underline">Hotel Owner Dashboard</Link>
                )}
              </li>
              <li><Link to="/signup" className="hover:underline">Create Account</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-semibold text-[#1D1D1F] mb-4">About Roomora</h3>
            <ul className="space-y-2 text-[#86868B]">
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:underline">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[#86868B]">
          <p>
            Copyright © {new Date().getFullYear()} Roomora Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:underline hover:text-[#1D1D1F]">Privacy Policy</Link>
            <Link to="/terms" className="hover:underline hover:text-[#1D1D1F]">Terms of Use</Link>
            <Link to="/sales" className="hover:underline hover:text-[#1D1D1F]">Sales and Refunds</Link>
            <Link to="/legal" className="hover:underline hover:text-[#1D1D1F]">Legal</Link>
            <Link to="/sitemap" className="hover:underline hover:text-[#1D1D1F]">Site Map</Link>
          </div>
          <p className="text-[#86868B]">
            Nepal
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
