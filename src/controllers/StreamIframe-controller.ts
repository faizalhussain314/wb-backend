import { Request, Response } from "express";
import OpenAI from "openai";

export default class StreamIframeController {
  static async default(req: Request, res: Response) {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required",
        prompts: `this is the prompts value ${prompt}`,
      });
      console.log("prompt's value", prompt);
    }

    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a website content writer. Your task is to write website content for websites. At the end of every sentence, you should put a semicolon. Every time you will get example content, your task is to replace the content with the exact word count with the required business name.you sholud write content like inside the exampleContent tag dont' add the tag.just rewrite content with end of semicolorn that's it.first count the all words then generate with same word count and same semicolon count",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 2500,
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
