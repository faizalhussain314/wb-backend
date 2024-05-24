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
                messages: [{ role: "assistant", content: prompt }],
            });

            // Send each message in the completion as soon as it's available
            for (const choice of completion.choices) {
                const response = choice?.message?.content || "";
                res.write(JSON.stringify({ response }) );
                await new Promise(resolve => setTimeout(resolve)); // Optional delay to control streaming speed
            }

            res.end();
        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}
