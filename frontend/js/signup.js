// signup.js - Handles the signup form

async function handleSignup() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    const errorBox = document.getElementById("errorBox");
    const successBox = document.getElementById("successBox");

    errorBox.style.display = "none";
    successBox.style.display = "none";

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        errorBox.textContent = "Please fill in all fields.";
        errorBox.style.display = "block";
        return;
    }

    if (password !== confirmPassword) {
        errorBox.textContent = "Passwords do not match.";
        errorBox.style.display = "block";
        return;
    }

    if (password.length < 6) {
        errorBox.textContent = "Password must be at least 6 characters.";
        errorBox.style.display = "block";
        return;
    }

    try {
        const result = await apiSignup(name, email, password);

        if (result.status === 201) {
            // Save token and name
            localStorage.setItem("token", result.data.token);
            localStorage.setItem("userName", result.data.name);

            successBox.textContent = "Account created! Redirecting...";
            successBox.style.display = "block";

            // Go to dashboard after a short delay
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } else {
            errorBox.textContent = result.data.error || "Signup failed. Please try again.";
            errorBox.style.display = "block";
        }
    } catch (err) {
        errorBox.textContent = "Could not connect to server. Make sure the backend is running.";
        errorBox.style.display = "block";
    }
}

document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        handleSignup();
    }
});
