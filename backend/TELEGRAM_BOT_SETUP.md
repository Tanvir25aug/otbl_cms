# Telegram Bot Setup & Troubleshooting

## Overview
This application uses a Telegram bot to process meter reading files (PDF, CSV, TXT) and send notifications.

## Features
- 📄 PDF Billing Profile parsing
- 📊 CSV/TXT meter reading imports
- 📢 Complaint notifications
- 🤖 Automatic data processing

## Configuration

### 1. Get Your Bot Token
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token (format: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)
5. Add it to `.env` as `TELEGRAM_BOT_TOKEN`

### 2. Get Your Chat ID (Optional - for notifications)
1. Send a message to `@userinfobot` on Telegram
2. Copy your Chat ID
3. Add it to `.env` as `TELEGRAM_CHAT_ID`

### 3. Configure Bot Mode

#### Polling Mode (Development/Testing)
```env
TELEGRAM_MODE=polling
```
- Bot actively checks for new messages
- Good for development and testing
- May have conflicts if multiple instances run

#### Webhook Mode (Production)
```env
TELEGRAM_MODE=webhook
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/telegram/webhook
```
- Telegram pushes updates to your server
- More efficient for production
- Requires public HTTPS URL

## Running the Bot

### Development Mode
```bash
npm run dev
```
The bot is **automatically disabled** in development mode to prevent conflicts with nodemon auto-restart.

### Production Mode
```bash
npm start
```
The bot will start automatically in production mode.

## Troubleshooting

### Problem: 409 Conflict Error

**Symptoms:**
```
⚠️ Detected polling conflict (409)
```

**Causes:**
1. Another server instance is already running
2. A webhook is still active
3. Bot is being accessed from another location

**Solutions:**

#### Solution 1: Clear Bot Conflicts (Recommended)
```bash
cd backend
npm run clear-telegram
```

Wait 60 seconds, then start your server again.

#### Solution 2: Manual Steps
1. Stop all running server instances
2. Wait 60 seconds for Telegram's polling timeout
3. Start only ONE server instance
4. Ensure no other applications are using the same bot token

#### Solution 3: Switch to Webhook Mode
If polling continues to have conflicts, switch to webhook mode:

1. Update `.env`:
   ```env
   TELEGRAM_MODE=webhook
   TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/telegram/webhook
   ```

2. Set up your webhook endpoint (requires public HTTPS URL)

### Problem: Bot Not Starting

**Check:**
1. ✅ `TELEGRAM_BOT_TOKEN` is set in `.env`
2. ✅ Token is valid (get a new one from @BotFather if needed)
3. ✅ Running in production mode (bot disabled in dev mode)

### Problem: Bot Not Responding

**Check:**
1. ✅ Bot is running (check server logs)
2. ✅ Send `/start` command to the bot first
3. ✅ Upload a supported file (PDF, CSV, TXT)
4. ✅ Check server logs for errors

## File Upload Instructions

### For Users
1. Open your bot on Telegram
2. Send `/start` to activate
3. Upload a file:
   - **PDF**: Billing Profile from meter system
   - **CSV/TXT**: Meter readings with headers (METERNO, readdttm, read)

### Expected Response
The bot will:
1. Acknowledge receipt
2. Process the file
3. Extract meter readings
4. Save to database
5. Send confirmation with summary

## Bot Commands

- `/start` - Get welcome message and instructions

## Advanced Configuration

### Disable Bot Entirely
Set `TELEGRAM_BOT_TOKEN` to empty in `.env`:
```env
TELEGRAM_BOT_TOKEN=
```

### Change Polling Interval
Edit `src/services/telegramBotService.js`:
```javascript
polling: {
    interval: 1000,  // Change to desired milliseconds
    autoStart: true,
    params: {
        timeout: 10
    }
}
```

## Development Notes

### Why is the bot disabled in dev mode?
- Nodemon auto-restarts the server on file changes
- Each restart would create a new bot instance
- Multiple instances cause 409 conflicts
- Disabling in dev mode prevents this issue

### Re-enable in dev mode
If you need the bot in development:

1. Edit `src/app.js`
2. Remove or comment out the NODE_ENV check:
```javascript
// Always start bot
const telegramBotService = require('./services/telegramBotService');
telegramBotService.start();
```

**Warning:** This may cause conflicts with nodemon auto-restart!

## Support

For issues or questions:
1. Check this documentation
2. Review server logs
3. Run `npm run clear-telegram` to reset bot state
4. Ensure only one server instance is running
