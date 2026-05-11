import type { OidcSessionState } from "../auth/aafClient.js";
import type { UserClaims } from "./user.js";

declare module "express-session" {
  interface SessionData {
    oidc?: OidcSessionState;
    user?: UserClaims;
  }
}

export {};
