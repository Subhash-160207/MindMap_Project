// board.js - Main logic for the Kanban board page

// Get board ID from the URL
function getBoardId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("boardId");
}

// Load the board when the page opens
window.onload = async function() {
    const boardId = getBoardId();
    if (!boardId) {
        alert("No board selected. Going back to dashboard.");
        window.location.href = "dashboard.html";
        return;
    }
    loadBoard();
};

async function loadBoard() {
    const boardId = getBoardId();

    try {
        const result = await apiGetBoard(boardId);

        if (result.status === 200) {
            const board = result.data;

            // Update page title and navbar title
            document.title = board.boardName + " - MindMap Studio";
            document.getElementById("boardTitle").textContent = board.boardName;

            renderLists(board.lists || []);
        } else {
            alert("Board not found.");
            window.location.href = "dashboard.html";
        }
    } catch (err) {
        alert("Cannot connect to server.");
    }
}

// Render all lists and their cards
function renderLists(lists) {
    const container = document.getElementById("listsContainer");
    container.innerHTML = "";

    lists.forEach(list => {
        const listEl = createListElement(list);
        container.appendChild(listEl);
    });
}

// Build the HTML for a single list column
function createListElement(list) {
    const listDiv = document.createElement("div");
    listDiv.className = "list-column";
    listDiv.dataset.listId = list.listId;

    listDiv.innerHTML = `
        <div class="list-header">
            <span class="list-title" ondblclick="startRenameList('${list.listId}', this)">${list.title}</span>
            <div class="list-menu">
                <button class="btn-list-menu" title="Delete List" onclick="deleteList('${list.listId}')">🗑️</button>
            </div>
        </div>

        <div class="cards-list"
            id="cardsList-${list.listId}"
            ondragover="onDragOver(event)"
            ondragenter="onDragEnter(event, this)"
            ondragleave="onDragLeave(event, this)"
            ondrop="onDrop(event, '${list.listId}')">
        </div>

        <button class="btn-add-card" id="addCardBtn-${list.listId}" onclick="showAddCardForm('${list.listId}')">
            + Add a card
        </button>

        <div class="add-card-form" id="addCardForm-${list.listId}" style="display:none;">
            <input type="text" id="newCardTitle-${list.listId}" placeholder="Card title..." />
            <div class="add-card-buttons">
                <button class="btn-small-primary" onclick="addCard('${list.listId}')">Add Card</button>
                <button class="btn-small-cancel" onclick="hideAddCardForm('${list.listId}')">✕</button>
            </div>
        </div>
    `;

    // Add cards inside the cards list area
    const cardsListEl = listDiv.querySelector(`#cardsList-${list.listId}`);
    (list.cards || []).forEach(card => {
        const cardEl = createCardElement(card, list.listId);
        cardsListEl.appendChild(cardEl);
    });

    // Allow pressing Enter in the card input
    setTimeout(() => {
        const input = listDiv.querySelector(`#newCardTitle-${list.listId}`);
        if (input) {
            input.addEventListener("keydown", function(e) {
                if (e.key === "Enter") addCard(list.listId);
                if (e.key === "Escape") hideAddCardForm(list.listId);
            });
        }
    }, 0);

    return listDiv;
}

// Build one card element
function createCardElement(card, listId) {
    const cardDiv = document.createElement("div");
    cardDiv.className = `card-item priority-${card.priority}`;
    cardDiv.dataset.cardId = card.cardId;
    cardDiv.draggable = true;

    const dueDateStr = card.dueDate ? `<span class="card-due">📅 ${card.dueDate}</span>` : "";
    const status = card.status || "todo";

    cardDiv.innerHTML = `
        <div class="card-title">${card.title}</div>
        <div class="card-meta">
            <span class="card-priority-badge badge-${card.priority}">${card.priority}</span>
            <span class="card-status-badge status-${status}">${status}</span>
            ${dueDateStr}
        </div>
    `;

    // Drag events
    cardDiv.addEventListener("dragstart", (e) => onDragStart(e, card.cardId, listId));
    cardDiv.addEventListener("dragend", onDragEnd);

    // Click to open card detail modal
    cardDiv.addEventListener("click", function() {
        openCardModal(card, listId);
    });

    return cardDiv;
}

// --- Add List ---
function showAddListForm() {
    document.getElementById("addListForm").style.display = "block";
    document.getElementById("addListBtn").style.display = "none";
    setTimeout(() => document.getElementById("newListTitle").focus(), 50);
}

function hideAddListForm() {
    document.getElementById("addListForm").style.display = "none";
    document.getElementById("addListBtn").style.display = "block";
    document.getElementById("newListTitle").value = "";
}

async function addList() {
    const title = document.getElementById("newListTitle").value.trim();
    if (!title) {
        alert("Please enter a list name.");
        return;
    }

    const boardId = getBoardId();
    const result = await apiAddList(boardId, title);

    if (result.status === 201) {
        hideAddListForm();
        loadBoard();
    } else {
        alert("Failed to add list.");
    }
}

document.getElementById("newListTitle").addEventListener("keydown", function(e) {
    if (e.key === "Enter") addList();
    if (e.key === "Escape") hideAddListForm();
});

// --- Rename List ---
function startRenameList(listId, titleEl) {
    const currentTitle = titleEl.textContent;

    // Replace the span with an input
    const input = document.createElement("input");
    input.type = "text";
    input.className = "list-title-input";
    input.value = currentTitle;

    titleEl.replaceWith(input);
    input.focus();
    input.select();

    async function finishRename() {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== currentTitle) {
            const boardId = getBoardId();
            await apiRenameList(boardId, listId, newTitle);
        }
        loadBoard(); // reload to restore the title span
    }

    input.addEventListener("blur", finishRename);
    input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") input.blur();
        if (e.key === "Escape") loadBoard(); // cancel
    });
}

// --- Delete List ---
async function deleteList(listId) {
    const confirmed = confirm("Delete this list and all its cards?");
    if (!confirmed) return;

    const boardId = getBoardId();
    const result = await apiDeleteList(boardId, listId);

    if (result.status === 200) {
        loadBoard();
    } else {
        alert("Failed to delete list.");
    }
}

// --- Add Card ---
function showAddCardForm(listId) {
    document.getElementById("addCardForm-" + listId).style.display = "block";
    document.getElementById("addCardBtn-" + listId).style.display = "none";
    setTimeout(() => document.getElementById("newCardTitle-" + listId).focus(), 50);
}

function hideAddCardForm(listId) {
    document.getElementById("addCardForm-" + listId).style.display = "none";
    document.getElementById("addCardBtn-" + listId).style.display = "block";
    document.getElementById("newCardTitle-" + listId).value = "";
}

async function addCard(listId) {
    const title = document.getElementById("newCardTitle-" + listId).value.trim();
    if (!title) {
        alert("Please enter a card title.");
        return;
    }

    const boardId = getBoardId();
    const result = await apiAddCard(boardId, listId, { title });

    if (result.status === 201) {
        hideAddCardForm(listId);
        loadBoard();
    } else {
        alert("Failed to add card.");
    }
}

// --- Card Modal ---
function openCardModal(card, listId) {
    document.getElementById("modalCardId").value = card.cardId;
    document.getElementById("modalListId").value = listId;
    document.getElementById("modalCardTitle").value = card.title;
    document.getElementById("modalCardDesc").value = card.description || "";
    document.getElementById("modalCardPriority").value = card.priority || "Normal";
    document.getElementById("modalCardStatus").value = card.status || "todo";
    document.getElementById("modalCardDueDate").value = card.dueDate || "";

    document.getElementById("cardModal").style.display = "flex";
}

function closeCardModal() {
    document.getElementById("cardModal").style.display = "none";
}

async function saveCardFromModal() {
    const cardId = document.getElementById("modalCardId").value;
    const listId = document.getElementById("modalListId").value;
    const boardId = getBoardId();

    const cardData = {
        title: document.getElementById("modalCardTitle").value.trim(),
        description: document.getElementById("modalCardDesc").value.trim(),
        priority: document.getElementById("modalCardPriority").value,
        status: document.getElementById("modalCardStatus").value,
        dueDate: document.getElementById("modalCardDueDate").value
    };

    if (!cardData.title) {
        alert("Title cannot be empty.");
        return;
    }

    const result = await apiUpdateCard(boardId, listId, cardId, cardData);

    if (result.status === 200) {
        closeCardModal();
        loadBoard();
    } else {
        alert("Failed to save card.");
    }
}

async function deleteCardFromModal() {
    const confirmed = confirm("Delete this card?");
    if (!confirmed) return;

    const cardId = document.getElementById("modalCardId").value;
    const listId = document.getElementById("modalListId").value;
    const boardId = getBoardId();

    const result = await apiDeleteCard(boardId, listId, cardId);

    if (result.status === 200) {
        closeCardModal();
        loadBoard();
    } else {
        alert("Failed to delete card.");
    }
}

// Close card modal when clicking outside
document.getElementById("cardModal").addEventListener("click", function(e) {
    if (e.target === this) closeCardModal();
});
