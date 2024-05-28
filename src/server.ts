import { createServer, Server as HTTPServer } from "http";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { webRouter } from "routers";
import { json } from "body-parser";
import helmet from "helmet";

/**
 * The server class that orchestrates the entire application together.
 */
export default class Server {
  /**
   * PORT number on which the server needs to be started
   */
  private PORT: number;

  /**
   * Express Application instance that handles the API endpoints
   */
  private application: express.Application;

  /**
   * HTTPServer that will contain the application instance
   */
  private httpServer: HTTPServer;

  constructor() {
    this.PORT = parseInt(process.env.PORT) || 8080;
    this.application = express();
    this.httpServer = createServer(this.application);
  }

  /**
   * Init all configurations and setting needed for application.
   */
  async setup() {
    // load .env
    dotenv.config();
    this.application.use(json());
    this.application.use(cors({ origin: "*" }));
    this.application.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader(
        "X-Frame-Options",
        "ALLOW-FROM https://your-frontend-domain.com"
      );
      res.setHeader(
        "Content-Security-Policy",
        "frame-ancestors 'self' https://ai-builder-backend.onrender.com/"
      );
      next();
    });

    this.application.use(express.static("./static", { index: false }));
    this.application.use("", webRouter);

    this.application.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            frameAncestors: [
              "'self'",
              "https://ai-builder-backend.onrender.com/",
            ],
          },
        },
        frameguard: false, // Disable frameguard since we set X-Frame-Options manually
      })
    );
  }

  /**
   * Start the server on provided port number
   */

  async start() {
    this.httpServer.listen(this.PORT, () => {
      console.log(`Server started on port ${this.PORT}`);
    });
  }
}
