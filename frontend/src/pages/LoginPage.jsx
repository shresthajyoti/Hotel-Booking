import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Building2, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react';
import gsap from 'gsap';

const LoginPage = () => {
  const [userType, setUserType] = useState('traveler'); // 'traveler' or 'owner'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Demo credentials
  const credentials = {
    owner: [
      { email: 'owner@roomora.com', password: 'owner123' },
      { email: 'john.owner@gmail.com', password: 'HotelOwner@2024' },
      { email: 'sarah.manager@gmail.com', password: 'Manager@2024' }
    ],
    traveler: [
      { email: 'traveler@roomora.com', password: 'traveler123' },
      { email: 'ramesh.sharma@gmail.com', password: 'Traveler@2024' },
      { email: 'maya.gurung@gmail.com', password: 'Guest@2024' }
    ]
  };

  useEffect(() => {
    gsap.fromTo(formRef.current, 
      { opacity: 0, scale: 0.95, y: 20 }, 
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store user info in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.user.role === 'admin' ? 'owner' : 'traveler');

        // Navigate based on user type
        if (data.user.role === 'admin') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError(data.error || 'Invalid email or password.');
        setLoading(false);
        
        // Shake animation for error
        gsap.fromTo(formRef.current, 
          { x: -5 }, 
          { x: 5, duration: 0.1, repeat: 3, yoyo: true, ease: "power1.inOut", onComplete: () => {
            gsap.set(formRef.current, { x: 0 });
          }}
        );
      }
    } catch (error) {
      setError('Could not connect to the server.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#F2F2F7]">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=80" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-md"></div>
      </div>

      {/* Main Card */}
      <div ref={formRef} className="relative z-10 w-full max-w-[440px] px-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl p-8 md:p-10 border border-white/40">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2 tracking-tight">
              Sign In
            </h1>
            <p className="text-[#86868b] text-[15px]">
              Welcome back to Roomora
            </p>
          </div>

          {/* User Type Switcher (Segmented Control) */}
          <div className="bg-[#767680]/15 p-1 rounded-xl flex mb-8 relative">
            {/* Sliding Background (Simplified logic for visual demo, usually needs exact measurements) */}
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-[9px] shadow-sm transition-all duration-300 ease-out ${
                userType === 'traveler' ? 'left-1' : 'left-[calc(50%+2px)]'
              }`}
            ></div>
            
            <button
              type="button"
              onClick={() => setUserType('traveler')}
              className={`flex-1 relative z-10 py-1.5 text-[13px] font-semibold text-center transition-colors duration-300 ${
                userType === 'traveler' ? 'text-black' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Traveler
            </button>
            <button
              type="button"
              onClick={() => setUserType('owner')}
              className={`flex-1 relative z-10 py-1.5 text-[13px] font-semibold text-center transition-colors duration-300 ${
                userType === 'owner' ? 'text-black' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Hotel Owner
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#86868b]" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200/50 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 transition-all text-[15px] placeholder:text-[#86868b]"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#86868b]" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full pl-11 pr-11 py-3.5 bg-white/50 border border-gray-200/50 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 transition-all text-[15px] placeholder:text-[#86868b]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-[13px] font-medium px-1 animate-pulse">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 ${
                loading 
                  ? 'bg-[#0071e3]/70 text-white/80 cursor-wait' 
                  : 'bg-[#0071e3] text-white hover:bg-[#0077ed] active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Links */}
            <div className="flex items-center justify-between pt-2">
              <Link to="/forgot-password" className="text-[13px] text-[#0071e3] font-medium hover:underline">
                Forgot password?
              </Link>
              <Link to="/signup" className="text-[13px] text-[#0071e3] font-medium hover:underline">
                Create account
              </Link>
            </div>
          </form>
        </div>
        
        {/* Footer Text */}
        <p className="text-center text-white/60 text-xs mt-8 font-medium">
          &copy; 2024 Roomora Inc. Jyoti Shrestha
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
