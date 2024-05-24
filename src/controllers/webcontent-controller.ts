import { Request, Response } from "express";
import OpenAI from "openai";

export default class WebcontentController {
    static async default(req: Request, res: Response) {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        try {
            const { prompt } = req.body;


            if (!prompt) {
                return res.status(400).json({ error: "Prompt is required" });
            }

            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "assistant", content: prompt }],
            });

            const response = completion.choices[0]?.message?.content || "";

            return res.status(200).json({ response });
        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}
