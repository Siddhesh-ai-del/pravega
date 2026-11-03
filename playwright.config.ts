import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 90_000,
  retries: 0,
  workers: 1, // one golden flow at a time — sequential, deterministic
  globalSetup: "./tests/global-setup.ts",
  use: {
    baseURL: "http://localhost:3111",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "./node_modules/.bin/next start -p 3111",
    port: 3111,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
