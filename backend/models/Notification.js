const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be null for global/admin notifications
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['booking', 'info', 'alert', 'success'],
    default: 'info'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
