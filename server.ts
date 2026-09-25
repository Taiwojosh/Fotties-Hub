import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for generating description
  app.post("/api/generate-description", async (req, res) => {
    const { productName, adminApiKey, model } = req.body;
    
    try {
      const apiKey = adminApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Gemini API Key is required. Please insert your API key or configure GEMINI_API_KEY." });
      }
      
      const prompt = `Write a compelling and professional product description for this premium fashion product: ${productName}. Keep it short, elegant, and highly attractive for a premium fashion e-commerce store like Dams Collections. It MUST be extremely concise, strictly under 100 characters in length. No markdown formatting, no hashtags, keep it as a single beautiful short descriptive sentence.`;
      const genAI = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      const result = await genAI.models.generateContent({
        model: model || "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = result.text;
      res.json({ description: text });
    } catch (error) {
      console.error("Error generating description:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate description" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
