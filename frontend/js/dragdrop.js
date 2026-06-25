// dragdrop.js - Handles dragging cards between lists
// Uses the native HTML Drag and Drop API

let draggedCardId = null;
let draggedFromListId = null;

// Called when a card starts being dragged
function onDragStart(event, cardId, listId) {
    draggedCardId = cardId;
    draggedFromListId = listId;

    event.dataTransfer.effectAllowed = "move";

    // Add a class to make the card look faded while dragging
    const cardEl = document.querySelector(`[data-card-id="${cardId}"]`);
    if (cardEl) {
        setTimeout(() => cardEl.classList.add("dragging"), 0);
    }
}

// Called when dragging ends (whether dropped or cancelled)
function onDragEnd(event) {
    const dragging = document.querySelector(".dragging");
    if (dragging) dragging.classList.remove("dragging");
    draggedCardId = null;
    draggedFromListId = null;
}

// Called when a dragged card enters a list drop zone
function onDragOver(event) {
    event.preventDefault(); // needed to allow dropping
    event.dataTransfer.dropEffect = "move";
}

function onDragEnter(event, listEl) {
    listEl.classList.add("drag-over");
}

function onDragLeave(event, listEl) {
    // Only remove if we're leaving the list itself, not a child
    if (!listEl.contains(event.relatedTarget)) {
        listEl.classList.remove("drag-over");
    }
}

// Called when a card is dropped on a list
async function onDrop(event, toListId) {
    event.preventDefault();

    const dropZone = event.currentTarget;
    dropZone.classList.remove("drag-over");

    // Don't do anything if dropped on the same list
    if (!draggedCardId || toListId === draggedFromListId) return;

    const boardId = getBoardId();

    // Call the API to move the card in the database
    const result = await apiMoveCard(boardId, draggedFromListId, toListId, draggedCardId);

    if (result.status === 200) {
        // Reload the board to show updated card positions
        loadBoard();
    } else {
        alert("Failed to move card. Please try again.");
    }
}
