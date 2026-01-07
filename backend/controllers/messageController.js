const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all messages for a user
// @route   GET /api/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    
    const message = await Message.create({
      senderId,
      receiverId,
      content
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get conversations (unique users messaged with)
// @route   GET /api/messages/conversations/:userId
// @access  Private
exports.getConversations = async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        }).sort({ createdAt: -1 });

        const contactedUserIds = new Set();
        messages.forEach(msg => {
            if (msg.senderId.toString() !== userId) contactedUserIds.add(msg.senderId.toString());
            if (msg.receiverId.toString() !== userId) contactedUserIds.add(msg.receiverId.toString());
        });

        const users = await User.find({ _id: { $in: Array.from(contactedUserIds) } }).select('name email role');
        
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
