import { Request, Response } from "express";
import OpenAI from "openai";

export default class StreamContentController {
  static async default(req: Request, res: Response) {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      res.setHeader("Content-Type", "application/json");

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        stream: true, // Enable streaming
      });

      completion.on("data", (data) => {
        const response = data.choices[0]?.delta?.content || "";
        if (response) {
          res.write(JSON.stringify({ response }));
        }
      });

      completion.on("end", () => {
        res.end();
      });

      completion.on("error", (error) => {
        console.error("Streaming error:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
