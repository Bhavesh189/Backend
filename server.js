import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Gemini AI
// Ensure GEMINI_API_KEY is available in the .env file
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set in the .env file.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    // Using gemini-2.5-flash for fast chat responses
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = question;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Check if response text is present
    const replyText = response.text().trim();

    if (!replyText) {
        throw new Error("Gemini returned an empty response.");
    }
    
    res.json({ reply: replyText });

  } catch (err) {
    console.error("Gemini API Error:", err.message);
    // Send a 500 status with the error details
    res.status(500).json({ 
      error: "AI Response Error",
      details: err.message 
    });
  }
});

// Test endpoint to check if the server is running (optional)
app.get("/test", (req, res) => {
    res.send("Backend server is running!");
});

// Server ko start karne ke liye: Yeh code missing tha
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running successfully on http://localhost:${PORT}`);
});
