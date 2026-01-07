const Booking = require('../models/Booking');
const Property = require('../models/Property');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Public (should be Private in production)
exports.getStats = async (req, res) => {
  try {
    const { email } = req.query;
    // If not admin, force filter to user's email
    const filter = req.user.role === 'admin'
      ? (email ? { email } : {})
      : { email: req.user.email };

    const totalBookings = await Booking.countDocuments(filter);

    const revenueResult = await Booking.aggregate([
      { $match: { ...filter, status: 'Confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const activeGuests = await Booking.distinct('email', { ...filter, status: 'Confirmed' });

    const totalProperties = await Property.countDocuments();

    // For occupancy, we can just mock it for now or calculate based on rooms
    const occupancy = 78;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: `Rs. ${(totalRevenue / 1000).toFixed(2)}K`,
        totalBookings,
        activeGuests: activeGuests.length,
        occupancy: `${occupancy}%`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get recent bookings
// @route   GET /api/dashboard/bookings
// @access  Public
exports.getRecentBookings = async (req, res) => {
  try {
    const { email } = req.query;
    // If not admin, force filter to user's email
    const filter = req.user.role === 'admin'
      ? (email ? { email } : {})
      : { email: req.user.email };
    const bookings = await Booking.find(filter).sort({ createdAt: -1 }).limit(10);
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add a new booking
// @route   POST /api/dashboard/bookings
// @access  Public
exports.addBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all properties
// @route   GET /api/dashboard/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json({
      success: true,
      data: properties
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all guests (unique emails from bookings)
// @route   GET /api/dashboard/guests
// @access  Public
exports.getGuests = async (req, res) => {
  try {
    const guests = await Booking.aggregate([
      {
        $group: {
          _id: '$email',
          name: { $first: '$guestName' },
          email: { $first: '$email' },
          totalBookings: { $sum: 1 },
          lastBooking: { $max: '$createdAt' }
        }
      }
    ]);
    res.status(200).json({
      success: true,
      data: guests
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// @desc    Get revenue analytics for the last 7 days
// @route   GET /api/dashboard/analytics
// @access  Public
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { email } = req.query;
    const filter = email ? { email } : {};

    // Get dates for the last 7 days
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      dates.push(d);
    }

    const analytics = await Booking.aggregate([
      {
        $match: {
          ...filter,
          status: 'Confirmed',
          createdAt: { $gte: dates[0] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Map to include zero-revenue days
    const formattedData = dates.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const match = analytics.find(a => a._id === dateStr);
      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: match ? match.revenue : 0,
        fullDate: dateStr
      };
    });

    // Property Distribution Analytics
    const propertyStats = await Booking.aggregate([
      { $match: { ...filter, status: 'Confirmed' } },
      {
        $group: {
          _id: "$propertyName",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalConfirmed = propertyStats.reduce((acc, p) => acc + p.count, 0);
    const distribution = propertyStats.map(p => ({
      name: p._id || "Other",
      percentage: totalConfirmed > 0 ? Math.round((p.count / totalConfirmed) * 100) : 0
    })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        revenue: formattedData,
        distribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
