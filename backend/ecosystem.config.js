// PM2 Ecosystem Configuration File
// This file configures how PM2 manages your Node.js application

module.exports = {
  apps: [{
    // Application name
    name: 'cms-backend',

    // Script to start
    script: './src/app.js',

    // Working directory
    cwd: '/var/www/cms/backend',

    // Instances to run (cluster mode)
    instances: 1,

    // Execution mode: cluster or fork
    exec_mode: 'fork',

    // Watch for file changes and restart (disable in production)
    watch: false,

    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },

    // Development environment variables (use with: pm2 start ecosystem.config.js --env development)
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    },

    // Staging environment variables
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3000
    },

    // Error log file
    error_file: '/var/www/cms/logs/cms-backend-error.log',

    // Output log file
    out_file: '/var/www/cms/logs/cms-backend-out.log',

    // Log date format
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    // Merge logs from all instances
    merge_logs: true,

    // Auto restart if app crashes
    autorestart: true,

    // Max memory restart threshold (restart if exceeds)
    max_memory_restart: '500M',

    // Minimum uptime before considering app as stable
    min_uptime: '10s',

    // Maximum number of unstable restarts before stopping
    max_restarts: 10,

    // Delay between restart attempts
    restart_delay: 4000,

    // Kill timeout (time to wait for graceful shutdown)
    kill_timeout: 5000,

    // Listen timeout (time to wait for app to listen)
    listen_timeout: 10000,

    // Cron restart (optional - restart at specific time)
    // cron_restart: '0 0 * * *', // Restart every day at midnight

    // Script arguments
    args: '',

    // Interpreter (node by default)
    interpreter: 'node',

    // Source map support
    source_map_support: true,

    // Instance var (PM2_INSTANCE_ID)
    instance_var: 'INSTANCE_ID',

    // Disable auto restart at specific exit codes
    stop_exit_codes: [0],

    // Time to wait before forcing a reload
    wait_ready: false,

    // Maximum time to wait for ready event
    listen_timeout: 3000,

    // Graceful shutdown
    shutdown_with_message: false
  }]
};
