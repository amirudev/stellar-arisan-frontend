// Vercel API route for React Router SSR
import { createRequestHandler } from "@react-router/node";

// Lazily import the built server to avoid top-level await issues in serverless
let buildPromise;
function getBuild() {
  if (!buildPromise) {
    buildPromise = import("../build/server/index.js");
  }
  return buildPromise;
}

export default async function handler(req, res) {
  const build = await getBuild();
  const handleRequest = createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  });
  return handleRequest(req, res);
}
