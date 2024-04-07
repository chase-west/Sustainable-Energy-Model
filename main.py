import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import r2_score
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

# Load the data
data = pd.read_csv('data.csv')
countries = data['country'].unique()

def create_and_store_data():
    for country in countries:
        filtered_data = data[data['country'] == country]
        filtered_data.dropna(subset=['year', 'renewables_electricity'], inplace=True)
        
        if filtered_data.empty:
            print(f"No valid data available for {country}")
            continue
        
        x = filtered_data.year.astype(int)
        y = filtered_data.renewables_electricity
        
        # Perform polynomial regression
        mymodel = np.poly1d(np.polyfit(x, y, 3))
        
        # Predict future values
        start_year = 2024
        predicted_data = []
        for i in range(0, 101):
            predicted_year = start_year + i
            predicted_value = mymodel(predicted_year)
            predicted_data.append({
                'country': country,
                'year': predicted_year,
                'predicted_renewable_electricity': predicted_value
            })
        
        # Insert predicted data into MongoDB collection
        collection.insert_many(predicted_data)
        print(f"Predicted data for {country} stored in MongoDB")

def get_renewable_data(country_name, year):
    # Query MongoDB for data of the specified country and year
    cursor = collection.find({'country': country_name, 'year': year}, {'_id': 0, 'predicted_renewable_electricity': 1})

    # Extract the data into a list of dictionaries
    renewable_energy_data = [data['predicted_renewable_electricity'] for data in cursor]


    return renewable_energy_data


def plot_data(country):
    filtered_data = data[data['country'] == country]
    x = filtered_data.year
    y = filtered_data.renewables_electricity
    mymodel = np.poly1d(np.polyfit(x, y, 3))
    
    plt.scatter(x, y, color='blue', label='Actual Data')
    plt.plot(x, mymodel(x), color='red', label='Predicted Data')
    plt.xlabel('Year')
    plt.ylabel('Renewable Electricity Consumption')
    plt.title(f'Renewable Electricity Consumption in {country}')
    plt.legend()
    plt.show()


#create_and_store_data()
print(get_renewable_data('United States', 2024))
#plot_data('United States')
