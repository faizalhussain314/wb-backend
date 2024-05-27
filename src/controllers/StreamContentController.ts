import { Request, Response } from "express";
import axios from "axios";

export default class StreamContentController {
  static async default(req: Request, res: Response) {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      res.setHeader("Content-Type", "application/json");

      const response = await axios({
        method: "post",
        url: "https://api.openai.com/v1/chat/completions",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        data: {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          stream: true,
        },
        responseType: "stream",
      });

      response.data.on("data", (chunk: Buffer) => {
        const lines = chunk
          .toString("utf8")
          .split("\n")
          .filter((line) => line.trim() !== "");
        for (const line of lines) {
          const message = line.replace(/^data: /, "");
          if (message === "[DONE]") {
            res.end();
            return;
          }
          try {
            const parsed = JSON.parse(message);
            const content = parsed.choices[0]?.delta?.content || "";
            if (content) {
              res.write(JSON.stringify({ response: content }));
            }
          } catch (error) {
            console.error("Could not parse stream message", message, error);
          }
        }
      });

      response.data.on("end", () => {
        res.end();
      });

      response.data.on("error", (error: Error) => {
        console.error("Streaming error:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
