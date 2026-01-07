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

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${active ? 'bg-white shadow-sm text-[#0071e3]' : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-gray-900'
      }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-md transition-colors ${active ? 'bg-blue-50' : 'bg-transparent group-hover:bg-gray-50'}`}>
        <Icon size={18} />
      </div>
      <span className="text-[13px] font-medium">{label}</span>
    </div>
    {badge && (
      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${active ? 'bg-[#0071e3] text-white' : 'bg-gray-100 text-gray-500'}`}>
        {badge}
      </span>
    )}
  </button>
);

const TravelerPortal = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [statsData, setStatsData] = useState({
    totalSpent: 'Rs. 0',
    totalBookings: 0,
    upcomingBookings: 0,
    loyaltyPoints: 1250
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [messageSearch, setMessageSearch] = useState('');
  const [activeContact, setActiveContact] = useState({ name: 'Hotel Manager', email: 'admin@roomora.com', role: 'admin' });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const emailParam = `?email=${user.email}`;
      const notificationParams = `?email=${user.email}&role=user`;

      const [bookingsRes, notifRes, msgRes] = await Promise.all([
        api.get(`${API_BASE_URL}/bookings${emailParam}`),
        api.get(`/notifications${notificationParams}`),
        api.get(`/messages?userId=${user.id}`)
      ]);

      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data);
        // Calculate basic traveler stats
        const confirmed = bookingsRes.data.data.filter(b => b.status === 'Confirmed').length;
        const total = bookingsRes.data.data.reduce((acc, b) => acc + (b.amount || 0), 0);
        setStatsData({
          totalSpent: `Rs. ${total.toLocaleString()}`,
          totalBookings: bookingsRes.data.data.length,
          upcomingBookings: confirmed,
          loyaltyPoints: 1250 + (confirmed * 100)
        });
      }

      if (notifRes.data.success) {
        setNotifications(notifRes.data.data || []);
        setUnreadCount((notifRes.data.data || []).filter(n => !n.isRead).length);
      }

      if (msgRes.data.success) {
        setMessages(msgRes.data.data.filter(m =>
          (m.senderId === user._id && m.receiverId === activeContact._id) ||
          (m.senderId === activeContact._id && m.receiverId === user._id)
        ));
      }

    } catch (error) {
      console.error("Error fetching traveler data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content) => {
    try {
      const newMessage = {
        senderId: user._id,
        receiverId: activeContact._id || "6584c3e8f8a2b5a1a8e1b2c4", // Fallback admin ID
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

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredBookings = bookings.filter(booking =>
    (booking.propertyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.status || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Spent', value: statsData.totalSpent, change: 'Lifetime', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'My Bookings', value: statsData.totalBookings, change: 'Confirmed & Pending', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Loyalty Points', value: statsData.loyaltyPoints, change: 'Gold Member', icon: Star, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Upcoming', value: statsData.upcomingBookings, change: 'Next Stay Soon', icon: Clock, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-700 border border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F5F5F7]">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading your portal...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex font-sans text-[#1d1d1f] overflow-hidden">

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6">
            <div className="w-8 h-8 bg-linear-to-br from-[#0071e3] to-[#005bb5] rounded-lg flex items-center justify-center mr-3">
              <Building2 className="text-white" size={18} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-gray-900">Roomora</span>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            <div>
              <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">My Portal</p>
              <nav className="space-y-0.5">
                <SidebarItem icon={Home} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <SidebarItem icon={Calendar} label="My Bookings" active={activeTab === 'bookings'} badge={bookings.length.toString()} onClick={() => setActiveTab('bookings')} />
                <SidebarItem icon={Mail} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
              </nav>
            </div>
            <div>
              <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Account</p>
              <nav className="space-y-0.5">
                <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
              </nav>
            </div>
          </div>

          <div className="p-3 border-t border-gray-200/50">
            <button onClick={handleSignOut} className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all">
              <LogOut size={16} />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search my bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full relative ${showNotifications ? 'bg-blue-50 text-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <button onClick={handleMarkAllRead} className="text-xs text-blue-500 hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n._id} onClick={() => handleMarkAsRead(n._id)} className={`p-4 hover:bg-gray-50 transition-colors border-b last:border-0 ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                          <p className="text-xs font-bold text-gray-900">{n.title}</p>
                          <p className="text-[11px] text-gray-500 mt-1">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="p-6 text-center text-xs text-gray-400">No new notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{user.name || 'Traveler'}</p>
                <p className="text-[11px] text-gray-500 mt-1">Traveler Portal</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/20">
                {(user.name || 'T').charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Portal Content */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth bg-gray-50/30">

          {activeTab === 'overview' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-enter">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {(user.name || 'Traveler').split(' ')[0]}!</h1>
                <p className="text-sm text-gray-500">Here's what's happening with your travels.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
                        <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
                      </div>
                      <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                        <stat.icon size={18} />
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium">{stat.change}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Recent Bookings</h3>
                    <button onClick={() => setActiveTab('bookings')} className="text-xs font-bold text-blue-500 hover:underline">View All</button>
                  </div>
                  <div className="p-0">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-4 text-[11px] font-bold text-gray-400 uppercase">Hotel</th>
                          <th className="text-left p-4 text-[11px] font-bold text-gray-400 uppercase">Date</th>
                          <th className="text-left p-4 text-[11px] font-bold text-gray-400 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {bookings.slice(0, 5).map((b, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-sm font-medium text-gray-900">{b.propertyName}</td>
                            <td className="p-4 text-xs text-gray-500">{new Date(b.checkInDate).toLocaleDateString()}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(b.status)}`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-6">Explore More</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl text-white">
                      <p className="text-xs font-medium opacity-80">Summer Sale</p>
                      <h4 className="text-lg font-bold mt-1">Get 20% off on your next stay!</h4>
                      <button onClick={() => navigate('/search')} className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold shadow-lg">Find Hotels</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-enter">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage all your hotel reservations</p>
                </div>
                <button onClick={() => navigate('/search')} className="bg-[#0071e3] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#0077ed] transition-all flex items-center gap-2">
                  <Plus size={18} /> New Booking
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Hotel</th>
                      <th className="text-left py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Dates</th>
                      <th className="text-left py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Room</th>
                      <th className="text-left py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-right py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="py-4 px-6">
                          <p className="font-medium text-sm text-gray-900">{booking.propertyName}</p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={10} /> View details</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-600 font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                          <p className="text-[10px] text-gray-400">Check-in</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200 uppercase">{booking.roomType}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-sm text-gray-900">
                          Rs. {booking.amount?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="h-[calc(100vh-140px)] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex animate-enter">
              {/* Simple Sidebar */}
              <div className="w-80 border-r border-gray-100 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-lg">Support</h3>
                  <p className="text-xs text-gray-500 mt-1">Chat with our hotel management team</p>
                </div>
                <div className="p-4">
                  <div
                    onClick={() => setActiveContact({ name: 'Hotel Manager', email: 'admin@roomora.com', role: 'admin' })}
                    className={`p-4 rounded-2xl cursor-pointer flex gap-3 items-center transition-all ${activeContact.role === 'admin' ? 'bg-blue-50 shadow-sm' : 'hover:bg-gray-50'}`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shadow-sm">H</div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900">Hotel Manager</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Always Online</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat View */}
              <div className="flex-1 flex flex-col bg-gray-50/20">
                <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center font-bold">H</div>
                  <div>
                    <p className="font-bold text-sm">Hotel Manager</p>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Online</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="flex flex-col gap-2 max-w-[75%]">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm">
                      Hello! How can we help you today with your bookings?
                    </div>
                    <span className="text-[10px] text-gray-400">System Message</span>
                  </div>

                  {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col gap-1 max-w-[75%] ${m.senderId === user._id ? 'self-end items-end' : ''}`}>
                      <div className={`p-3 rounded-2xl text-sm ${m.senderId === user._id ? 'bg-[#0071e3] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                        {m.content}
                      </div>
                      <span className="text-[9px] text-gray-400">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-white border-t border-gray-100">
                  <form onSubmit={(e) => { e.preventDefault(); if (e.target.msg.value) { handleSendMessage(e.target.msg.value); e.target.reset(); } }} className="flex gap-4">
                    <input name="msg" type="text" placeholder="Type your message..." className="flex-1 bg-gray-100 border-none rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none" />
                    <button type="submit" className="bg-[#0071e3] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Send</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-8 animate-enter">
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <div className="bg-white rounded-4xl shadow-sm border border-gray-100 p-8 space-y-8">
                <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
                  <div className="w-24 h-24 rounded-3xl bg-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-blue-500/20">
                    {(user.name || 'T').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{user.name || 'Traveler'}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <button className="text-xs font-bold text-blue-500 mt-2 hover:underline">Edit Avatar</button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                    <input type="text" defaultValue={user.name} className="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                    <input type="email" defaultValue={user.email} className="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-3 text-sm" />
                  </div>
                  <div className="pt-4">
                    <button className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-gray-900 transition-all">Update Profile</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TravelerPortal;
