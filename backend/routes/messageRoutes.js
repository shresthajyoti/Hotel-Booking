const express = require('express');
const { getMessages, sendMessage, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.get('/', getMessages);
router.post('/', sendMessage);
router.get('/conversations/:userId', getConversations);

module.exports = router;
