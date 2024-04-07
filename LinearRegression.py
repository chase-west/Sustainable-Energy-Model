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
uri = os.getenv("MONGO_URI")

# Create a MongoDB client
client = MongoClient(uri)

# Access or create a database
db = client['mydatabase']

# Access collection
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




def plot_data(country):
    filtered_data = data[data['country'] == country]
    x = filtered_data.year
    y = filtered_data.renewables_electricity
    mymodel = np.poly1d(np.polyfit(x, y, 3))
    
    #plot data
    plt.scatter(x, y, color='blue', label='Actual Data')
    plt.plot(x, mymodel(x), color='red', label='Predicted Data')
    plt.xlabel('Year')
    plt.ylabel('Renewable Electricity Consumption')
    plt.title(f'Renewable Electricity Consumption in {country}')
    plt.legend()
    plt.show()


#create_and_store_data()
#plot_data('United States')
