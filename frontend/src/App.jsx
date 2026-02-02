import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet, useNavigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import BookingPage from './pages/BookingPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import RoomsPage from './pages/RoomsPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MapPage from './pages/MapPage';
import AIAssistant from './components/ui/AIAssistant';
import Footer from './components/layout/Footer';
import Preloader from './components/ui/Preloader';
import { useState, useEffect } from 'react';
import ScrollToTop from './components/utils/ScrollToTop';

// Layout Component containing Navbar and Footer
const Layout = () => {
  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans text-[#1d1d1f]">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <AIAssistant />
      <Footer />
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// Role-based Protected Route Component
const RoleProtectedRoute = ({ allowedRoles }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userType = localStorage.getItem('userType');
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userType)) {
    // If traveler tries to access owner/admin dashboard, redirect to home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handlePreloaderComplete = () => {
    setLoading(false);
  };

  return (
    <>
      <ScrollToTop />
      {loading && <Preloader onComplete={handlePreloaderComplete} />}

      <Routes>
        {/* Public Routes (No Navbar/Footer) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Public Routes (With Navbar/Footer) */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/hotel/:id" element={<HotelDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/map" element={<MapPage />} />
        </Route>

        {/* Admin/Owner Protected Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['owner']} />}>
          {/* Hotel Owner Dashboard (Standalone Layout) */}
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Protected Routes for All Authenticated Users */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/booking" element={<BookingPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
