import { Request, Response } from "express";

export default class generatedSiteController
{
    static async default(req: Request, res: Response) {
        const iframe = req.body


        const response = "http://localhost:8080/template3.html"
        return res.status(200).json({response})
    }
}