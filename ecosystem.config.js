module.exports = {
    apps: [
        {
            name: 'chat-template-home',
            script: 'npm',
            args: 'start',
            cwd: '/var/www/chat-template-home',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            // Logging
            error_file: '/var/log/pm2/chat-template-home-error.log',
            out_file: '/var/log/pm2/chat-template-home-out.log',
            log_file: '/var/log/pm2/chat-template-home-combined.log',
            time: true,
            // Graceful restart
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000,
        },
    ],
}
