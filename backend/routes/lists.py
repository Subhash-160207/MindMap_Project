from flask import Blueprint, request, jsonify
from bson import ObjectId
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.mongo import boards_collection
from services.jwt_service import verify_token

lists_bp = Blueprint("lists", __name__)

def get_user_id(request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    return verify_token(token)


@lists_bp.route("/boards/<board_id>/lists", methods=["POST"])
def add_list(board_id):
    user_id = get_user_id(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    title = data.get("title")

    if not title:
        return jsonify({"error": "List title is required"}), 400

    new_list = {
        "listId": str(ObjectId()),
        "title": title,
        "cards": []
    }

    boards_collection.update_one(
        {"_id": ObjectId(board_id), "userId": user_id},
        {"$push": {"lists": new_list}}
    )

    return jsonify({"message": "List added", "list": new_list}), 201


@lists_bp.route("/boards/<board_id>/lists/<list_id>", methods=["PUT"])
def rename_list(board_id, list_id):
    user_id = get_user_id(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    new_title = data.get("title")

    boards_collection.update_one(
        {"_id": ObjectId(board_id), "userId": user_id, "lists.listId": list_id},
        {"$set": {"lists.$.title": new_title}}
    )

    return jsonify({"message": "List renamed"}), 200


@lists_bp.route("/boards/<board_id>/lists/<list_id>", methods=["DELETE"])
def delete_list(board_id, list_id):
    user_id = get_user_id(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    boards_collection.update_one(
        {"_id": ObjectId(board_id), "userId": user_id},
        {"$pull": {"lists": {"listId": list_id}}}
    )

    return jsonify({"message": "List deleted"}), 200
