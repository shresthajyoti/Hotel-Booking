const axios = require('axios');

// @desc    Send message to n8n chatbot
// @route   POST /api/chat
// @access  Public
exports.sendMessage = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({
            success: false,
            error: 'Please provide a message',
        });
    }

    // Generate or get sessionId from session
    // If session doesn't exist, we use a fallback unique ID
    const sessionId = req.sessionID || `session-${Date.now()}`;

    const webhookUrl = process.env.CHATBOT_WEBHOOK_URL || 'https://nabin8n.tridevinnovation.com/webhook/roomora-chat';

    try {
        console.log(`[ChatLog] Request: ${message} (Session: ${sessionId})`);

        const response = await axios.post(webhookUrl, {
            message,
            sessionId
        }, {
            timeout: 15000 // 15 seconds timeout
        });

        // Handle various response formats from n8n
        let botResponse = "";
        if (typeof response.data === 'string') {
            botResponse = response.data;
        } else if (Array.isArray(response.data)) {
            botResponse = response.data[0]?.output || response.data[0]?.message || response.data[0]?.text || "No response content";
        } else {
            botResponse = response.data?.output || response.data?.message || response.data?.text || "No response content";
        }

        console.log(`[ChatLog] Response: ${botResponse.substring(0, 50)}...`);

        res.status(200).json({
            success: true,
            output: botResponse,
        });
    } catch (error) {
        console.error('Chatbot Webhook Error:', error.message);

        let status = 500;
        let errorMessage = 'Failed to get response from AI assistant';

        if (error.code === 'ECONNABORTED') {
            status = 504;
            errorMessage = 'AI assistant took too long to respond';
        } else if (error.response) {
            status = error.response.status;
            errorMessage = error.response.data?.message || errorMessage;
        }

        res.status(status).json({
            success: false,
            error: errorMessage,
        });
    }
};
