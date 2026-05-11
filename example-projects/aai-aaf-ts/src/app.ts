import compression from "compression";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";

import type { AafAuthClient } from "./auth/aafClient.js";
import type { AppConfig } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";
import { createApiRouter } from "./routes/apiRoutes.js";
import { createAuthRouter } from "./routes/authRoutes.js";
import { createIndexRouter } from "./routes/indexRoutes.js";

export interface AppDependencies {
  config: AppConfig;
  authClient: AafAuthClient;
}

export function createApp({ config, authClient }: AppDependencies) {
  const app = express();

  app.disable("x-powered-by");
  app.set("logger", console);

  if (config.server.trustProxy) {
    app.set("trust proxy", 1);
  }

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "base-uri": ["'self'"],
          "connect-src": ["'self'"],
          "default-src": ["'self'"],
          "form-action": ["'self'"],
          "frame-ancestors": ["'none'"],
          "img-src": ["'self'", "data:"],
          "script-src": ["'self'", "'unsafe-inline'"],
          "style-src": ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );
  app.use(compression());

  if (config.nodeEnv !== "test") {
    app.use(morgan("dev"));
  }

  app.use(express.json({ limit: "32kb" }));
  app.use(express.urlencoded({ extended: false }));

  app.use(
    session({
      name: config.session.name,
      secret: config.session.secret,
      resave: false,
      saveUninitialized: false,
      unset: "destroy",
      cookie: {
        httpOnly: true,
        maxAge: config.session.maxAgeMs,
        path: "/",
        sameSite: "lax",
        secure: config.session.secureCookie,
      },
    }),
  );

  app.use(
    express.static(config.server.publicDir, {
      index: false,
      maxAge: config.isProduction ? "1h" : 0,
    }),
  );
  app.use("/", createIndexRouter(config));
  app.use("/auth", createAuthRouter(authClient, config));
  app.use("/api", createApiRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
