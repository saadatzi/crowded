module.exports = {
    apps: [
        {
            cwd: './core',
            name: 'crowdedCore',
            script: 'app.js',
            instances: "max",
            exec_mode : "cluster",
            autorestart: true,
            watch: true,
            ignore_watch: ["node_modules"],
            max_memory_restart: '1G',
            // instance_var: 'INSTANCE_ID',
            min_uptime: 5000,
            restart_delay: 3000,
            max_restarts: 7,
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            }
        },
        {
            cwd: './Report_CMS',
            name: 'Report_BTMS',
            script: 'app.js',
            // instances: 1,
            autorestart: true,
            watch: true,
            ignore_watch: ["node_modules"],
            max_memory_restart: '1G',
            instance_var: 'INSTANCE_ID',
            min_uptime: 5000,
            restart_delay: 3000,
            max_restarts: 7,
            // exec_mode: 'fork',
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ],

    deploy: {
        production: {
            user: 'node',
            host: '212.83.163.1',
            ref: 'origin/master',
            repo: 'git@github.com:repo.git',
            path: '/var/www/production',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
        }
    }
};
