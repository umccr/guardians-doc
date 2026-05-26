# AAF OIDC Local Demo - Bun, TypeScript, Express

Minimal local proof of concept for signing in with AAF OpenID Connect and reading basic user claims through an Express session.

This is a Bun/TypeScript/Express port of the Flask sample in `../aai-aaf-python`. It keeps the same OIDC flow and route contract, while using Express middleware, typed configuration, typed session data, Bun's TypeScript runtime, and one HTML page served by Express.

## What It Shows

The browser opens `http://localhost:5000`, which is served by Express. From there it starts login through AAF and returns to the Express callback at:

```text
http://localhost:5000/auth/callback
```

The Express app exchanges the authorization code for tokens, reads user claims, stores minimal claims in the session, then redirects the browser to the protected view.

Roles:

- RP / Client: this Express app
- OP: AAF Central
- IdP: University of Melbourne inside the AAF federation

The HTML page never stores AAF tokens or the AAF client secret.

## Project Layout

```text
aai-aaf-ts/
  public/
    index.html
  src/
    auth/
      aafClient.ts
    middleware/
    routes/
    types/
    app.ts
    config.ts
    server.ts
  test/
    app.test.ts
  package.json
  bun.lock
  tsconfig.json
  .env.example
```

## Local Configuration

Register the AAF client with this exact redirect URI:

```text
http://localhost:5000/auth/callback
```

This project uses Bun `1.3.14` as its runtime, package manager, and test runner. If Bun is not installed yet, follow the official [Bun installation guide](https://bun.com/docs/installation).

Install dependencies:

```bash
bun install
```

Create local config:

```bash
cp .env.example .env
bun --print "Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url')"
```

Fill in `.env`:

```env
SESSION_SECRET=<generated-secret>
AAF_CLIENT_ID=<from-aaf>
AAF_CLIENT_SECRET=<from-aaf>
AAF_DISCOVERY_URL=https://central.test.aaf.edu.au/.well-known/openid-configuration
AAF_REDIRECT_URI=http://localhost:5000/auth/callback
PORT=5000
NODE_ENV=development
SESSION_COOKIE_SECURE=false
TRUST_PROXY=false
```

The app accepts the same `AAF_DISCOVERY_URL` shape used by the Python sample and normalizes it to the issuer URL before calling `openid-client` discovery.

Use the AAF test discovery URL first if the client was created in the test environment.

You do not need `dotenv`; Bun reads `.env`, environment-specific `.env.*`, and `.env.local` files automatically when running the app.

## Run Locally

```bash
bun run dev
```

Bun runs `src/server.ts` directly and restarts it in watch mode when imported files change. There is no `dist/` build step for this demo.

Open:

```text
http://localhost:5000
```

## Routes

- `GET /` serves `public/index.html`.
- `GET /auth/login` starts AAF OIDC login.
- `GET /auth/callback` handles the OIDC callback.
- `GET /api/me` returns session authentication state and claims.
- `GET /api/protected` returns protected data or `401`.
- `GET|POST /auth/logout` clears the local session.

## Development Checks

```bash
bun run test
bun run test:watch
```

## Security Notes

- Keep `.env` local and uncommitted.
- Do not put `AAF_CLIENT_SECRET` or AAF tokens in the HTML page.
- The app stores only a minimal local user object in the session, not AAF tokens.
- This demo uses the default in-memory Express session store for local development only.
- This demo keeps `SESSION_COOKIE_SECURE=false` for local HTTP testing only.
- For production, use HTTPS, set secure cookies, configure `TRUST_PROXY` behind a TLS proxy, use a production session store such as Redis or a database, add CSRF protection for state-changing routes, and store secrets in a managed secret store.

## AAF References

- [OpenID Connect Series overview](https://tutorials.aaf.edu.au/openid-connect-series/01-overview)
- [Connect an OIDC Service overview](https://tutorials.aaf.edu.au/connect-an-oidc-service/01-overview)
- [Register an OIDC service](https://tutorials.aaf.edu.au/connect-an-oidc-service/02-connect-oidc-service)
- [Available scopes and eduGAIN](https://tutorials.aaf.edu.au/connect-an-oidc-service/03-available-scopes-and-edugain)
- [OpenID configuration](https://tutorials.aaf.edu.au/openid-connect-integration/03-openid-configuration)
- [OIDC attributes](https://tutorials.aaf.edu.au/openid-connect-integration/04-attributes)
