// Vercel API route for React Router SSR
import { createRequestHandler } from "@react-router/node";

export default async function handler(req, res) {
  try {
    // Import the built server dynamically
    const build = await import("../build/server/index.js");
    
    const handleRequest = createRequestHandler({
      build,
      mode: process.env.NODE_ENV,
    });
    
    return handleRequest(req, res);
  } catch (error) {
    console.error("Failed to import server build:", error);
    res.status(500).json({ 
      error: "Server build not available. Make sure to run 'npm run build' before deployment.",
      details: error.message
    });
  }
}
