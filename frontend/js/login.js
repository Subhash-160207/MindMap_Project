// login.js - Handles the login form

async function handleLogin() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorBox = document.getElementById("errorBox");

    // Hide any previous errors
    errorBox.style.display = "none";

    // Basic check
    if (!email || !password) {
        errorBox.textContent = "Please enter your email and password.";
        errorBox.style.display = "block";
        return;
    }

    try {
        const result = await apiLogin(email, password);

        if (result.status === 200) {
            // Save token and name to local storage
            localStorage.setItem("token", result.data.token);
            localStorage.setItem("userName", result.data.name);

            // Go to dashboard
            window.location.href = "dashboard.html";
        } else {
            errorBox.textContent = result.data.error || "Login failed. Please try again.";
            errorBox.style.display = "block";
        }
    } catch (err) {
        errorBox.textContent = "Could not connect to server. Make sure the backend is running.";
        errorBox.style.display = "block";
    }
}

// Allow pressing Enter to login
document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        handleLogin();
    }
});
