const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function clearConflict() {
    if (!TELEGRAM_BOT_TOKEN) {
        console.error('❌ TELEGRAM_BOT_TOKEN not found in .env file');
        process.exit(1);
    }

    console.log('🔧 Clearing Telegram bot conflicts...\n');

    try {
        // Create a non-polling bot instance
        const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

        // Get current webhook info
        console.log('📡 Checking webhook status...');
        const webhookInfo = await bot.getWebHookInfo();

        if (webhookInfo.url) {
            console.log(`⚠️  Active webhook found: ${webhookInfo.url}`);
            console.log('🧹 Deleting webhook...');
            await bot.deleteWebHook();
            console.log('✅ Webhook deleted successfully');
        } else {
            console.log('ℹ️  No active webhook found');
        }

        // Get bot info to verify connection
        console.log('\n📊 Bot Information:');
        const botInfo = await bot.getMe();
        console.log(`   • Bot Name: ${botInfo.first_name}`);
        console.log(`   • Username: @${botInfo.username}`);
        console.log(`   • ID: ${botInfo.id}`);

        // Get updates to clear any pending
        console.log('\n🧹 Clearing pending updates...');
        const updates = await bot.getUpdates({ offset: -1 });
        console.log(`   • Cleared ${updates.length} pending updates`);

        console.log('\n✅ Telegram bot conflict cleared successfully!');
        console.log('\n💡 You can now start your server with:');
        console.log('   npm run dev   (for development)');
        console.log('   npm start     (for production)');
        console.log('\n⚠️  Make sure no other instances are running before starting!');

    } catch (error) {
        console.error('\n❌ Error clearing conflict:', error.message);

        if (error.message.includes('401')) {
            console.error('\n💡 Invalid bot token. Please check TELEGRAM_BOT_TOKEN in .env file');
        } else if (error.message.includes('409')) {
            console.error('\n💡 Another instance is still polling. Wait 60 seconds and try again.');
        }

        process.exit(1);
    }
}

clearConflict();
