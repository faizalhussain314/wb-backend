import { DescontentController, WebController } from "controllers";
import generatedSiteController from "controllers/generatedSite-controller";
import WebcontentController from "controllers/webcontent-controller";
import StreamContentController from "controllers/StreamContentController";
import { Router } from "express";
import StreamIframeController from "controllers/StreamIframe-controller";

const webRouter = Router();

webRouter.post("/get-description", DescontentController.default);
webRouter.post("/web-content", WebcontentController.default);
webRouter.post("/generatedsite", generatedSiteController.default);
webRouter.post("/streamcontent", StreamContentController.default);
webRouter.post("/StreamIframeController", StreamIframeController.default);
webRouter.all("*", WebController.default);

export default webRouter;
