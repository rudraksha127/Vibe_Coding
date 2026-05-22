import { createApp } from "../src/app.js";
import { connectDB } from "../src/config/db.js";

const app = createApp();

let isConnected = false;

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
}
