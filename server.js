import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set.");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

app.get("/", (req, res) => {
    res.send("👋 DocAna Backend is LIVE! Use the /ask endpoint to chat.");
});

app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = question;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.json({ reply: response.text() });

  } catch (err) {
    console.error("Error:", err);
    if (err.message.includes('API_KEY_INVALID')) {
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

app.get("/test", async (req, res) => {
    res.status(200).send("Test route is functional.");
});

export default app;
