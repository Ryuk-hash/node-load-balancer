module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'npm',
      args: 'run start',
      instances: 'max', // equal to cpus available
      // exec_mode: 'cluster', // pm2 cluster mode, load balances requests
      log_date_format: 'MMMM D YYYY, h:mm:ss a, Z',
      increment_var: 'APP_PORT',
      kill_timeout: 1500, // pm2 sends SIGKILL signal>wait time in ms, if app doesnt exist itself
      // merge_logs: true, // don't store logs for each instance in its separate file, instead merge into one
      env: {
        APP_PORT: 5000,
      },
    },
  ],
};
