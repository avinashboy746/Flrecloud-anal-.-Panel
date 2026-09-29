module.exports = {
  apps: [
    {
      name: "firecloud-panel",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
