// Vercel API route for React Router SSR
import { createRequestHandler } from "@react-router/node";

export default async function handler(req, res) {
  try {
    // Import the built server dynamically
    const build = await import("../build/server/index.js");
    
    const handleRequest = createRequestHandler({
      build,
      mode: process.env.NODE_ENV || "production",
    });
    
    return handleRequest(req, res);
  } catch (error) {
    console.error("Server error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
