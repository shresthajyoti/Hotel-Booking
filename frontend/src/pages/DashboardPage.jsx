import React, { useEffect, useState, useRef } from 'react';
import {
  Home, Calendar, DollarSign, Users, TrendingUp, Settings, LogOut,
  Building2, Plus, Eye, Edit, Trash2, CheckCircle, Clock, XCircle,
  Star, MapPin, BedDouble, BarChart3, Search, Bell, Mail, Menu,
  ChevronRight, MoreHorizontal, Filter, Download, X, Check
} from 'lucide-react';
import gsap from 'gsap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const API_BASE_URL = '/dashboard';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [guests, setGuests] = useState([]);
  const [statsData, setStatsData] = useState({
    totalRevenue: 'Rs. 0',
    totalBookings: 0,
    activeGuests: 0,
    occupancy: '0%'
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageSearch, setMessageSearch] = useState('');
  const [revenueAnalytics, setRevenueAnalytics] = useState([]);
  const [propertyDistribution, setPropertyDistribution] = useState([]);
  const [sourcesAnalytics, setSourcesAnalytics] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [settingsFormData, setSettingsFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const pollingInterval = useRef(null);

  const navigate = useNavigate();
  const modalRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const [statsRes, bookingsRes, propertiesRes, guestsRes, notifRes, analyticsRes, convosRes] = await Promise.all([
        api.get(`${API_BASE_URL}/stats`),
        api.get(`${API_BASE_URL}/bookings`),
        api.get(`${API_BASE_URL}/properties`),
        api.get(`${API_BASE_URL}/guests`),
        api.get(`/notifications`),
        api.get(`${API_BASE_URL}/analytics`),
        api.get(`/messages/conversations/${user._id}`)
      ]);

      // Handle stats with static mock fallbacks for empty data
      if (statsRes.data.success) {
        const realStats = statsRes.data.data;
        if (realStats.totalBookings === 0) {
          setStatsData({
            totalRevenue: 'Rs. 128.5K',
            totalBookings: 24,
            activeGuests: 12,
            occupancy: '78%'
          });
        } else {
          setStatsData(realStats);
        }
      }

      // Handle bookings with static mock fallbacks
      if (bookingsRes.data.success) {
        const realBookings = bookingsRes.data.data;
        if (realBookings.length === 0) {
          setBookings([
            { _id: '1', guestName: 'Alice Johnson', email: 'alice@example.com', propertyName: 'Mountain Resort', checkInDate: new Date(), status: 'Confirmed' },
            { _id: '2', guestName: 'Bob Smith', email: 'bob@example.com', propertyName: 'Lakeside Villa', checkInDate: new Date(Date.now() - 86400000), status: 'Pending' },
            { _id: '3', guestName: 'Charlie Brown', email: 'charlie@example.com', propertyName: 'City Heights', checkInDate: new Date(Date.now() - 172800000), status: 'Confirmed' }
          ]);
        } else {
          setBookings(realBookings);
        }
      }

      if (propertiesRes.data.success) setProperties(propertiesRes.data.data);

      // Handle guests with static mock fallbacks
      if (guestsRes.data.success) {
        const realGuests = guestsRes.data.data;
        if (realGuests.length === 0) {
          setGuests([
            { _id: '1', name: 'Alice Johnson', email: 'alice@example.com', totalBookings: 2, lastBooking: new Date() },
            { _id: '2', name: 'Bob Smith', email: 'bob@example.com', totalBookings: 1, lastBooking: new Date() }
          ]);
        } else {
          setGuests(realGuests);
        }
      }

      // Handle analytics with static mock fallbacks
      if (analyticsRes.data.success) {
        const data = analyticsRes.data.data;
        setRevenueAnalytics(data.revenue && data.revenue.some(d => d.value > 0) ? data.revenue : [
          { label: 'Jan', value: 45000 }, { label: 'Feb', value: 52000 }, { label: 'Mar', value: 48000 },
          { label: 'Apr', value: 61000 }, { label: 'May', value: 55000 }, { label: 'Jun', value: 67000 },
          { label: 'Jul', value: 72000 }, { label: 'Aug', value: 68000 }, { label: 'Sep', value: 75000 },
          { label: 'Oct', value: 82000 }, { label: 'Nov', value: 88000 }, { label: 'Dec', value: 95000 }
        ]);
        setPropertyDistribution(data.distribution && data.distribution.length > 0 ? data.distribution : [
          { name: 'Mountain View', percentage: 45 }, { name: 'City Suite', percentage: 35 }, { name: 'Lake House', percentage: 20 }
        ]);
        setSourcesAnalytics(data.sources && data.sources.length > 0 ? data.sources : [
          { label: 'Direct', value: 60, color: '#0071e3' }, { label: 'Booking.com', value: 25, color: '#a855f7' }, { label: 'Others', value: 15, color: '#e5e7eb' }
        ]);
      }

      if (notifRes.data.success) {
        setNotifications(notifRes.data.data || []);
        setUnreadCount((notifRes.data.data || []).filter(n => !n.isRead).length);
      }
      if (convosRes.data.success) {
        setConversations(convosRes.data.data || []);
      }

      // Sync settings form
      setSettingsFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeContact) {
      fetchMessages();
      // Start polling for new messages when a contact is selected
      pollingInterval.current = setInterval(fetchMessages, 3000);
    } else {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    }

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [activeContact]);

  const fetchMessages = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!activeContact) return;

      const res = await api.get(`/messages?userId=${user._id}`);
      if (res.data.success) {
        const filtered = res.data.data.filter(m =>
          (m.senderId === user._id && m.receiverId === activeContact._id) ||
          (m.senderId === activeContact._id && m.receiverId === user._id)
        );

        // Only update if messages actually changed to avoid unnecessary re-renders
        setMessages(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(filtered)) {
            return filtered;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (content) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const newMessage = {
        senderId: user._id,
        receiverId: activeContact._id || "6584c3e8f8a2b5a1a8e1b2c4",
        content
      };

      const res = await api.post(`/messages`, newMessage);
      if (res.data.success) {
        setMessages([...messages, res.data.data]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      const res = await api.delete(`/properties/${id}`);
      if (res.data.success) {
        setProperties(properties.filter(p => p._id !== id));
      }
    } catch (error) {
      alert('Error deleting property');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      // Assuming a delete route exists or using dashboard endpoint
      const res = await api.delete(`${API_BASE_URL}/bookings/${id}`);
      if (res.data.success) {
        setBookings(bookings.filter(b => b._id !== id));
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
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

  useEffect(() => {
    gsap.fromTo(".animate-enter",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
    );
  }, [activeTab, loading]);

  useEffect(() => {
    if (isModalOpen) {
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.2)" }
      );
    }
  }, [isModalOpen]);

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/updatedetails', settingsFormData);
      if (res.data.success) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...res.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Profile updated successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Update failed');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      return alert('Passwords do not match');
    }
    try {
      const res = await api.put('/auth/updatepassword', {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword
      });
      if (res.data.success) {
        setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        localStorage.setItem('token', res.data.token);
        alert('Password updated successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Password update failed');
    }
  };

  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyImages, setPropertyImages] = useState(['']);
  const [propertyAmenities, setPropertyAmenities] = useState([]);
  const [amenityInput, setAmenityInput] = useState('');

  const filteredBookings = bookings.filter(booking =>
    (booking.guestName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.propertyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.status || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProperties = properties.filter(p =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGuests = guests.filter(g =>
    (g.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const propertyData = {
      name: formData.get('name'),
      location: formData.get('location'),
      type: formData.get('type'),
      rooms: Number(formData.get('rooms')),
      pricePerNight: Number(formData.get('price')),
      rating: Number(formData.get('rating')),
      description: formData.get('description'),
      images: propertyImages.filter(img => img.trim() !== ''),
      amenities: propertyAmenities
    };

    try {
      if (editingProperty) {
        const res = await api.put(`/properties/${editingProperty._id}`, propertyData);
        if (res.data.success) {
          setProperties(properties.map(p => p._id === editingProperty._id ? res.data.data : p));
        }
      } else {
        const res = await api.post(`/properties`, propertyData);
        if (res.data.success) {
          setProperties([...properties, res.data.data]);
        }
      }
      setIsPropertyModalOpen(false);
      setEditingProperty(null);
      setPropertyImages(['']);
      setPropertyAmenities([]);
    } catch (error) {
      console.error("Error saving property:", error);
    }
  };

  const handleAddImageField = () => {
    setPropertyImages([...propertyImages, '']);
  };

  const handleImageChange = (index, value) => {
    const newImages = [...propertyImages];
    newImages[index] = value;
    setPropertyImages(newImages);
  };

  const handleRemoveImageField = (index) => {
    if (propertyImages.length > 1) {
      const newImages = propertyImages.filter((_, i) => i !== index);
      setPropertyImages(newImages);
    }
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !propertyAmenities.includes(amenityInput.trim())) {
      setPropertyAmenities([...propertyAmenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setPropertyAmenities(propertyAmenities.filter(a => a !== amenity));
  };

  const handleAddBooking = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedPropName = formData.get('property');
    const selectedProp = properties.find(p => p.name === selectedPropName);

    const newBooking = {
      guestName: formData.get('guestName'),
      email: formData.get('email'),
      propertyName: selectedPropName,
      roomType: formData.get('roomType'),
      checkInDate: new Date().toISOString(),
      checkOutDate: new Date().toISOString(),
      amount: selectedProp ? selectedProp.pricePerNight : 5000,
      propertyId: selectedProp ? (selectedProp._id || selectedProp.id) : "6584c3e8f8a2b5a1a8e1b2c4"
    };

    try {
      const res = await api.post(`${API_BASE_URL}/bookings`, newBooking);
      if (res.data.success) {
        setBookings([res.data.data, ...bookings]);
        setIsModalOpen(false);
        fetchDashboardData(); // Refresh stats
      }
    } catch (error) {
      console.error("Error adding booking:", error);
    }
  };

  // Mock Data
  // Dynamic Stats
  const stats = [
    { label: 'Total Revenue', value: statsData.totalRevenue, change: '+12.6%', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Bookings', value: statsData.totalBookings, change: '+8.2%', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Active Guests', value: statsData.activeGuests, change: '+2.1%', icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Occupancy', value: statsData.occupancy, change: '-1.4%', icon: Building2, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100/80 text-green-700 border border-green-200';
      case 'Pending': return 'bg-yellow-100/80 text-yellow-700 border border-yellow-200';
      case 'Cancelled': return 'bg-red-100/80 text-red-700 border border-red-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex font-sans text-[#1d1d1f] overflow-hidden">

      {/* Sidebar - MacOS Style */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6">
            <div className="w-8 h-8 bg-linear-to-br from-[#0071e3] to-[#005bb5] rounded-lg flex items-center justify-center mr-3 shadow-md shadow-blue-500/20">
              <Building2 className="text-white" size={18} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-gray-900">Roomora</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">

            {/* Main Section */}
            <div>
              <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Main</p>
              <nav className="space-y-0.5">
                <SidebarItem icon={Home} label="Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <SidebarItem icon={Building2} label="Properties" active={activeTab === 'properties'} onClick={() => setActiveTab('properties')} />
                <SidebarItem icon={Calendar} label="Bookings" active={activeTab === 'bookings'} badge={bookings.length > 0 ? bookings.length.toString() : null} onClick={() => setActiveTab('bookings')} />
                <SidebarItem icon={Users} label="Guests" active={activeTab === 'guests'} onClick={() => setActiveTab('guests')} />
              </nav>
            </div>

            {/* Apps & Pages */}
            <div>
              <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Apps</p>
              <nav className="space-y-0.5">
                <SidebarItem icon={Mail} label="Messages" active={activeTab === 'messages'} badge="2" onClick={() => setActiveTab('messages')} />
                <SidebarItem icon={BarChart3} label="Analytics" onClick={() => setActiveTab('analytics')} />
                <SidebarItem icon={Settings} label="Settings" onClick={() => setActiveTab('settings')} />
              </nav>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-3 border-t border-gray-200/50 bg-gray-50/50">
            <button onClick={handleSignOut} className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-red-600 group">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                <LogOut size={16} />
              </div>
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">

        {/* Top Header - Glassmorphism */}
        <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0071e3] transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search bookings, guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-100/50 border-none rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 w-64 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-gray-100 text-[#0071e3]' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-enter origin-top-right">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <button onClick={handleMarkAllRead} className="text-xs text-[#0071e3] cursor-pointer hover:underline bg-transparent border-none">Mark all read</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleMarkAsRead(notif._id)}
                          className={`p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex gap-3 cursor-pointer ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'booking' ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-500'}`}>
                            {notif.type === 'booking' ? <Calendar size={14} /> : <Bell size={14} />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${!notif.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          {!notif.isRead && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-400 text-sm">
                        No notifications yet
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-gray-200 mx-1"></div>

            <div className="flex items-center gap-3 pl-1">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-900 leading-none">{JSON.parse(localStorage.getItem('user') || '{}').name || 'Ram Sir'}</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-none">{localStorage.getItem('userType') === 'owner' ? 'Hotel Manager' : 'Admin'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-green-500 to-green-600 overflow-hidden border border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
                {JSON.parse(localStorage.getItem('user') || '{}').name?.split(' ').map(n => n[0]).join('') || 'RS'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">

          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-8 pb-10">

              {/* Page Title */}
              <div className="flex justify-between items-end animate-enter">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Admin Dashboard
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>Performance Overview</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#0071e3] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#0077ed] transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 active:scale-95"
                >
                  <Plus size={18} /> Add Booking
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-enter">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white p-5 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100/50 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-[13px] font-medium text-gray-500 mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
                      </div>
                      <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon size={18} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <span className={stat.change.startsWith('+') ? 'text-green-600 bg-green-50 px-1.5 py-0.5 rounded' : 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded'}>
                        {stat.change}
                      </span>
                      <span className="text-gray-400">vs last month</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-enter">

                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100/50">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Revenue Analytics</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Monthly revenue performance</p>
                    </div>
                    <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {/* CSS Bar Chart */}
                  <div className="h-56 flex items-end justify-between gap-3">
                    {(revenueAnalytics.length > 0 ? revenueAnalytics : [40, 65, 55, 80, 60, 90, 75, 85, 95, 70, 60, 80]).map((item, i) => {
                      const value = typeof item === 'object' ? item.value : item;
                      const maxVal = Math.max(...(revenueAnalytics.map(d => d.value) || [100]));
                      const h = typeof item === 'object' ? (value / maxVal) * 100 : item;
                      return (
                        <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer">
                          <div
                            className="w-full bg-[#0071e3]/10 rounded-t-md transition-all duration-300 group-hover:bg-[#0071e3] relative"
                            style={{ height: `${Math.max(h, 5)}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {typeof item === 'object' ? `Rs. ${value.toLocaleString()}` : `${item}k`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    {(revenueAnalytics.length > 0 ? revenueAnalytics.map(d => d.label) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']).map(m => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Booking Sources */}
                <div className="bg-white p-6 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-bold text-gray-900">Sources</h3>
                    <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  <div className="relative w-40 h-40 mx-auto mb-8 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f3f4f6" strokeWidth="3.8" />
                      {sourcesAnalytics.map((source, i) => {
                        const total = sourcesAnalytics.reduce((acc, s) => acc + s.value, 0);
                        const prevValues = sourcesAnalytics.slice(0, i).reduce((acc, s) => acc + s.value, 0);
                        const dashArray = `${(source.value / total) * 100} 100`;
                        const dashOffset = `-${(prevValues / total) * 100}`;
                        return (
                          <path
                            key={i}
                            className="transition-all duration-1000"
                            stroke={source.color}
                            strokeDasharray={dashArray}
                            strokeDashoffset={dashOffset}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            strokeWidth="3.8"
                            strokeLinecap="round"
                          />
                        );
                      })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">100%</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide">Share</span>
                    </div>
                  </div>

                  <div className="space-y-3 mt-auto">
                    {sourcesAnalytics.map((source, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: source.color }}></div>
                          <span className="text-gray-600 text-xs">{source.label}</span>
                        </div>
                        <span className="font-bold text-xs">{source.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Bookings Table */}
              <div className="bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100/50 overflow-hidden animate-enter">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h3 className="text-base font-bold text-gray-900">Recent Bookings</h3>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors text-gray-600">
                      <Filter size={14} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors text-gray-600">
                      <Download size={14} /> Export
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="text-left py-3 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Guest</th>
                        <th className="text-left py-3 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Property</th>
                        <th className="text-left py-3 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="text-left py-3 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Room Type</th>
                        <th className="text-left py-3 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="text-right py-3 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                          <tr key={booking._id || booking.id} className="hover:bg-gray-50/80 transition-colors group">
                            <td className="py-3 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border border-white shadow-sm">
                                  {booking.guestName ? booking.guestName.charAt(0) : '?'}
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-gray-900">{booking.guestName}</p>
                                  <p className="text-[11px] text-gray-500">{booking.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-6 text-sm text-gray-600">{booking.propertyName}</td>
                            <td className="py-3 px-6 text-sm text-gray-600">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                            <td className="py-3 px-6">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                {booking.roomType}
                              </span>
                            </td>
                            <td className="py-3 px-6">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusStyle(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="py-3 px-6 text-right">
                              <button className="p-1.5 text-gray-400 hover:text-[#0071e3] hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                <MoreHorizontal size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-gray-500 text-sm">
                            No bookings found matching "{searchQuery}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'properties' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-enter">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Properties</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage your hotel listings</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProperty(null);
                    setPropertyImages(['']);
                    setPropertyAmenities([]);
                    setIsPropertyModalOpen(true);
                  }}
                  className="bg-[#0071e3] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#0077ed] transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                >
                  <Plus size={18} /> Add Property
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <div key={property._id} className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                    <div className="h-48 bg-gray-100 relative">
                      <img src={property.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'} alt={property.name} className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-[#0071e3]">
                        {property.rating} ★
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900">{property.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {property.location}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5 min-h-[22px]">
                        {property.amenities?.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-gray-50 text-[10px] text-gray-400 rounded-md border border-gray-100">
                            {amenity}
                          </span>
                        ))}
                        {property.amenities?.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{property.amenities.length - 3} more</span>
                        )}
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm font-semibold text-[#0071e3]">Rs. {property.pricePerNight} / Night</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProperty(property);
                              setPropertyImages(property.images || ['']);
                              setPropertyAmenities(property.amenities || []);
                              setIsPropertyModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-[#0071e3] transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property._id)}
                            className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-enter">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">All Bookings</h1>
                  <p className="text-sm text-gray-500 mt-1">Real-time booking management</p>
                </div>
              </div>

              <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Guest</th>
                      <th className="text-left py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Property</th>
                      <th className="text-left py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Dates</th>
                      <th className="text-left py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-right py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="py-4 px-6">
                          <p className="font-medium text-sm text-gray-900">{booking.guestName}</p>
                          <p className="text-[11px] text-gray-500">{booking.email}</p>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{booking.propertyName}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(booking.checkInDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={booking.status}
                            onChange={async (e) => {
                              try {
                                const newStatus = e.target.value;
                                // Use the correct bookings endpoint, not dashboard endpoint
                                const res = await api.put(`/bookings/${booking._id}`, { status: newStatus });
                                if (res.data.success) {
                                  // Update local state to reflect change immediately
                                  setBookings(bookings.map(b =>
                                    b._id === booking._id ? { ...b, status: newStatus } : b
                                  ));
                                }
                              } catch (err) {
                                console.error("Error updating booking status:", err);
                                alert("Failed to update status");
                              }
                            }}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium border-none outline-none cursor-pointer ${getStatusStyle(booking.status)}`}
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteBooking(booking._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'guests' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-enter">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Active Guests</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage guest relationships</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(filteredGuests.length > 0 ? filteredGuests : guests).map((guest, i) => (
                  <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group" onClick={() => { setActiveContact(guest); setActiveTab('messages'); }}>
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center text-[#0071e3] font-bold text-lg">
                      {guest.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{guest.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{guest.email}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#0071e3] bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Premium</span>
                        <span className="text-[10px] text-gray-400 font-medium">12 Bookings</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-[#0071e3] transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="max-w-7xl mx-auto h-[calc(100vh-180px)] animate-enter">
              <div className="bg-white h-full rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex">

                {/* Conversations Sidebar */}
                <div className="w-80 border-r border-gray-100 flex flex-col">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Messages</h3>
                    <div className="relative mt-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="text"
                        placeholder="Search chats..."
                        onChange={(e) => setMessageSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-[#0071e3]/10 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {/* Combine conversations and guests, showing unique users */}
                    {[...conversations, ...guests.filter(g => !conversations.some(c => c._id === g._id))]
                      .filter(u => u.name.toLowerCase().includes(messageSearch.toLowerCase()))
                      .length > 0 ? (
                      [...conversations, ...guests.filter(g => !conversations.some(c => c._id === g._id))]
                        .filter(u => u.name.toLowerCase().includes(messageSearch.toLowerCase())).map((user, i) => (
                          <div
                            key={i}
                            onClick={() => setActiveContact(user)}
                            className={`p-4 hover:bg-gray-50 cursor-pointer flex gap-3 items-center border-b border-gray-50/50 transition-colors ${activeContact?._id === user._id ? 'bg-blue-50/50' : ''}`}
                          >
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-50 to-blue-100 text-[#0071e3] flex items-center justify-center font-bold text-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                                <span className="text-[10px] text-gray-400 capitalize">
                                  {user.role}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-8 text-center text-gray-400 text-sm">No conversations found</div>
                    )}
                  </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col bg-gray-50/30">
                  {activeContact ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0071e3] flex items-center justify-center font-bold">
                            {activeContact.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{activeContact.name}</p>
                            <p className="text-[10px] text-green-500 font-medium">Online</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"><Mail size={16} /></button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"><MoreHorizontal size={16} /></button>
                        </div>
                      </div>

                      {/* Messages Area */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
                        {messages.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                            <Mail size={40} className="mb-2" />
                            <p className="text-sm italic">No messages yet. Start the conversation!</p>
                          </div>
                        )}

                        {messages.map((msg, i) => {
                          const isMe = msg.senderId === JSON.parse(localStorage.getItem('user'))._id;
                          return (
                            <div key={i} className={`flex flex-col gap-1 max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                              <div className={`p-3 rounded-2xl ${isMe ? 'bg-[#0071e3] text-white rounded-tr-none shadow-md' : 'bg-white text-gray-700 rounded-tl-none shadow-sm border border-gray-100'} text-sm`}>
                                {msg.content}
                              </div>
                              <span className="text-[10px] text-gray-400 px-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })}
                        <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                      </div>

                      {/* Chat Input */}
                      <div className="p-4 bg-white border-t border-gray-100">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const content = e.target.msg.value;
                            if (!content) return;
                            handleSendMessage(content);
                            e.target.reset();
                          }}
                          className="flex items-center gap-3"
                        >
                          <button type="button" className="p-2 text-gray-400 hover:text-[#0071e3] transition-colors"><Plus size={20} /></button>
                          <input
                            type="text"
                            name="msg"
                            autoComplete="off"
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0071e3]/10 outline-none"
                          />
                          <button type="submit" className="bg-[#0071e3] text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                            <ChevronRight size={20} />
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                        <Mail className="text-[#0071e3]" size={32} />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">Your Messages</h3>
                      <p className="text-sm text-gray-500 max-w-xs mt-2">Select a conversation from the sidebar to start chatting with your guests or the hotel manager.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-enter">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics</h1>
                  <p className="text-sm text-gray-500 mt-1">Insight into your business performance</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900">Revenue Overview</h3>
                      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse border border-green-100">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Live
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[#0071e3] rounded-full"></span>
                      <span className="text-xs font-semibold text-gray-500">Last 7 Days (Rs)</span>
                    </div>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-4 px-2">
                    {revenueAnalytics.length > 0 ? (
                      revenueAnalytics.map((day, i) => {
                        const maxVal = Math.max(...revenueAnalytics.map(d => d.value), 1000);
                        const height = (day.value / maxVal) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative">
                            {/* Bar Tooltip */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl">
                              Rs. {day.value.toLocaleString()}
                            </div>

                            <div className="w-full bg-blue-50/50 rounded-t-xl relative overflow-hidden h-full flex flex-col justify-end">
                              <div
                                className="w-full bg-[#0071e3] transition-all duration-700 ease-out group-hover:bg-[#0077ed] group-hover:brightness-110 rounded-t-xl"
                                style={{ height: `${Math.max(height, 5)}%` }}
                              >
                                {day.value > 0 && (
                                  <div className="w-full h-full bg-linear-to-t from-transparent to-white/10"></div>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-900 transition-colors">{day.label}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm italic">
                        No revenue data available for this period
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-6">Booking Distribution</h3>
                  <div className="space-y-6">
                    {propertyDistribution.length > 0 ? (
                      propertyDistribution.map((item, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">{item.name}</span>
                            <span className="font-bold text-[#0071e3]">{item.percentage}%</span>
                          </div>
                          <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-[#0071e3] rounded-full transition-all duration-1000" style={{ width: `${item.percentage}%` }}></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
                        <BarChart3 size={40} className="opacity-20" />
                        <p className="text-sm italic">No occupancy data yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto animate-enter">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
                </div>
              </div>

              <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center gap-6 bg-gray-50/30">
                  <div className="w-20 h-20 rounded-2xl bg-[#0071e3] flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/10">
                    {settingsFormData.name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{settingsFormData.name}</h2>
                    <p className="text-sm text-gray-500">{settingsFormData.email}</p>
                    <button className="text-xs font-bold text-[#0071e3] mt-2 hover:underline">Change Photo</button>
                  </div>
                </div>
                <div className="p-8 space-y-10">
                  {/* Profile Form */}
                  <form onSubmit={handleSettingsSubmit} className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg inline-block">Profile Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Full Name</label>
                        <input
                          type="text"
                          value={settingsFormData.name}
                          onChange={(e) => setSettingsFormData({ ...settingsFormData, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Email Address</label>
                        <input
                          type="email"
                          value={settingsFormData.email}
                          onChange={(e) => setSettingsFormData({ ...settingsFormData, email: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={settingsFormData.phone}
                        onChange={(e) => setSettingsFormData({ ...settingsFormData, phone: e.target.value })}
                        placeholder="+977 98XXXXXXXX"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button type="submit" className="px-6 py-2.5 bg-[#0071e3] text-white rounded-xl font-semibold text-sm hover:bg-[#0077ed] shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Update Profile</button>
                    </div>
                  </form>

                  <div className="h-px bg-gray-100"></div>

                  {/* Password Form */}
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg inline-block">Security</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Current Password</label>
                        <input
                          type="password"
                          value={passwordFormData.currentPassword}
                          onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">New Password</label>
                          <input
                            type="password"
                            value={passwordFormData.newPassword}
                            onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            value={passwordFormData.confirmPassword}
                            onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button type="submit" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-black shadow-lg active:scale-95 transition-all">Update Password</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div ref={modalRef} className="bg-white rounded-[24px] shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">New Booking</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Guest Name</label>
                <input type="text" name="guestName" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all text-sm" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Email</label>
                <input type="email" name="email" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all text-sm" placeholder="john@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Property</label>
                  <select name="property" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all text-sm appearance-none">
                    {properties.length > 0 ? (
                      properties.map(p => (
                        <option key={p._id || p.id}>{p.name}</option>
                      ))
                    ) : (
                      <option>No Properties Available</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Room Type</label>
                  <select name="roomType" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all text-sm appearance-none">
                    <option>Standard</option>
                    <option>Deluxe</option>
                    <option>Suite</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors text-gray-600">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-[#0071e3] text-white rounded-xl font-medium text-sm hover:bg-[#0077ed] transition-colors shadow-lg shadow-blue-500/20">Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Property Modal */}
      {isPropertyModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsPropertyModalOpen(false)}
          ></div>
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-enter">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">{editingProperty ? 'Edit Property' : 'Add New Property'}</h3>
              <button onClick={() => setIsPropertyModalOpen(false)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePropertySubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Property Name</label>
                <input type="text" name="name" defaultValue={editingProperty?.name} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Location</label>
                  <input type="text" name="location" defaultValue={editingProperty?.location} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Type</label>
                  <select name="type" defaultValue={editingProperty?.type || 'Hotel'} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm appearance-none">
                    <option>Hotel</option>
                    <option>Resort</option>
                    <option>Inn</option>
                    <option>Villa</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Rooms</label>
                  <input type="number" name="rooms" defaultValue={editingProperty?.rooms} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Price (Rs)</label>
                  <input type="number" name="price" defaultValue={editingProperty?.pricePerNight} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Rating (1-5)</label>
                  <input type="number" name="rating" step="0.1" max="5" defaultValue={editingProperty?.rating} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Description</label>
                <textarea name="description" defaultValue={editingProperty?.description} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm h-24 resize-none"></textarea>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Property Images</label>
                  <button
                    type="button"
                    onClick={handleAddImageField}
                    className="text-[10px] font-bold text-[#0071e3] flex items-center gap-1 hover:underline"
                  >
                    <Plus size={12} /> Add More
                  </button>
                </div>
                <div className="space-y-3">
                  {propertyImages.map((img, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={img}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          placeholder="Image URL (https://...)"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
                        />
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImageField(index)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {/* Image Previews */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {propertyImages.filter(img => img.trim() !== '').map((img, index) => (
                    <div key={index} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 shadow-sm relative group">
                      <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL' }} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => handleRemoveImageField(index)} className="text-white"><X size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Amenities</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                    placeholder="e.g. WiFi, Pool, Spa"
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="px-4 bg-[#0071e3] text-white rounded-xl text-sm font-medium hover:bg-[#0077ed]"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {propertyAmenities.map((amenity, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#0071e3] rounded-full text-xs font-medium border border-blue-100">
                      {amenity}
                      <button type="button" onClick={() => handleRemoveAmenity(amenity)} className="hover:text-red-500"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsPropertyModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-[#0071e3] text-white rounded-xl font-medium text-sm hover:bg-[#0077ed] transition-colors shadow-lg shadow-blue-500/20">
                  {editingProperty ? 'Update Property' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, badge, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${active
      ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/20'
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
      <span className={`text-[13px] font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
    </div>
    {badge && (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
        }`}>
        {badge}
      </span>
    )}
  </button>
);

export default DashboardPage;
