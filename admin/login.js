const form = document.querySelector("#login-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button"),
    error = document.querySelector("#login-error");
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.querySelector(".button-label").textContent = "Signing in…";
  error.textContent = "";
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    location.href = "/admin";
  } catch (e) {
    error.textContent =
      e instanceof TypeError
        ? "Unable to connect. Please try again."
        : e.message;
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.querySelector(".button-label").textContent = "Sign in";
  }
});
