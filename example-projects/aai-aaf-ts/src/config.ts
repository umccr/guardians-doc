import path from "node:path";

export interface AafConfig {
  clientId: string;
  clientSecret: string;
  discoveryUrl: string;
  issuerUrl: string;
  redirectUri: string;
  scope: string;
}

export interface AppConfig {
  nodeEnv: string;
  isProduction: boolean;
  server: {
    host: string;
    port: number;
    publicDir: string;
    trustProxy: boolean;
  };
  session: {
    name: string;
    secret: string;
    secureCookie: boolean;
    maxAgeMs: number;
  };
  aaf: AafConfig;
}

const DEFAULT_SCOPE = "openid email profile";
const DEFAULT_SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 8;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = env.NODE_ENV?.trim() || "development";
  const isProduction = nodeEnv === "production";
  const sessionSecret = requireEnv(env, "SESSION_SECRET");

  if (isProduction && sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters in production.");
  }

  const discoveryUrl = requireEnv(env, "AAF_DISCOVERY_URL");

  return {
    nodeEnv,
    isProduction,
    server: {
      host: env.HOST?.trim() || "localhost",
      port: parseInteger(env.PORT, 5000, "PORT"),
      publicDir: path.resolve(env.PUBLIC_DIR?.trim() || "public"),
      trustProxy: parseBoolean(env.TRUST_PROXY, false),
    },
    session: {
      name: env.SESSION_COOKIE_NAME?.trim() || "aaf.sid",
      secret: sessionSecret,
      secureCookie: parseBoolean(env.SESSION_COOKIE_SECURE, isProduction),
      maxAgeMs: parseInteger(
        env.SESSION_MAX_AGE_MS,
        DEFAULT_SESSION_MAX_AGE_MS,
        "SESSION_MAX_AGE_MS",
      ),
    },
    aaf: {
      clientId: requireEnv(env, "AAF_CLIENT_ID"),
      clientSecret: requireEnv(env, "AAF_CLIENT_SECRET"),
      discoveryUrl,
      issuerUrl: toIssuerUrl(discoveryUrl),
      redirectUri: requireEnv(env, "AAF_REDIRECT_URI"),
      scope: env.AAF_SCOPE?.trim() || DEFAULT_SCOPE,
    },
  };
}

export function toIssuerUrl(discoveryOrIssuerUrl: string): string {
  const url = new URL(discoveryOrIssuerUrl);
  const wellKnownSuffix = "/.well-known/openid-configuration";

  if (url.pathname.endsWith(wellKnownSuffix)) {
    url.pathname = url.pathname.slice(0, -wellKnownSuffix.length) || "/";
    url.search = "";
    url.hash = "";
  }

  return url.toString();
}

function requireEnv(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  switch (value.trim().toLowerCase()) {
    case "1":
    case "true":
    case "yes":
    case "on":
      return true;
    case "0":
    case "false":
    case "no":
    case "off":
      return false;
    default:
      throw new Error(`Invalid boolean value: ${value}`);
  }
}

function parseInteger(
  value: string | undefined,
  fallback: number,
  name: string,
): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}
