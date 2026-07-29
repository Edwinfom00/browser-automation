import { logger, metadata, task, wait } from "@trigger.dev/sdk";

export const helloWorldTask = task({
  id: "hello-world",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: { message?: string }, { ctx }) => {
    logger.log("Hello, world!", { payload, ctx });

    // metadata is streamed to any subscriber (see useRealtimeRun in the UI)
    metadata.set("label", "Preparing").set("progress", 10);

    await wait.for({ seconds: 2 });

    metadata.set("label", "Running steps").set("progress", 55);

    await wait.for({ seconds: 3 });

    metadata.set("label", "Finishing up").set("progress", 100);

    return {
      message: "Task Finished",
    }
  },
});
