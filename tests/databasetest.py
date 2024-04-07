from pymongo import MongoClient
import os 
from dotenv import load_dotenv

#retrieve MongoDB credentials from environment variables
load_dotenv()
MongoUserName = os.getenv("MONGO_USERNAME")
MongoPW = os.getenv("MONGO_PASSWORD")

# MongoDB connection URI
uri = f"mongodb+srv://{MongoUserName}:{MongoPW}@cluster0.sppfhvv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Create a MongoDB client
client = MongoClient(uri)

# Access or create a database
db = client['mydatabase']

# Access or create a collection
collection = db['renewable_electricity']

def test_data_energy_call(country_name, year):
    # Query MongoDB for data of the specified country and year
    cursor = collection.find({'country': country_name, 'year': year}, {'_id': 0, 'predicted_renewable_electricity': 1})

    # Extract the data into a list of dictionaries
    renewable_energy_data = [data['predicted_renewable_electricity'] for data in cursor]


    return renewable_energy_data


print(test_data_energy_call('United States', 2024))