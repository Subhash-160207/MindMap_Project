// auth.js - Shared auth functions used on dashboard and board pages

// Check if user is logged in, redirect to login if not
function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "login.html";
}

function showUserName() {
    const name = localStorage.getItem("userName") || "User";
    const el = document.getElementById("userGreeting");
    if (el) {
        el.textContent = "Hi, " + name + "!";
    }
}

// Run on page load
checkAuth();
showUserName();
