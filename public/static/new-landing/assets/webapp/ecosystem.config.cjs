module.exports = {
  apps: [
    {
      name: 'concillio',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      log_file: 'logs/concillio.log',
      out_file: 'logs/concillio.out.log',
      error_file: 'logs/concillio.error.log',
      merge_logs: true,
      time: true
    }
  ]
}