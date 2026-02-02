const Booking = require("../models/Booking");
const Notification = require("../models/Notification");

/* ================================
   @desc    Get all bookings
   @route   GET /api/bookings
   @access  Private (Admin)
================================ */
exports.getBookings = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access only",
      });
    }

    const bookings = await Booking.find().populate("user", "name email");
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================================
   @desc    Get single booking
   @route   GET /api/bookings/:id
   @access  Private
================================ */
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Owner or admin only
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this booking",
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================================
   @desc    Create booking
   @route   POST /api/bookings
   @access  Private
================================ */
exports.createBooking = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    req.body.user = req.user.id;

    const booking = await Booking.create(req.body);

    // Find the property owner to notify them
    const Property = require('../models/Property');
    const property = await Property.findById(booking.propertyId);

    let ownerToNotify = property && property.owner ? property.owner : null;

    // If no property owner found (e.g. mock booking), notify the primary owner
    if (!ownerToNotify) {
      const User = require('../models/User');
      const primaryOwner = await User.findOne({ role: 'owner' });
      if (primaryOwner) {
        ownerToNotify = primaryOwner._id;
      }
    }

    // Notify property owner
    if (ownerToNotify) {
      await Notification.create({
        userId: ownerToNotify,
        title: "New Booking Received",
        message: `${booking.guestName} booked ${booking.propertyName}`,
        type: "booking",
        metadata: {
          bookingId: booking._id.toString(),
          propertyId: booking.propertyId.toString(),
          guestEmail: booking.email,
        },
      });
    }

    // Also notify the guest
    await Notification.create({
      userId: req.user.id,
      title: "Booking Confirmed",
      message: `Your booking for ${booking.propertyName} has been received.`,
      type: "success",
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/* ================================
   @desc    Update booking status
   @route   PUT /api/bookings/:id
   @access  Private (Admin)
================================ */
exports.updateBooking = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access only",
      });
    }

    // Only allow status updates
    const allowedUpdates = {
      status: req.body.status,
    };

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================================
   @desc    Delete booking
   @route   DELETE /api/bookings/:id
   @access  Private (Admin)
================================ */
exports.deleteBooking = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access only",
      });
    }

    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
