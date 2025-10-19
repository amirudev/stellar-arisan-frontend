// Vercel API route for React Router SSR
import { createRequestHandler } from "@react-router/node";

// Import the built server
const build = await import("../build/server/index.js");

export default createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
});
