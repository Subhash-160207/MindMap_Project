// dashboard.js - Manages boards on the dashboard

// Load all boards when the page opens
window.onload = async function() {
    loadBoards();
};

async function loadBoards() {
    const grid = document.getElementById("boardsGrid");
    const loadingText = document.getElementById("loadingText");

    try {
        const result = await apiGetBoards();

        if (result.status === 200) {
            const boards = result.data;

            if (boards.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <h3>No boards yet</h3>
                        <p>Click "Create Board" to get started!</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = "";
            boards.forEach((board, index) => {
                const colorClass = "color-" + (index % 6);
                const card = document.createElement("div");
                card.className = "board-card " + colorClass;
                card.innerHTML = `
                    <div class="board-card-name">${board.boardName}</div>
                    <div class="board-card-info">${board.lists ? board.lists.length : 0} list(s)</div>
                    <div class="board-card-actions">
                        <button class="btn-edit-board" onclick="openEditBoardModal(event, '${board._id}', '${board.boardName}')">✏️ Rename</button>
                        <button class="btn-delete-board" onclick="deleteBoardConfirm(event, '${board._id}')">🗑️ Delete</button>
                    </div>
                `;
                // Clicking the card (not buttons) opens the board
                card.addEventListener("click", function() {
                    window.location.href = "index.html?boardId=" + board._id;
                });
                grid.appendChild(card);
            });

        } else {
            grid.innerHTML = "<p style='color:red;'>Failed to load boards.</p>";
        }
    } catch (err) {
        grid.innerHTML = "<p style='color:red;'>Cannot reach server. Is the backend running?</p>";
    }
}

// --- Create Board ---
function openCreateBoardModal() {
    document.getElementById("newBoardName").value = "";
    document.getElementById("createBoardModal").style.display = "flex";
    setTimeout(() => document.getElementById("newBoardName").focus(), 100);
}

function closeCreateBoardModal() {
    document.getElementById("createBoardModal").style.display = "none";
}

async function createBoard() {
    const name = document.getElementById("newBoardName").value.trim();
    if (!name) {
        alert("Please enter a board name.");
        return;
    }

    const result = await apiCreateBoard(name);
    if (result.status === 201) {
        closeCreateBoardModal();
        loadBoards();
    } else {
        alert("Failed to create board.");
    }
}

// --- Edit Board ---
function openEditBoardModal(event, boardId, currentName) {
    event.stopPropagation(); // don't open the board when clicking rename
    document.getElementById("editBoardId").value = boardId;
    document.getElementById("editBoardName").value = currentName;
    document.getElementById("editBoardModal").style.display = "flex";
    setTimeout(() => document.getElementById("editBoardName").focus(), 100);
}

function closeEditBoardModal() {
    document.getElementById("editBoardModal").style.display = "none";
}

async function updateBoard() {
    const boardId = document.getElementById("editBoardId").value;
    const newName = document.getElementById("editBoardName").value.trim();

    if (!newName) {
        alert("Please enter a board name.");
        return;
    }

    const result = await apiUpdateBoard(boardId, newName);
    if (result.status === 200) {
        closeEditBoardModal();
        loadBoards();
    } else {
        alert("Failed to update board.");
    }
}

// --- Delete Board ---
async function deleteBoardConfirm(event, boardId) {
    event.stopPropagation();
    const confirmed = confirm("Are you sure you want to delete this board? This cannot be undone.");
    if (!confirmed) return;

    const result = await apiDeleteBoard(boardId);
    if (result.status === 200) {
        loadBoards();
    } else {
        alert("Failed to delete board.");
    }
}

// Close modals when clicking outside
document.getElementById("createBoardModal").addEventListener("click", function(e) {
    if (e.target === this) closeCreateBoardModal();
});
document.getElementById("editBoardModal").addEventListener("click", function(e) {
    if (e.target === this) closeEditBoardModal();
});

// Enter key in create board input
document.getElementById("newBoardName").addEventListener("keydown", function(e) {
    if (e.key === "Enter") createBoard();
});
document.getElementById("editBoardName").addEventListener("keydown", function(e) {
    if (e.key === "Enter") updateBoard();
});
