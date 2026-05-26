export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface UserClaims {
  sub?: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  raw_claims: Record<string, JsonValue>;
}

export function extractUserClaims(userInfo: unknown): UserClaims {
  const claims = toPlainRecord(userInfo);

  return {
    sub: stringClaim(claims, "sub"),
    name: stringClaim(claims, "name"),
    email: stringClaim(claims, "email"),
    preferred_username: stringClaim(claims, "preferred_username"),
    raw_claims: claims,
  };
}

function toPlainRecord(value: unknown): Record<string, JsonValue> {
  if (!isRecord(value)) {
    return {};
  }

  const record: Record<string, JsonValue> = {};

  for (const [key, item] of Object.entries(value)) {
    record[key] = toJsonValue(item);
  }

  return record;
}

function toJsonValue(value: unknown): JsonValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => toJsonValue(item));
  }

  if (isRecord(value)) {
    const record: Record<string, JsonValue> = {};

    for (const [key, item] of Object.entries(value)) {
      record[key] = toJsonValue(item);
    }

    return record;
  }

  return String(value);
}

function stringClaim(
  claims: Record<string, JsonValue>,
  name: string,
): string | undefined {
  const value = claims[name];
  return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
