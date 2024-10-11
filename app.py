from flask import Flask, jsonify, request, render_template
from pymongo import MongoClient
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

#MongoDB connection
uri = os.getenv("MONGO_URI")
client = MongoClient(uri)
db = client['mydatabase']
collection = db['renewable_electricity']

#Route to serve the HTML template
@app.route('/explore')
def explore():
    return render_template('index.html')

@app.route('/')
def home():
    return render_template('home.html')

#Endpoint to retrieve predicted renewable energy data for a specific country and year
@app.route('/renewable-data', methods=['GET'])
def get_renewable_data():
    country_name = request.args.get('country')
    year = int(request.args.get('year'))
    result = collection.find_one({'country': country_name, 'year': year}, {'_id': 0, 'predicted_renewable_electricity': 1})
    if result:
        return jsonify(result), 200
    else:
        return jsonify({"message": f"No predicted data found for {country_name} in {year}"}), 404

def get_all_country_data_2024():
    year = 2024
    result = collection.find({'year': year}, {'_id': 0, 'country': 1, 'predicted_renewable_electricity': 1})
    country_data = {}
    for data in result:
        country_name = data['country']
        renewable_electricity = data['predicted_renewable_electricity']
        country_data[country_name] = renewable_electricity
    return country_data  #Return the entire dictionary of country data

#Load all country data for the year 2024 once and store it locally
all_country_data_2024 = get_all_country_data_2024()

#Endpoint to return renewable electricity data for a specific country in 2024
@app.route('/renewable-data-2024', methods=['GET'])
def get_renewable_data_2024():
    country_name = request.args.get('country')  # Extract country parameter from the request
    if country_name:
        #Check if the country name is valid
        if country_name in all_country_data_2024:
            renewable_electricity = all_country_data_2024[country_name]
            return jsonify({country_name: renewable_electricity}), 200
        else:
            return jsonify({'error': 'Country not found'}), 404
    else:
        return jsonify({'error': 'Country parameter is required'}), 400
    
@app.route('/global-renewable-data', methods=['GET'])
def get_global_renewable_data():
    year = int(request.args.get('year'))
    result = collection.find({'year': year}, {'_id': 0, 'country': 1, 'predicted_renewable_electricity': 1})
    
    global_data = {}
    for data in result:
        country_name = data['country']
        renewable_electricity = round(data['predicted_renewable_electricity'], 2)
        global_data[country_name] = renewable_electricity
    
    return jsonify(global_data), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')