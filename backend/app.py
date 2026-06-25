from flask import Flask, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routes.auth import auth_bp
from routes.boards import boards_bp
from routes.lists import lists_bp
from routes.cards import cards_bp

# Tell Flask where the frontend folder is
FRONTEND_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend')

app = Flask(__name__, static_folder=FRONTEND_FOLDER, static_url_path='')
CORS(app)

# Register all the API routes
app.register_blueprint(auth_bp)
app.register_blueprint(boards_bp)
app.register_blueprint(lists_bp)
app.register_blueprint(cards_bp)

# Serve the frontend pages directly
@app.route('/')
def login():
    return send_from_directory(FRONTEND_FOLDER, 'login.html')

@app.route('/login.html')
def login_page():
    return send_from_directory(FRONTEND_FOLDER, 'login.html')

@app.route('/signup.html')
def signup_page():
    return send_from_directory(FRONTEND_FOLDER, 'signup.html')

@app.route('/dashboard.html')
def dashboard_page():
    return send_from_directory(FRONTEND_FOLDER, 'dashboard.html')

@app.route('/index.html')
def board_page():
    return send_from_directory(FRONTEND_FOLDER, 'index.html')


def check_mongodb_connection():
    """Check if MongoDB is running and print the result clearly"""
    try:
        # Try to connect with a 3 second timeout
        client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=3000)
        # This line actually tests the connection
        client.admin.command("ping")
        print("  MongoDB     : Connected successfully")
        client.close()
        return True
    except ConnectionFailure:
        print("  MongoDB     : NOT connected!")
        print("")
        print("  >> MongoDB is not running. Please start it first.")
        print("  >> Search 'Services' in Windows start menu,")
        print("     find 'MongoDB' and click Start.")
        print("")
        return False


if __name__ == "__main__":
    print("")
    print("========================================")
    print("   MindMap Studio - Starting up...")
    print("========================================")

    # Check MongoDB before starting
    mongo_ok = check_mongodb_connection()

    if mongo_ok:
        print("  Flask Server: http://localhost:5000")
        print("========================================")
        print("")
        print("  Open your browser and go to:")
        print("  http://localhost:5000")
        print("")
        print("  Press CTRL+C to stop the server")
        print("========================================")
        print("")
        app.run(debug=True, port=5000)
    else:
        print("========================================")
        print("  Server NOT started due to MongoDB error.")
        print("  Fix MongoDB and run python app.py again.")
        print("========================================")
        print("")
