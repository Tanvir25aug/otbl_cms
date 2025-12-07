const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const sequelize = require('./config/database');
const routes = require('./routes');
const jwt = require('jsonwebtoken');
const ConnectionLog = require('./models/ConnectionLog');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend URL
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Make io accessible to our router
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('OTBL CMS Backend is running.');
});

// Store active connections with metadata
const activeConnections = new Map();

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    // Allow anonymous connections but track them
    socket.userId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Socket auth error:', error.message);
    socket.userId = null;
    next();
  }
});

io.on('connection', async (socket) => {
  const connectionTime = new Date();
  const ipAddress = socket.handshake.address;
  const userAgent = socket.handshake.headers['user-agent'];

  console.log(`User connected: ${socket.userId || 'anonymous'} (${socket.id})`);

  // Store connection info
  activeConnections.set(socket.id, {
    userId: socket.userId,
    connectionTime,
    ipAddress,
    userAgent
  });

  // Log RC (Reconnect/Connect) event
  if (socket.userId) {
    try {
      await ConnectionLog.create({
        userId: socket.userId,
        eventType: 'RC',
        timestamp: connectionTime,
        ipAddress,
        userAgent,
        socketId: socket.id,
        metadata: {
          headers: socket.handshake.headers
        }
      });
    } catch (error) {
      console.error('Error logging connection:', error);
    }
  }

  socket.on('disconnect', async () => {
    const disconnectionTime = new Date();
    const connectionInfo = activeConnections.get(socket.id);

    console.log(`User disconnected: ${socket.userId || 'anonymous'} (${socket.id})`);

    // Log DC (Disconnect) event
    if (socket.userId && connectionInfo) {
      const duration = Math.floor((disconnectionTime - connectionInfo.connectionTime) / 1000); // in seconds

      try {
        await ConnectionLog.create({
          userId: socket.userId,
          eventType: 'DC',
          timestamp: disconnectionTime,
          ipAddress: connectionInfo.ipAddress,
          userAgent: connectionInfo.userAgent,
          socketId: socket.id,
          duration,
          metadata: {
            connectionDuration: duration
          }
        });
      } catch (error) {
        console.error('Error logging disconnection:', error);
      }
    }

    // Clean up
    activeConnections.delete(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Start Telegram bot based on TELEGRAM_BOT_ENABLED setting
  const botEnabled = process.env.TELEGRAM_BOT_ENABLED === 'true';

  if (botEnabled) {
    const telegramBotService = require('./services/telegramBotService');
    telegramBotService.start();
  } else {
    console.log('ℹ️  Telegram bot is disabled (set TELEGRAM_BOT_ENABLED=true in .env to enable)');
  }
});

// Graceful shutdown
const shutdown = () => {
  console.log('\n🛑 Shutting down gracefully...');

  // Stop Telegram bot if it was enabled
  const botEnabled = process.env.TELEGRAM_BOT_ENABLED === 'true';
  if (botEnabled) {
    const telegramBotService = require('./services/telegramBotService');
    telegramBotService.stop();
  }

  // Close server
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    console.error('⚠️  Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);