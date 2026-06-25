// api.js - All API calls go through here
// This makes it easy to change the backend URL in one place

// Since Flask serves the frontend too, we use relative URLs
// No need to type localhost:5000 anywhere
const API_URL = "";

function getToken() {
    return localStorage.getItem("token");
}

// A helper that handles fetch requests with auth headers
async function apiRequest(method, endpoint, body = null) {
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(API_URL + endpoint, options);
    const data = await response.json();
    return { status: response.status, data };
}

// Auth
async function apiSignup(name, email, password) {
    return apiRequest("POST", "/signup", { name, email, password });
}

async function apiLogin(email, password) {
    return apiRequest("POST", "/login", { email, password });
}

async function apiGetProfile() {
    return apiRequest("GET", "/profile");
}

// Boards
async function apiGetBoards() {
    return apiRequest("GET", "/boards");
}

async function apiCreateBoard(boardName) {
    return apiRequest("POST", "/boards", { boardName });
}

async function apiGetBoard(boardId) {
    return apiRequest("GET", "/boards/" + boardId);
}

async function apiUpdateBoard(boardId, boardName) {
    return apiRequest("PUT", "/boards/" + boardId, { boardName });
}

async function apiDeleteBoard(boardId) {
    return apiRequest("DELETE", "/boards/" + boardId);
}

// Lists
async function apiAddList(boardId, title) {
    return apiRequest("POST", "/boards/" + boardId + "/lists", { title });
}

async function apiRenameList(boardId, listId, title) {
    return apiRequest("PUT", "/boards/" + boardId + "/lists/" + listId, { title });
}

async function apiDeleteList(boardId, listId) {
    return apiRequest("DELETE", "/boards/" + boardId + "/lists/" + listId);
}

// Cards
async function apiAddCard(boardId, listId, cardData) {
    return apiRequest("POST", "/boards/" + boardId + "/lists/" + listId + "/cards", cardData);
}

async function apiUpdateCard(boardId, listId, cardId, cardData) {
    return apiRequest("PUT", "/boards/" + boardId + "/lists/" + listId + "/cards/" + cardId, cardData);
}

async function apiDeleteCard(boardId, listId, cardId) {
    return apiRequest("DELETE", "/boards/" + boardId + "/lists/" + listId + "/cards/" + cardId);
}

async function apiMoveCard(boardId, fromListId, toListId, cardId) {
    return apiRequest("PUT", "/boards/" + boardId + "/cards/move", {
        fromListId, toListId, cardId
    });
}
