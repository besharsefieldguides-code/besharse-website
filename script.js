document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  try {
    const response = await fetch("/api/admin-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      message.style.color = "green";
      message.textContent = "Login successful.";
    } else {
      message.style.color = "red";
      message.textContent = "Invalid username or password.";
    }
  } catch (error) {
    message.style.color = "red";
    message.textContent = "Server error. Please try again.";
  }
});
