import path from "node:path";

import request from "supertest";
import { describe, expect, it } from "vitest";

import type {
  AafAuthClient,
  AuthorizationRequest,
  OidcSessionState,
} from "../src/auth/aafClient.js";
import { createApp } from "../src/app.js";
import type { AppConfig } from "../src/config.js";
import type { UserClaims } from "../src/types/user.js";

const testUser: UserClaims = {
  sub: "user-123",
  name: "Example User",
  email: "example.user@example.edu",
  preferred_username: "example.user",
  raw_claims: {
    sub: "user-123",
    name: "Example User",
    email: "example.user@example.edu",
    preferred_username: "example.user",
  },
};

class FakeAafAuthClient implements AafAuthClient {
  async createAuthorizationRequest(): Promise<AuthorizationRequest> {
    return {
      url: new URL("https://aaf.example.test/authorize?client_id=test"),
      sessionState: {
        state: "state-123",
        nonce: "nonce-123",
        codeVerifier: "verifier-123",
      },
    };
  }

  async completeAuthorization(
    currentUrl: URL,
    sessionState: OidcSessionState,
  ): Promise<UserClaims> {
    expect(currentUrl.href).toBe(
      "http://localhost:5000/auth/callback?code=abc&state=state-123",
    );
    expect(sessionState).toEqual({
      state: "state-123",
      nonce: "nonce-123",
      codeVerifier: "verifier-123",
    });

    return testUser;
  }
}

describe("AAF Express demo", () => {
  it("reports unauthenticated sessions", async () => {
    const app = createApp({
      config: createTestConfig(),
      authClient: new FakeAafAuthClient(),
    });

    const me = await request(app).get("/api/me").expect(200);
    expect(me.body).toEqual({
      authenticated: false,
      user: null,
    });

    const protectedResponse = await request(app).get("/api/protected").expect(401);
    expect(protectedResponse.body).toEqual({
      error: "Authentication required",
    });
  });

  it("stores user claims after callback and clears them on logout", async () => {
    const app = createApp({
      config: createTestConfig(),
      authClient: new FakeAafAuthClient(),
    });
    const agent = request.agent(app);

    await agent
      .get("/auth/login")
      .expect(302)
      .expect("Location", "https://aaf.example.test/authorize?client_id=test");

    await agent
      .get("/auth/callback?code=abc&state=state-123")
      .expect(302)
      .expect("Location", "/?view=protected");

    const me = await agent.get("/api/me").expect(200);
    expect(me.body).toEqual({
      authenticated: true,
      user: testUser,
    });

    const protectedResponse = await agent.get("/api/protected").expect(200);
    expect(protectedResponse.body).toEqual({
      message: "This is protected data from the backend.",
      user: testUser,
    });

    await agent.post("/auth/logout").expect(200).expect({ ok: true });

    const afterLogout = await agent.get("/api/me").expect(200);
    expect(afterLogout.body).toEqual({
      authenticated: false,
      user: null,
    });
  });
});

function createTestConfig(): AppConfig {
  return {
    nodeEnv: "test",
    isProduction: false,
    server: {
      host: "localhost",
      port: 5000,
      publicDir: path.resolve("public"),
      trustProxy: false,
    },
    session: {
      name: "aaf.sid",
      secret: "test-session-secret-that-is-long-enough",
      secureCookie: false,
      maxAgeMs: 60 * 60 * 1000,
    },
    aaf: {
      clientId: "client-id",
      clientSecret: "client-secret",
      discoveryUrl: "https://central.test.aaf.edu.au/.well-known/openid-configuration",
      issuerUrl: "https://central.test.aaf.edu.au/",
      redirectUri: "http://localhost:5000/auth/callback",
      scope: "openid email profile",
    },
  };
}
