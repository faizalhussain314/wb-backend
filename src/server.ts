import { createServer, Server as HTTPServer } from "http"
import cors from "cors";
import express from "express"
import dotenv from "dotenv"
import { webRouter } from "routers";
import { json } from "body-parser";


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
        this.application.use(json())
        this.application.use(cors({ origin: '*' }))

        this.application.use(express.static("./static", { index: false }));
        this.application.use("", webRouter)




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