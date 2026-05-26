import type { Request } from "express";
import { Router } from "express";

import type { AafAuthClient } from "../auth/aafClient.ts";
import type { AppConfig } from "../config.ts";

export function createAuthRouter(
  authClient: AafAuthClient,
  config: AppConfig,
): Router {
  const router = Router();

  router.get("/login", async (req, res) => {
    const authRequest = await authClient.createAuthorizationRequest();

    req.session.oidc = authRequest.sessionState;
    res.redirect(authRequest.url.href);
  });

  router.get("/callback", async (req, res) => {
    const sessionState = req.session.oidc;

    if (!sessionState) {
      res.redirect("/?error=login_failed");
      return;
    }

    try {
      const currentUrl = buildCallbackUrl(req, config.aaf.redirectUri);
      const user = await authClient.completeAuthorization(
        currentUrl,
        sessionState,
      );

      await regenerateSession(req);
      req.session.user = user;
      res.redirect("/?view=protected");
    } catch (error) {
      req.app.get("logger")?.error?.("AAF OIDC callback failed", error);
      req.session.oidc = undefined;
      res.redirect("/?error=login_failed");
    }
  });

  router.get("/logout", async (req, res) => {
    await destroySession(req);
    res.clearCookie(config.session.name, { path: "/" });
    res.redirect("/");
  });

  router.post("/logout", async (req, res) => {
    await destroySession(req);
    res.clearCookie(config.session.name, { path: "/" });
    res.json({ ok: true });
  });

  return router;
}

export function buildCallbackUrl(
  req: Request,
  registeredRedirectUri: string,
): URL {
  const currentUrl = new URL(registeredRedirectUri);
  const requestUrl = new URL(
    req.originalUrl,
    `${currentUrl.protocol}//${currentUrl.host}`,
  );

  currentUrl.search = requestUrl.search;
  currentUrl.hash = "";

  return currentUrl;
}

function regenerateSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function destroySession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
