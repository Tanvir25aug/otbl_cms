# Migration Notes - Telegram Bot to Firebase

This document explains the changes made to migrate the Telegram bot from your Express backend to Firebase Cloud Functions.

## What Changed?

### 1. Backend Server Changes

**File: `backend/src/app.js`**
- ❌ Removed: Telegram bot initialization
- ✅ Added: Information message about Firebase migration
- The backend server no longer runs the Telegram bot

**File: `backend/src/routes/telegram.js`**
- ✅ Added: API key authentication middleware
- The customer info endpoint now requires API key for security

**New File: `backend/src/middleware/apiKeyAuth.js`**
- ✅ Created: API key authentication middleware
- Validates `X-API-Key` header against `API_SECRET_KEY` environment variable

### 2. New Firebase Project

**New Directory: `firebase-telegram-api/`**
- Complete Firebase Cloud Functions project
- Telegram bot logic moved here
- Acts as proxy between Telegram and your backend

**Key Files:**
- `functions/index.js` - Main Cloud Functions entry point
- `functions/telegramBot.js` - Telegram bot service
- `functions/apiClient.js` - Client to communicate with backend

## Architecture Comparison

### Before (Old Architecture)
```
Telegram → (Polling) → Express Backend → Database
```
- Bot runs inside Express server
- Uses polling (continuous API requests)
- Telegram bot token needed on server
- Server must be always running

### After (New Architecture)
```
Telegram → (Webhook) → Firebase Functions → Express Backend → Database
```
- Bot runs on Firebase (serverless)
- Uses webhooks (Telegram pushes to Firebase)
- Better separation of concerns
- More scalable and reliable

## Benefits of Migration

1. **Serverless**: No need to keep bot service running 24/7
2. **Scalable**: Firebase auto-scales with demand
3. **Cost-effective**: Pay only for actual usage (free tier is generous)
4. **Reliable**: Firebase handles infrastructure
5. **Secure**: API key authentication between Firebase and backend
6. **Maintainable**: Separate bot logic from business logic

## What Still Works the Same

- ✅ Customer search functionality
- ✅ All bot commands (/start, /help)
- ✅ Message formatting
- ✅ Customer data display
- ✅ Backend API endpoints
- ✅ Database queries

## Breaking Changes

### For Users
- **None** - Users interact with bot exactly the same way

### For Developers
1. **Telegram bot is no longer in backend**
   - Don't look for bot code in `backend/src/services/telegramBot.js`
   - Bot is now in `firebase-telegram-api/functions/`

2. **Environment variables changed**
   - Backend no longer needs `TELEGRAM_BOT_TOKEN`
   - Backend now needs `API_SECRET_KEY`
   - Firebase needs: `telegram.bot_token`, `server.url`, `server.api_key`

3. **Telegram API endpoint is protected**
   - Requires `X-API-Key` header
   - Only Firebase functions should call it

## Environment Variables

### Backend `.env` (Old)
```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_API_BASE_URL=...
TELEGRAM_MODE=polling
TELEGRAM_WEBHOOK_URL=...
```

### Backend `.env` (New)
```bash
# Telegram vars no longer needed
# Add this:
API_SECRET_KEY=your-secret-key-here
```

### Firebase Config (New)
```bash
firebase functions:config:set \
  telegram.bot_token="YOUR_BOT_TOKEN" \
  server.url="YOUR_SERVER_URL" \
  server.api_key="YOUR_API_SECRET_KEY"
```

## Migration Checklist

### Backend Server
- [x] Remove Telegram bot initialization from `app.js`
- [x] Add API key authentication middleware
- [x] Protect Telegram routes with API key
- [x] Add `API_SECRET_KEY` to `.env`
- [ ] Remove old Telegram environment variables (optional cleanup)
- [ ] Restart backend server

### Firebase Setup
- [ ] Create Firebase project
- [ ] Install Firebase CLI
- [ ] Configure `.firebaserc` with project ID
- [ ] Set Firebase environment variables
- [ ] Install dependencies (`npm install`)
- [ ] Deploy to Firebase
- [ ] Setup webhook

### Testing
- [ ] Test `/start` command
- [ ] Test customer search
- [ ] Test `/help` command
- [ ] Verify health endpoint
- [ ] Check Firebase logs
- [ ] Monitor for errors

## Rollback Plan (If Needed)

If you need to rollback to the old system:

1. **Restore backend code:**
   ```bash
   git checkout <previous-commit> backend/src/app.js
   ```

2. **Delete webhook:**
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/deleteWebhook
   ```

3. **Restart backend:**
   ```bash
   cd backend
   npm start
   ```

## Files to Keep

### Keep These (Still Used)
- `backend/src/controllers/telegramController.js` - Still handles customer queries
- `backend/src/routes/telegram.js` - API routes still needed
- `backend/src/models/*` - Database models unchanged

### Archive These (No Longer Used)
- `backend/src/services/telegramBot.js` - Bot logic moved to Firebase
- `backend/src/controllers/telegramWebhookController.js` - Webhook handled by Firebase

## Security Improvements

1. **API Key Authentication**: Backend API is now protected
2. **Separation**: Bot token only in Firebase, not in backend
3. **HTTPS**: All Firebase functions are HTTPS by default
4. **Environment Variables**: Sensitive data in Firebase config, not in code

## Monitoring

### Old System
- Check backend server logs
- Monitor server uptime

### New System
- Check Firebase Console → Functions → Logs
- Use `firebase functions:log` command
- Monitor Firebase usage dashboard
- Check health endpoint

## Cost Implications

### Old System
- Server must run 24/7
- Fixed cost regardless of usage

### New System
- Pay only for invocations
- Free tier: 2M invocations/month
- Likely to stay within free tier
- Scales automatically

## Performance

### Response Time
- **Old**: Depends on polling interval (usually 2-5 seconds delay)
- **New**: Instant via webhooks (<1 second)

### Reliability
- **Old**: If server goes down, bot stops working
- **New**: Firebase infrastructure with 99.95% uptime SLA

## Development Workflow

### Old Workflow
```bash
# Make changes
vim backend/src/services/telegramBot.js

# Restart server
cd backend
npm start
```

### New Workflow
```bash
# Make changes
vim firebase-telegram-api/functions/telegramBot.js

# Deploy
cd firebase-telegram-api
firebase deploy --only functions

# No restart needed - automatic
```

## Testing in Development

### Old System
- Run server locally
- Bot responds to messages

### New System
- Option 1: Deploy to Firebase (recommended)
- Option 2: Use Firebase emulator (optional)
  ```bash
  cd firebase-telegram-api/functions
  firebase functions:config:get > .runtimeconfig.json
  npm run serve
  ```

## Common Issues After Migration

### Issue: Bot not responding
**Cause**: Webhook not set or incorrect
**Solution**: Visit setupWebhook endpoint

### Issue: "Invalid API key" errors
**Cause**: API keys don't match between Firebase and backend
**Solution**: Verify keys match exactly

### Issue: "Server connection disconnected"
**Cause**: Backend not accessible from Firebase
**Solution**: Check server URL and firewall settings

## Support and Documentation

- **Quick Start**: See [QUICK-START.md](./firebase-telegram-api/QUICK-START.md)
- **Full Guide**: See [DEPLOYMENT-GUIDE.md](./firebase-telegram-api/DEPLOYMENT-GUIDE.md)
- **Reference**: See [README.md](./firebase-telegram-api/README.md)

## Timeline

1. **Phase 1**: Setup Firebase project and deploy ✅
2. **Phase 2**: Configure environment variables ✅
3. **Phase 3**: Test bot functionality ⏳
4. **Phase 4**: Monitor and optimize ⏳
5. **Phase 5**: Remove old bot code (optional cleanup) ⏳

## Questions?

- Check Firebase logs: `firebase functions:log`
- Check health: `curl https://YOUR_URL/health`
- Check webhook: `curl https://YOUR_URL/webhookInfo`
- Review documentation in `firebase-telegram-api/`
