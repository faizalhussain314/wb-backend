import { Request, Response } from "express";
import OpenAI from "openai";

export default class StreamContentController {
  static async default(req: Request, res: Response) {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        stream: true,
      });
      for await (const chunk of stream) {
        res.write(chunk.choices[0]?.delta?.content || "");
      }
      res.end();
    } catch (error) {
      res.status(500).json({ error: "Failed to generate content" });
    }
  }
}
