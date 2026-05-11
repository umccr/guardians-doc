import * as client from "openid-client";

import type { AafConfig } from "../config.js";
import { extractUserClaims, type UserClaims } from "../types/user.js";

export interface OidcSessionState {
  state: string;
  nonce: string;
  codeVerifier: string;
}

export interface AuthorizationRequest {
  url: URL;
  sessionState: OidcSessionState;
}

export interface AafAuthClient {
  createAuthorizationRequest(): Promise<AuthorizationRequest>;
  completeAuthorization(
    currentUrl: URL,
    sessionState: OidcSessionState,
  ): Promise<UserClaims>;
}

export class OpenidAafAuthClient implements AafAuthClient {
  private configurationPromise?: Promise<client.Configuration>;

  constructor(private readonly config: AafConfig) {}

  async createAuthorizationRequest(): Promise<AuthorizationRequest> {
    const configuration = await this.getConfiguration();
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();
    const nonce = client.randomNonce();

    const url = client.buildAuthorizationUrl(configuration, {
      response_type: "code",
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return {
      url,
      sessionState: {
        state,
        nonce,
        codeVerifier,
      },
    };
  }

  async completeAuthorization(
    currentUrl: URL,
    sessionState: OidcSessionState,
  ): Promise<UserClaims> {
    const configuration = await this.getConfiguration();
    const tokens = await client.authorizationCodeGrant(configuration, currentUrl, {
      expectedNonce: sessionState.nonce,
      expectedState: sessionState.state,
      idTokenExpected: true,
      pkceCodeVerifier: sessionState.codeVerifier,
    });

    const idTokenClaims = tokens.claims();
    let userInfo: unknown = idTokenClaims ?? {};

    if (
      tokens.access_token &&
      idTokenClaims &&
      typeof idTokenClaims.sub === "string"
    ) {
      userInfo = await client.fetchUserInfo(
        configuration,
        tokens.access_token,
        idTokenClaims.sub,
      );
    }

    const user = extractUserClaims(userInfo);

    if (!user.sub) {
      throw new Error("AAF OIDC response did not include a subject claim.");
    }

    return user;
  }

  private getConfiguration(): Promise<client.Configuration> {
    this.configurationPromise ??= client.discovery(
      new URL(this.config.issuerUrl),
      this.config.clientId,
      {
        client_secret: this.config.clientSecret,
        token_endpoint_auth_method: "client_secret_post",
      },
      client.ClientSecretPost(this.config.clientSecret),
    );

    return this.configurationPromise;
  }
}
