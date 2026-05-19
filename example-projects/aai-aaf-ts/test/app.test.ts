import path from "node:path";
import type { Server } from "node:http";

import { describe, expect, it } from "bun:test";
import type { Express } from "express";
import request from "supertest";

import type {
  AafAuthClient,
  AuthorizationRequest,
  OidcSessionState,
} from "../src/auth/aafClient.ts";
import { createApp } from "../src/app.ts";
import type { AppConfig } from "../src/config.ts";
import type { UserClaims } from "../src/types/user.ts";

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
    const server = await startTestServer(app);

    try {
      const me = await request(server.url).get("/api/me").expect(200);
      expect(me.body).toEqual({
        authenticated: false,
        user: null,
      });

      const protectedResponse = await request(server.url)
        .get("/api/protected")
        .expect(401);
      expect(protectedResponse.body).toEqual({
        error: "Authentication required",
      });
    } finally {
      await closeTestServer(server.httpServer);
    }
  });

  it("stores user claims after callback and clears them on logout", async () => {
    const app = createApp({
      config: createTestConfig(),
      authClient: new FakeAafAuthClient(),
    });
    const server = await startTestServer(app);
    const agent = request.agent(server.url);

    try {
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
    } finally {
      await closeTestServer(server.httpServer);
    }
  });
});

interface TestServer {
  httpServer: Server;
  url: string;
}

async function startTestServer(app: Express): Promise<TestServer> {
  const httpServer = await listen(app);
  const address = httpServer.address();

  if (!address || typeof address === "string") {
    await closeTestServer(httpServer);
    throw new Error("Test server did not start on a TCP port.");
  }

  return {
    httpServer,
    url: `http://127.0.0.1:${address.port}`,
  };
}

function listen(app: Express): Promise<Server> {
  return new Promise((resolve, reject) => {
    const httpServer = app.listen(0, "127.0.0.1");

    function cleanup() {
      httpServer.off("error", onError);
      httpServer.off("listening", onListening);
    }

    function onError(error: Error) {
      cleanup();
      reject(error);
    }

    function onListening() {
      cleanup();
      resolve(httpServer);
    }

    httpServer.once("error", onError);
    httpServer.once("listening", onListening);
  });
}

function closeTestServer(httpServer: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    httpServer.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

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
