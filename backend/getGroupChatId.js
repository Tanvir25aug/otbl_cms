require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN not found in .env file');
    process.exit(1);
}

console.log('🤖 Starting Telegram Bot to get Group Chat ID...\n');
console.log('📋 Instructions:');
console.log('1. Add your bot (@Otbl_cmstestenvbot) to your Telegram group');
console.log('2. Send any message in the group (e.g., "Hello bot!")');
console.log('3. Wait for the chat ID to appear below\n');
console.log('👂 Listening for messages...\n');

const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    const chatTitle = msg.chat.title || 'Private Chat';
    const messageText = msg.text || '[media/other]';
    const from = msg.from.first_name || 'Unknown';

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📨 New Message Received!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`👤 From: ${from}`);
    console.log(`💬 Chat Type: ${chatType}`);
    console.log(`📝 Chat Title: ${chatTitle}`);
    console.log(`🆔 Chat ID: ${chatId}`);
    console.log(`📄 Message: ${messageText}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    if (chatType === 'group' || chatType === 'supergroup') {
        console.log('✅ GROUP DETECTED!\n');
        console.log(`🎯 Copy this Chat ID and add it to your .env file:`);
        console.log(`   TELEGRAM_CHAT_ID=${chatId}\n`);
        console.log(`💡 You can now press Ctrl+C to stop this script\n`);
    } else if (chatType === 'private') {
        console.log('ℹ️  This is a private chat, not a group.\n');
        console.log(`💡 If you want the group chat ID:`);
        console.log(`   1. Add the bot to your group`);
        console.log(`   2. Send a message in the group\n`);
    }
});

bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error.message);
    if (error.message.includes('409')) {
        console.error('\n⚠️  CONFLICT ERROR (409)');
        console.error('This means another instance is using the bot.');
        console.error('Solutions:');
        console.error('1. Stop all other running servers');
        console.error('2. Run: npm run clear-telegram');
        console.error('3. Wait 60 seconds');
        console.error('4. Try again\n');
        process.exit(1);
    }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping bot...');
    bot.stopPolling();
    process.exit(0);
});
