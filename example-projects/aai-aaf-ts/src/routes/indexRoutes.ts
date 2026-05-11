import path from "node:path";

import { Router } from "express";

import type { AppConfig } from "../config.js";

export function createIndexRouter(config: AppConfig): Router {
  const router = Router();
  const indexPath = path.join(config.server.publicDir, "index.html");

  router.get("/", (_req, res) => {
    res.sendFile(indexPath);
  });

  return router;
}
