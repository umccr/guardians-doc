import type { OidcSessionState } from "../auth/aafClient.ts";
import type { UserClaims } from "./user.ts";

declare module "express-session" {
  interface SessionData {
    oidc?: OidcSessionState;
    user?: UserClaims;
  }
}

export {};
