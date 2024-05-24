import * as fs from "fs";
import { Request, Response } from "express";
import { ToolsService } from "services";

export default class WebController {
  static async default(req: Request, res: Response) {
    let htmlContent = fs.readFileSync(`./static/index.html`, {
      encoding: "utf-8",
    });

    htmlContent = htmlContent
      .replaceAll("<!-- {{globalObject}} -->", "")
      .replaceAll("{{title}}", "Gravity Write")
      .replaceAll("{{meta_title}}", "Free AI Generating Tool")
      .replaceAll(
        "{{meta_description}}",
        "Discover the power of effortless creativity with Gravity Write – your go-to AI writing companion. Experience seamless content generation, precision editing, and boundless inspiration for your writing projects. Unleash your imagination with Gravity Write today."
      );

    res.send(htmlContent);
  }
}
