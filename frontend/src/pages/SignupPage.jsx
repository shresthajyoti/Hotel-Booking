import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Building2, Mail, Lock, Eye, EyeOff, ArrowRight, Phone, MapPin } from 'lucide-react';
import gsap from 'gsap';

const SignupPage = () => {
  const [userType, setUserType] = useState('traveler'); // 'traveler' or 'owner'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Hotel owner specific fields
    businessName: '',
    location: ''
  });

  const formRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(headerRef.current, 
      { opacity: 0, y: -20 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(formRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.4"
    );
  }, []);

  useEffect(() => {
    gsap.fromTo(formRef.current, 
      { opacity: 0, x: userType === 'traveler' ? -20 : 20 }, 
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );
  }, [userType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: userType === 'owner' ? 'admin' : 'user'
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', userType);
        
        if (userType === 'owner') {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/';
        }
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      alert('Could not connect to the server. Please make sure the backend is running.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div ref={headerRef} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Create Your Account
            </h1>
            <p className="text-lg text-gray-500">
              Join Roomora and start your journey today
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Left Side - User Type Selection */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Account Type</h2>
              
              {/* Traveler Card */}
              <div 
                onClick={() => setUserType('traveler')}
                className={`group cursor-pointer bg-white rounded-3xl p-8 border-2 transition-all duration-300 ${
                  userType === 'traveler' 
                    ? 'border-black shadow-xl scale-105' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                    userType === 'traveler' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }`}>
                    <User size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Traveler</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Book your perfect stay, explore destinations, and manage your reservations with ease.
                    </p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        Browse and book hotels
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        Manage bookings
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        Save favorite properties
                      </li>
                    </ul>
                  </div>
                  {userType === 'traveler' && (
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hotel Owner Card */}
              <div 
                onClick={() => setUserType('owner')}
                className={`group cursor-pointer bg-white rounded-3xl p-8 border-2 transition-all duration-300 ${
                  userType === 'owner' 
                    ? 'border-black shadow-xl scale-105' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                    userType === 'owner' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }`}>
                    <Building2 size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Hotel Owner</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Manage your properties, track bookings, and grow your hospitality business.
                    </p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        List your properties
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        Manage reservations
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        Analytics & insights
                      </li>
                    </ul>
                  </div>
                  {userType === 'owner' && (
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div ref={formRef} className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-gray-100">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  {userType === 'traveler' ? (
                    <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center">
                      <User size={24} />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center">
                      <Building2 size={24} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {userType === 'traveler' ? 'Traveler Signup' : 'Hotel Owner Signup'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {userType === 'traveler' ? 'Create your account to start booking' : 'Register your business with us'}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+977 98XXXXXXXX"
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Hotel Owner Specific Fields */}
                {userType === 'owner' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Business Name
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleChange}
                          placeholder="Your Hotel Name"
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="City, Nepal"
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start gap-2">
                  <input 
                    type="checkbox" 
                    id="terms"
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black mt-1" 
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-black font-medium hover:underline">
                      Terms & Conditions
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-black font-medium hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group"
                >
                  Create Account
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or sign up with</span>
                  </div>
                </div>

                {/* Social Signup */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Google</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Facebook</span>
                  </button>
                </div>

                {/* Login Link */}
                <p className="text-center text-sm text-gray-600 mt-6">
                  Already have an account?{' '}
                  <Link to="/login" className="text-black font-bold hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
