import json
import os

from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, request, session
from flask_cors import CORS


load_dotenv()

REQUIRED_ENV_VARS = [
    "FLASK_SECRET_KEY",
    "AAF_CLIENT_ID",
    "AAF_CLIENT_SECRET",
    "AAF_DISCOVERY_URL",
    "AAF_REDIRECT_URI",
    "FRONTEND_URL",
]


def require_env(name):
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def load_config():
    return {name: require_env(name) for name in REQUIRED_ENV_VARS}


config = load_config()

app = Flask(__name__)
app.secret_key = config["FLASK_SECRET_KEY"]
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,
)

CORS(
    app,
    origins=[config["FRONTEND_URL"]],
    supports_credentials=True,
)

oauth = OAuth(app)
oauth.register(
    name="aaf",
    client_id=config["AAF_CLIENT_ID"],
    client_secret=config["AAF_CLIENT_SECRET"],
    server_metadata_url=config["AAF_DISCOVERY_URL"],
    client_kwargs={"scope": "openid profile email"},
)


def to_plain_dict(value):
    """Convert Authlib claim objects into JSON/session-safe dictionaries."""
    if not value:
        return {}

    if hasattr(value, "to_dict"):
        value = value.to_dict()
    else:
        value = dict(value)

    return json.loads(json.dumps(value, default=str))


def extract_user_claims(userinfo):
    claims = to_plain_dict(userinfo)
    return {
        "sub": claims.get("sub"),
        "name": claims.get("name"),
        "email": claims.get("email"),
        "preferred_username": claims.get("preferred_username"),
        "raw_claims": claims,
    }


@app.get("/")
def index():
    return jsonify(
        {
            "service": "AAF OIDC Local Demo Backend",
            "status": "ok",
        }
    )


@app.get("/auth/login")
def login():
    return oauth.aaf.authorize_redirect(config["AAF_REDIRECT_URI"])


@app.get("/auth/callback")
def auth_callback():
    try:
        token = oauth.aaf.authorize_access_token()
        userinfo = token.get("userinfo")

        if not userinfo:
            userinfo = oauth.aaf.userinfo(token=token)

        session["user"] = extract_user_claims(userinfo)
        return redirect(f"{config['FRONTEND_URL']}/protected.html")
    except Exception:
        app.logger.exception("AAF OIDC callback failed")
        return redirect(f"{config['FRONTEND_URL']}/index.html?error=login_failed")


@app.get("/api/me")
def api_me():
    user = session.get("user")
    return jsonify(
        {
            "authenticated": bool(user),
            "user": user if user else None,
        }
    )


@app.get("/api/protected")
def api_protected():
    user = session.get("user")
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    return jsonify(
        {
            "message": "This is protected data from the backend.",
            "user": user,
        }
    )


@app.route("/auth/logout", methods=["GET", "POST"])
def logout():
    session.clear()

    if request.method == "POST":
        return jsonify({"ok": True})

    return redirect(f"{config['FRONTEND_URL']}/index.html")


if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)
