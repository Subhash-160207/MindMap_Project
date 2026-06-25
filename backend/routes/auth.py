from flask import Blueprint, request, jsonify
import bcrypt
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.mongo import users_collection
from services.jwt_service import generate_token, verify_token

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    # Check if email already exists
    existing = users_collection.find_one({"email": email})
    if existing:
        return jsonify({"error": "Email already registered"}), 409

    # Hash the password
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    user = {
        "name": name,
        "email": email,
        "password": hashed
    }
    result = users_collection.insert_one(user)

    token = generate_token(result.inserted_id)

    return jsonify({
        "message": "Account created successfully",
        "token": token,
        "name": name
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    # Check password
    if not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(user["_id"])

    return jsonify({
        "message": "Login successful",
        "token": token,
        "name": user["name"]
    }), 200


@auth_bp.route("/profile", methods=["GET"])
def profile():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user_id = verify_token(token)

    if not user_id:
        return jsonify({"error": "Invalid or expired token"}), 401

    from bson import ObjectId
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "name": user["name"],
        "email": user["email"]
    }), 200
