from pymongo import MongoClient
import config

client = MongoClient(config.MONGO_URI)
db = client[config.DB_NAME]

# Collections
users_collection = db["users"]
boards_collection = db["boards"]
