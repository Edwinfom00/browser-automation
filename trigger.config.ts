import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_kckdciflcsjpreamfiya",
  runtime: "node",
  logLevel: "log",
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["modules"],
  build: {
    // Both resolve platform-specific files at require time, which the bundler
    // rewrites into something broken. Trigger installs them in the image
    // instead, from package.json.
    external: ["playwright-core", "steel-sdk"],
  },
});
