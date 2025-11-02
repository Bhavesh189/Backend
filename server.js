import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors()); 
app.use(bodyParser.json());

const geminiApiKey = process.env.GEMINI_API_KEY;

// Root route for Vercel health check
app.get("/", (req, res) => {
    res.send("👋 DocAna Backend is LIVE! Use the /ask endpoint to chat.");
});

app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    if (!geminiApiKey) {
        return res.status(500).json({ 
            error: "Configuration Error",
            details: "GEMINI_API_KEY environment variable is missing on Vercel."
        });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    
    // Using the correct and recommended model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent(question);
    const response = await result.response;
    
    // FIX HERE: .text() is a method, not a property
    res.json({ reply: response.text() });

  } catch (err) {
    console.error("Error:", err);
    if (err.message.includes('API_KEY_INVALID') || err.message.includes('API_KEY_MISSING')) {
         return res.status(401).json({ 
            error: "Authentication Error",
            details: "Invalid or unauthorized API Key. Check Vercel Environment Variables."
        });
    }
    res.status(500).json({ 
      error: "AI Response Error",
      details: err.message 
    });
  }
});

export default app;
