import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

interface ExtendedRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string>;
  method?: string;
}

interface ExtendedResponse extends ServerResponse {
  status: (statusCode: number) => ExtendedResponse;
  json: (body: any) => void;
}

export default async function handler(req: ExtendedRequest, res: ExtendedResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productName, adminApiKey, model } = req.body || {};

  try {
    const apiKey = adminApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'Gemini API Key is required. Please provide an API key or configure GEMINI_API_KEY.' });
    }

    const prompt = `Write a compelling and professional product description for this premium fashion product: ${productName}. Keep it short, elegant, and highly attractive for a premium fashion e-commerce store like Dams Collections. It MUST be extremely concise, strictly under 100 characters in length. No markdown formatting, no hashtags, keep it as a single beautiful short descriptive sentence.`;

    const genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const result = await genAI.models.generateContent({
      model: model || 'gemini-3.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return res.status(200).json({ description: result.text });
  } catch (error) {
    console.error('Error generating description:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate description' });
  }
}
