import { MongoMemoryServer } from "mongodb-memory-server";

async function startMongo() {
  try {
    console.log("Starting MongoDB Memory Server...");
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: "interviewforge_ai"
      }
    });
    console.log("MongoDB Memory Server successfully started on port 27017!");
    console.log("URI:", mongod.getUri());

    // Keep the process alive
    process.on("SIGINT", async () => {
      console.log("Stopping MongoDB Memory Server...");
      await mongod.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start MongoDB Memory Server:", error);
    process.exit(1);
  }
}

startMongo();
