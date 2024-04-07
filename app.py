from flask import Flask, jsonify, request, render_template
from pymongo import MongoClient
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# MongoDB connection
uri = os.getenv("MONGO_URI")
client = MongoClient(uri)
db = client['mydatabase']
collection = db['renewable_electricity']

# Route to serve the HTML template
@app.route('/')
def index():
    return render_template('index.html')

# Endpoint to retrieve predicted renewable energy data for a specific country and year
@app.route('/renewable-data', methods=['GET'])
def get_renewable_data():
    country_name = request.args.get('country')
    year = int(request.args.get('year'))

    result = collection.find_one({'country': country_name, 'year': year}, {'_id': 0, 'predicted_renewable_electricity': 1})
    if result:
        return jsonify(result), 200
    else:
        return jsonify({"message": f"No predicted data found for {country_name} in {year}"}), 404

if __name__ == '__main__':
    app.run(debug=True)
