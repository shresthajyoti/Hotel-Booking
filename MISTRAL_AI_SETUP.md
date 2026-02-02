# Mistral AI Integration Setup

## Overview
The AI Assistant in this hotel booking application is now powered by **Mistral AI**, providing intelligent, context-aware responses to help users find the perfect hotel.

## Features
- 🤖 **AI-Powered Conversations**: Natural language understanding using Mistral AI's language models
- ✨ **Dynamic Suggestions**: AI automatically suggests the next questions you might want to ask
- 🏨 **Smart Hotel Recommendations**: AI analyzes user preferences for location and budget
- 🔄 **Fallback Support**: Automatically falls back to local logic if API is unavailable
- 💬 **Contextual Responses**: Maintains conversation context for better recommendations

## Setup Instructions

### 1. Get Your Mistral AI API Key

1. Visit [Mistral AI Console](https://console.mistral.ai/)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy your API key

### 2. Configure Environment Variables

1. Open the `.env` file in the `frontend` directory
2. Replace `your_mistral_api_key_here` with your actual API key:

```env
VITE_MISTRAL_API_KEY=your_actual_api_key_here
```

### 3. Restart the Development Server

After adding your API key, restart the development server:

```bash
npm run dev
```

## How It Works

### AI-Powered Features
- **Location Selection**: AI helps users choose from available locations in Nepal
- **Budget Planning**: Intelligent budget recommendations based on available hotels
- **Hotel Recommendations**: AI analyzes ratings, prices, and user preferences
- **Natural Conversations**: Understands various ways users ask questions

### Fallback Mechanism
If the Mistral AI API is unavailable or not configured, the assistant automatically falls back to local logic, ensuring the feature always works.

## API Usage

The integration uses:
- **Model**: `mistral-small-latest`
- **Temperature**: 0.7 (balanced creativity and consistency)
- **Max Tokens**: 300 (concise responses)

## Troubleshooting

### API Key Not Working
- Ensure your API key is correctly copied (no extra spaces)
- Verify your Mistral AI account has API access
- Check the browser console for error messages

### Assistant Not Responding
- Check your internet connection
- Verify the API key is set in `.env`
- Look for error messages in the browser console
- The assistant will fall back to local logic if API fails

### Rate Limits
Mistral AI has rate limits based on your plan. If you hit rate limits:
- Wait a few moments before trying again
- Consider upgrading your Mistral AI plan
- The fallback logic will handle requests during rate limiting

## Cost Considerations

Mistral AI charges based on API usage. The `mistral-small-latest` model is cost-effective for this use case. Monitor your usage in the Mistral AI console.

## Security Notes

⚠️ **Important**: 
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Keep your API key secure and private
- Rotate your API key if it's ever exposed

## Support

For Mistral AI API issues:
- [Mistral AI Documentation](https://docs.mistral.ai/)
- [Mistral AI Discord Community](https://discord.gg/mistralai)

For application issues:
- Check the browser console for errors
- Review the `AIAssistant.jsx` component
