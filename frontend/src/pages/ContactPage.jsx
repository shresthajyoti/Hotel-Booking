import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import gsap from 'gsap';

const ContactPage = () => {
  const headerRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    gsap.fromTo(headerRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    gsap.fromTo(".contact-card", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.3, ease: "power2.out" }
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Hero Section with Map and Form */}
      <div className="relative pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Side - Map and Location Info */}
            <div ref={headerRef}>
              <div className="mb-10">
                <p className="text-xs font-semibold text-[#86868B] mb-2 uppercase tracking-widest">Our Location</p>
                <h1 className="text-5xl md:text-6xl font-semibold text-[#1D1D1F] mb-6 tracking-tight">Connecting Near and Far</h1>
              </div>

              {/* Headquarters Info */}
              <div className="bg-white rounded-4xl p-8 mb-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#F5F5F7] rounded-full flex items-center justify-center">
                    <MapPin className="text-[#1D1D1F]" size={20} />
                  </div>
                  <h3 className="font-semibold text-[#1D1D1F] text-lg">Headquarters</h3>
                </div>
                <p className="text-[#1D1D1F] font-medium text-lg mb-1">Roomora Inc.</p>
                <p className="text-[#86868B]">Thamel, Kathmandu, Nepal</p>
                <p className="text-[#86868B] mb-4">Post Box: 44600</p>
                <button className="text-[#0071E3] text-sm font-medium hover:underline flex items-center gap-1">
                  Open Google Maps <span className="text-lg">→</span>
                </button>
              </div>

              {/* Map */}
              <div className="bg-white rounded-4xl overflow-hidden h-80 shadow-sm border border-gray-100 p-2">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.043881095522!2d85.31015!3d27.715317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb191a03d69e11%3A0x5f7f6b7b3eadf3c3!2sThamel%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '1.5rem' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Roomora Location"
                ></iframe>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-white">
              <h2 className="text-3xl font-semibold text-[#1D1D1F] mb-2 tracking-tight">Get in Touch</h2>
              <p className="text-[#86868B] mb-8">You can reach us anytime</p>

              {submitted ? (
                <div className="bg-[#F5F5F7] rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="text-green-600" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1D1D1F] mb-2">Message Sent!</h3>
                  <p className="text-[#86868B]">Thank you for contacting us. We'll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-[#F5F5F7] rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all text-[#1D1D1F] placeholder:text-[#86868B]"
                      placeholder="First name"
                    />
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-[#F5F5F7] rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all text-[#1D1D1F] placeholder:text-[#86868B]"
                      placeholder="Last name"
                    />
                  </div>

                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full p-4 pl-12 bg-[#F5F5F7] rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all text-[#1D1D1F] placeholder:text-[#86868B]"
                      placeholder="Your email"
                    />
                  </div>

                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-4 pl-12 bg-[#F5F5F7] rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all text-[#1D1D1F] placeholder:text-[#86868B]"
                      placeholder="Phone number"
                    />
                  </div>

                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full p-4 bg-[#F5F5F7] rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all resize-none text-[#1D1D1F] placeholder:text-[#86868B]"
                    placeholder="How can we help?"
                  />

                  <button 
                    type="submit"
                    className="w-full bg-[#1D1D1F] text-white py-4 rounded-2xl font-semibold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    Submit
                  </button>

                  <p className="text-xs text-[#86868B] text-center mt-4">
                    By contacting us, you agree to our <a href="#" className="text-[#0071E3] hover:underline">Terms of Service</a> and <a href="#" className="text-[#0071E3] hover:underline">Privacy Policy</a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <div className="bg-white py-24 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <h2 className="text-4xl font-semibold text-[#1D1D1F] mb-4 tracking-tight">Contact Us</h2>
            <p className="text-[#86868B] text-lg mb-8 leading-relaxed">
              Email, call, or complete the form to learn how Roomora can solve your messaging problem.
            </p>
            <div className="space-y-4">
              <p className="text-[#1D1D1F] text-lg"><span className="font-semibold">Email:</span> <span className="text-[#86868B]">info@roomora.com</span></p>
              <p className="text-[#1D1D1F] text-lg"><span className="font-semibold">Phone:</span> <span className="text-[#86868B]">+977-1-4567890</span></p>
              <a href="#" className="text-[#0071E3] font-medium hover:underline inline-block text-lg mt-2">Customer Support →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
