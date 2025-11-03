# Telegram Billing Profile PDF Upload - Setup Guide

This feature allows users to upload Billing Profile PDFs to a Telegram group/chat. The bot will automatically:
1. Download and parse the PDF
2. Extract meter readings
3. Check for duplicates in the database
4. Save only new readings
5. Send a confirmation message with details

## Prerequisites

1. Telegram Bot Token and Chat ID configured in `.env` file:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```

2. All required npm packages installed (already done)

## Setup Process

### Step 1: Expose Your Backend to the Internet

For Telegram webhooks to work, your backend must be accessible from the internet. You can use one of these methods:

#### Option A: Using ngrok (Recommended for Testing)

1. Download and install ngrok: https://ngrok.com/download

2. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

3. In a new terminal, expose your backend (default port 5000):
   ```bash
   ngrok http 5000
   ```

4. ngrok will provide a public URL like:
   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:5000
   ```

5. Your webhook URL will be:
   ```
   https://abc123.ngrok.io/api/telegramhttp://192.168.10.109
   ```

#### Option B: Using a VPS/Cloud Server (Production)

Deploy your backend to a server with a public IP address or domain name.

### Step 2: Set the Webhook URL

Use one of these methods:

#### Method A: Using API Endpoint (Recommended)

1. Log in to your application and get your auth token

2. Make a POST request to set the webhook:
   ```bash
   curl -X POST http://localhost:5000/api/telegram/webhook/set \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
     -d '{"webhookUrl": "https://abc123.ngrok.io/api/telegram/webhook"}'
   ```

   Replace:
   - `YOUR_AUTH_TOKEN` with your actual token
   - `https://abc123.ngrok.io` with your actual ngrok/server URL

#### Method B: Using Telegram API Directly

```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://abc123.ngrok.io/api/telegram/webhook"}'
```

### Step 3: Verify Webhook is Set

Check webhook status:

```bash
curl -X GET http://localhost:5000/api/telegram/webhook/info \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

Or directly via Telegram API:

```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

You should see:
```json
{
  "url": "https://abc123.ngrok.io/api/telegram/webhook",
  "has_custom_certificate": false,
  "pending_update_count": 0,
  "max_connections": 40
}
```

### Step 4: Test the Feature

1. Go to your Telegram group/chat where the bot is added

2. Upload a Billing Profile PDF file

3. The bot should:
   - Download the PDF
   - Process it
   - Send a confirmation message with:
     - Meter number
     - Total readings extracted
     - How many new readings were saved
     - How many duplicates were skipped
     - Details of saved readings

## Example Response Messages

### Successful Processing (New Readings)

```
📄 BILLING PROFILE PROCESSED

⚡ Meter Number: 12345

📊 EXTRACTION SUMMARY
━━━━━━━━━━━━━━━━━━━━
📈 Total Readings Extracted: 12
✅ New Readings Saved: 8
⏭️ Duplicates Skipped: 4

💾 SAVED READINGS (8)
━━━━━━━━━━━━━━━━━━━━
1. 1/15/2025
   📊 Total: 1234.56 kWh
   🔹 TOD1: 789.12 kWh
   🔸 TOD2: 445.44 kWh

[... more readings ...]

📅 Date Range: 1/1/2025 to 1/15/2025

✅ Database updated successfully!
```

### All Duplicates

```
📄 BILLING PROFILE PROCESSED

⚡ Meter Number: 12345

📊 EXTRACTION SUMMARY
━━━━━━━━━━━━━━━━━━━━
📈 Total Readings Extracted: 12
✅ New Readings Saved: 0
⏭️ Duplicates Skipped: 12

ℹ️ 12 reading(s) already existed in database and were skipped

⚠️ No new readings to save. All readings already exist in database.
```

### Error Processing

```
❌ BILLING PROFILE PROCESSING FAILED

📄 File: billing_profile.pdf

🚫 Error: Meter number not found in PDF

💡 Please check:
   • File is a valid Billing Profile PDF
   • PDF contains meter number
   • PDF contains billing dates and readings
   • PDF is not corrupted or password protected
```

## API Endpoints

All endpoints are prefixed with `/api/telegram`

### POST /webhook
- **Purpose:** Receive updates from Telegram
- **Auth:** None (called by Telegram)
- **Body:** Telegram update object

### POST /webhook/set
- **Purpose:** Set webhook URL
- **Auth:** Required (Bearer token)
- **Body:**
  ```json
  {
    "webhookUrl": "http://192.168.10.109/api/telegram/webhook"
  }
  ```

### GET /webhook/info
- **Purpose:** Get current webhook info
- **Auth:** Required (Bearer token)

### DELETE /webhook
- **Purpose:** Delete webhook (switch back to polling)
- **Auth:** Required (Bearer token)

## How It Works

### 1. PDF Upload Flow

```
User uploads PDF to Telegram
    ↓
Telegram sends update to webhook
    ↓
Backend downloads PDF from Telegram
    ↓
PDF Parser extracts meter number and readings
    ↓
Database Checker compares with existing data
    ↓
New readings are saved to database
    ↓
Confirmation message sent to Telegram
```

### 2. Data Extraction

The PDF parser looks for these patterns:
- **Meter Number:** `Meter # 12345`
- **Billing Date:** `Billing Date MM/DD/YYYY`
- **Total Energy:** `Total active forwarded energy reg (Q1+Q2+Q3+Q4) 1234.56 KWh`
- **TOD1 Energy:** `Total tod 1 active forwarded energy reg.(reg.1) (Q1+Q2+Q3+Q4) 789.12 KWh`
- **TOD2 Energy:** `Total tod 2 active forwarded energy reg.(reg.2) (Q1+Q2+Q3+Q4) 445.44 KWh`

### 3. Duplicate Detection

The system checks each reading's date against existing database entries. If a reading with the same meter number and date already exists, it's marked as a duplicate and skipped.

### 4. Database Storage

New readings are saved to the `meter_readings` table with:
- `METER_NO`: Meter number
- `reading_date`: Date of the reading
- `TOTAL_ENERGY`: Total energy consumption
- `TOD1_ENERGY`: Time-of-Day 1 energy
- `TOD2_ENERGY`: Time-of-Day 2 energy

## Troubleshooting

### Webhook Not Receiving Updates

1. Check webhook is set correctly:
   ```bash
   curl https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
   ```

2. Ensure your backend is publicly accessible

3. Check backend logs for errors

4. Verify ngrok is still running (if using ngrok)

### PDF Parsing Errors

1. Ensure PDF is a valid Billing Profile format
2. Check PDF is not password protected
3. Verify PDF contains required fields (meter number, dates, readings)
4. Check backend logs for specific parsing errors

### Database Errors

1. Ensure database is running
2. Check `meter_readings` table exists
3. Verify database connection in `.env` file
4. Check backend logs for SQL errors

## Security Notes

1. The webhook endpoint is public (no auth required) because Telegram needs to call it
2. To add security, you can:
   - Verify the request comes from Telegram by checking the `X-Telegram-Bot-Api-Secret-Token` header
   - Implement IP whitelisting for Telegram's servers
   - Use a secret path in your webhook URL (e.g., `/telegram/webhook-abc123xyz`)

3. Management endpoints (set/delete webhook) require authentication

## Stopping the Webhook

To switch back to polling mode or disable the webhook:

```bash
curl -X DELETE http://localhost:5000/api/telegram/webhook \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

## Files Created

1. **Backend Services:**
   - `backend/src/services/pdfParserService.js` - PDF parsing logic
   - `backend/src/services/readingProcessorService.js` - Database checking and saving
   - `backend/src/services/telegramService.js` - Updated with new methods

2. **Backend Controllers:**
   - `backend/src/controllers/telegramWebhookController.js` - Webhook handler

3. **Backend Routes:**
   - `backend/src/routes/telegram.js` - Telegram API routes

## Environment Variables Required

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

## Support

If you encounter issues:
1. Check backend console logs
2. Check Telegram webhook info for errors
3. Verify all environment variables are set
4. Ensure database is accessible
5. Test with a sample PDF first
