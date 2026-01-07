const express = require('express');
const { getBookings, getBooking, createBooking, updateBooking, deleteBooking } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getBookings);
router.get('/:id', getBooking); // User can get their own booking, controller should handle check
router.post('/', createBooking);
router.put('/:id', authorize('admin'), updateBooking);
router.delete('/:id', authorize('admin'), deleteBooking);

module.exports = router;
