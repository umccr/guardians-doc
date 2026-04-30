const API_BASE_URL = "http://localhost:5000";

async function fetchMe() {
  const response = await fetch(`${API_BASE_URL}/api/me`, {
    credentials: "include",
  });

  return response.json();
}

async function fetchProtectedData() {
  const response = await fetch(`${API_BASE_URL}/api/protected`, {
    credentials: "include",
  });

  return response.json();
}

async function logout() {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  window.location.href = "index.html";
}

function show(element) {
  element.classList.remove("hidden");
}

function hide(element) {
  element.classList.add("hidden");
}

function formatJson(value) {
  return JSON.stringify(value, null, 2);
}

async function loadIndexPage() {
  const loginButton = document.querySelector("#login-button");
  const protectedLink = document.querySelector("#protected-link");
  const loginStatus = document.querySelector("#login-status");
  const errorMessage = document.querySelector("#error-message");
  const params = new URLSearchParams(window.location.search);

  loginButton.addEventListener("click", () => {
    window.location.href = `${API_BASE_URL}/auth/login`;
  });

  if (params.get("error") === "login_failed") {
    errorMessage.textContent =
      "Login failed or was cancelled. Please try signing in with AAF again.";
    show(errorMessage);
  }

  try {
    const me = await fetchMe();

    if (me.authenticated) {
      const name = me.user.name || me.user.email || me.user.preferred_username || "AAF user";
      loginStatus.textContent = `You are already logged in as ${name}.`;
      show(protectedLink);
    } else {
      loginStatus.textContent = "You are not logged in yet.";
      hide(protectedLink);
    }
  } catch (error) {
    loginStatus.textContent =
      "Could not reach the backend. Make sure Flask is running on http://localhost:5000.";
  }
}

async function loadProtectedPage() {
  const status = document.querySelector("#protected-status");
  const authenticatedContent = document.querySelector("#authenticated-content");
  const unauthenticatedContent = document.querySelector("#unauthenticated-content");
  const userName = document.querySelector("#user-name");
  const userEmail = document.querySelector("#user-email");
  const claimsOutput = document.querySelector("#claims-output");
  const protectedOutput = document.querySelector("#protected-output");
  const logoutButton = document.querySelector("#logout-button");

  logoutButton.addEventListener("click", logout);

  try {
    const me = await fetchMe();

    if (!me.authenticated) {
      status.textContent = "You are not logged in.";
      show(unauthenticatedContent);
      hide(authenticatedContent);
      return;
    }

    const user = me.user;
    userName.textContent = user.name || user.email || user.preferred_username || "Signed in";
    userEmail.textContent = user.email || user.preferred_username || user.sub || "";
    claimsOutput.textContent = formatJson(user.raw_claims || user);

    const protectedData = await fetchProtectedData();
    protectedOutput.textContent = formatJson(protectedData);

    status.textContent = "You are logged in.";
    show(authenticatedContent);
    hide(unauthenticatedContent);
  } catch (error) {
    status.textContent =
      "Could not reach the backend. Make sure Flask is running on http://localhost:5000.";
    hide(authenticatedContent);
    show(unauthenticatedContent);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "index") {
    loadIndexPage();
  }

  if (page === "protected") {
    loadProtectedPage();
  }
});
