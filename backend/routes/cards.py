from flask import Blueprint, request, jsonify
from bson import ObjectId
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.mongo import boards_collection
from services.jwt_service import verify_token

cards_bp = Blueprint("cards", __name__)

def get_user_id(request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    return verify_token(token)


@cards_bp.route("/boards/<board_id>/lists/<list_id>/cards", methods=["POST"])
def add_card(board_id, list_id):
    user_id = get_user_id(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    title = data.get("title")

    if not title:
        return jsonify({"error": "Card title is required"}), 400

    new_card = {
        "cardId": str(ObjectId()),
        "title": title,
        "description": data.get("description", ""),
        "priority": data.get("priority", "Normal"),
        "dueDate": data.get("dueDate", ""),
        "status": "todo"
    }

    boards_collection.update_one(
        {"_id": ObjectId(board_id), "userId": user_id, "lists.listId": list_id},
        {"$push": {"lists.$.cards": new_card}}
    )

    return jsonify({"message": "Card added", "card": new_card}), 201


@cards_bp.route("/boards/<board_id>/lists/<list_id>/cards/<card_id>", methods=["PUT"])
def update_card(board_id, list_id, card_id):
    user_id = get_user_id(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()

    board = boards_collection.find_one({"_id": ObjectId(board_id), "userId": user_id})
    if not board:
        return jsonify({"error": "Board not found"}), 404

    lists = board.get("lists", [])
    for lst in lists:
        if lst["listId"] == list_id:
            for card in lst["cards"]:
                if card["cardId"] == card_id:
                    card["title"] = data.get("title", card["title"])
                    card["description"] = data.get("description", card["description"])
                    card["priority"] = data.get("priority", card["priority"])
                    card["status"] = data.get("status", card["status"])
                    card["dueDate"] = data.get("dueDate", card["dueDate"])
                    break

    boards_collection.update_one(
        {"_id": ObjectId(board_id)},
        {"$set": {"lists": lists}}
    )

    return jsonify({"message": "Card updated"}), 200


@cards_bp.route("/boards/<board_id>/lists/<list_id>/cards/<card_id>", methods=["DELETE"])
def delete_card(board_id, list_id, card_id):
    user_id = get_user_id(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    board = boards_collection.find_one({"_id": ObjectId(board_id), "userId": user_id})
    if not board:
        return jsonify({"error": "Board not found"}), 404

    lists = board.get("lists", [])
    for lst in lists:
        if lst["listId"] == list_id:
            lst["cards"] = [c for c in lst["cards"] if c["cardId"] != card_id]
            break

    boards_collection.update_one(
        {"_id": ObjectId(board_id)},
        {"$set": {"lists": lists}}
    )

    return jsonify({"message": "Card deleted"}), 200


@cards_bp.route("/boards/<board_id>/cards/move", methods=["PUT"])
def move_card(board_id):
    user_id = get_user_id(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    from_list_id = data.get("fromListId")
    to_list_id = data.get("toListId")
    card_id = data.get("cardId")

    board = boards_collection.find_one({"_id": ObjectId(board_id), "userId": user_id})
    if not board:
        return jsonify({"error": "Board not found"}), 404

    lists = board.get("lists", [])
    card_to_move = None

    # Remove card from the source list
    for lst in lists:
        if lst["listId"] == from_list_id:
            for card in lst["cards"]:
                if card["cardId"] == card_id:
                    card_to_move = card
                    break
            if card_to_move:
                lst["cards"].remove(card_to_move)
            break

    if not card_to_move:
        return jsonify({"error": "Card not found"}), 404

    # Update the card status based on which list it is dropped into
    # Maps common list names to a status value - this satisfies "indexing status modifications"
    def get_status_from_title(title):
        title_lower = title.lower().strip()
        if any(word in title_lower for word in ["done", "complete", "completed", "finished"]):
            return "done"
        elif any(word in title_lower for word in ["doing", "in progress", "progress", "working"]):
            return "doing"
        elif any(word in title_lower for word in ["doing", "in progress", "progress", "working"]):
            return "doing"
        else:
            return "todo"

    # Find the destination list title and update the card status
    for lst in lists:
        if lst["listId"] == to_list_id:
            new_status = get_status_from_title(lst["title"])
            card_to_move["status"] = new_status
            lst["cards"].append(card_to_move)
            break

    # Save everything back to MongoDB with one atomic update_one call
    boards_collection.update_one(
        {"_id": ObjectId(board_id)},
        {"$set": {"lists": lists}}
    )

    return jsonify({"message": "Card moved", "newStatus": card_to_move["status"]}), 200
