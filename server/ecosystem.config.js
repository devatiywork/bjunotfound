module.exports = {
  apps: [
    {
      name: 'timenofat-api',
      script: 'dist/src/main.js',
      cwd: '/home/devatiy_admin/postgres/bjunotfound/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
