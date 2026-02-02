const express = require('express');
const router = express.Router();
const { getStats, getRecentBookings, addBooking, getProperties, getGuests, getRevenueAnalytics } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getStats);
router.get('/bookings', getRecentBookings);
router.post('/bookings', authorize('admin', 'owner'), addBooking);
router.get('/properties', authorize('admin', 'owner'), getProperties);
router.get('/guests', authorize('admin', 'owner'), getGuests);
router.get('/analytics', authorize('admin', 'owner'), getRevenueAnalytics);

module.exports = router;
