from flask import Blueprint, request, jsonify
from bson import ObjectId
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.mongo import boards_collection
from services.jwt_service import verify_token

boards_bp = Blueprint("boards", __name__)

def get_user_id(request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    return verify_token(token)


@boards_bp.route("/boards", methods=["GET"])
def get_boards():
    user_id = get_user_id(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    boards = list(boards_collection.find({"userId": user_id}))
    for b in boards:
        b["_id"] = str(b["_id"])
    return jsonify(boards), 200


@boards_bp.route("/boards", methods=["POST"])
def create_board():
    user_id = get_user_id(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    board_name = data.get("boardName")

    if not board_name:
        return jsonify({"error": "Board name is required"}), 400

    board = {
        "userId": user_id,
        "boardName": board_name,
        "lists": []
    }
    result = boards_collection.insert_one(board)

    return jsonify({
        "message": "Board created",
        "_id": str(result.inserted_id),
        "boardName": board_name,
        "lists": []
    }), 201


@boards_bp.route("/boards/<board_id>", methods=["GET"])
def get_board(board_id):
    user_id = get_user_id(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    board = boards_collection.find_one({"_id": ObjectId(board_id), "userId": user_id})
    if not board:
        return jsonify({"error": "Board not found"}), 404

    board["_id"] = str(board["_id"])
    return jsonify(board), 200


@boards_bp.route("/boards/<board_id>", methods=["PUT"])
def update_board(board_id):
    user_id = get_user_id(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    board_name = data.get("boardName")

    boards_collection.update_one(
        {"_id": ObjectId(board_id), "userId": user_id},
        {"$set": {"boardName": board_name}}
    )
    return jsonify({"message": "Board updated"}), 200


@boards_bp.route("/boards/<board_id>", methods=["DELETE"])
def delete_board(board_id):
    user_id = get_user_id(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    boards_collection.delete_one({"_id": ObjectId(board_id), "userId": user_id})
    return jsonify({"message": "Board deleted"}), 200
