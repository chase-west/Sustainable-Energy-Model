import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from prophet import Prophet
from pymongo import MongoClient
import os 
from dotenv import load_dotenv
from tqdm import tqdm
import argparse
import matplotlib.ticker as ticker

# Load environment variables
load_dotenv()

# MongoDB connection URI
uri = os.getenv("MONGO_URI")

def connect_to_mongodb():
    client = MongoClient(uri)
    db = client['mydatabase']
    return db['renewable_electricity']

def create_and_store_data(use_db=False, specific_country=None):
    all_predictions = []
    
    if use_db:
        collection = connect_to_mongodb()
    
    countries_to_process = [specific_country] if specific_country else countries

    for country in tqdm(countries_to_process, desc="Processing countries"):
        filtered_data = data[data['Entity'] == country]
        filtered_data = filtered_data.loc[~filtered_data[['Year', 'Total Renewable Generation - TWh']].isna().any(axis=1)]
        
        if filtered_data.empty or filtered_data.shape[0] < 2:
            print(f"No valid data available or not enough data for {country}")
            continue
        
        # Prepare data for Prophet
        prophet_data = filtered_data[['Year', 'Total Renewable Generation - TWh']].rename(columns={'Year': 'ds', 'Total Renewable Generation - TWh': 'y'})
        prophet_data['ds'] = pd.to_datetime(prophet_data['ds'], format='%Y')

        # Create and fit the model
        model = Prophet(yearly_seasonality=True)
        model.fit(prophet_data)

        # Create future dataframe for predictions
        future_dates = pd.date_range(start='2024-01-01', end='2125-01-01', freq='YE')
        future = pd.DataFrame({'ds': future_dates})

        # Make predictions
        forecast = model.predict(future)
        
        # Prepare predicted data
        predicted_data = []
        for _, row in forecast.iterrows():
            prediction = {
                'country': country,
                'year': row['ds'].year,
                'predicted_renewable_electricity': row['yhat'],
                'lower_bound': row['yhat_lower'],
                'upper_bound': row['yhat_upper']
            }
            predicted_data.append(prediction)
            all_predictions.append(prediction)

        if use_db:
            try:
                # Remove existing data for the country before inserting new data
                collection.delete_many({'country': country})
                collection.insert_many(predicted_data)
                print(f"Predicted data for {country} stored in MongoDB")
            except Exception as e:
                print(f"Error storing data for {country}: {e}")
        else:
            print(f"Predicted data for {country} calculated (not stored in DB)")
    
    return all_predictions

def plot_data(country, predictions=None, use_db=False):
    if use_db:
        collection = connect_to_mongodb()
        data = list(collection.find({'country': country}))
        df = pd.DataFrame(data)
    else:
        if predictions is None:
            print("No predictions available. Run create_and_store_data first.")
            return
        df = pd.DataFrame([p for p in predictions if p['country'] == country])

    if df.empty:
        print(f"No data available for {country}")
        return

    plt.figure(figsize=(12, 6))
    plt.plot(df['year'], df['predicted_renewable_electricity'], label='Predicted', marker='o')
    plt.fill_between(df['year'], df['lower_bound'], df['upper_bound'], alpha=0.3)
    plt.xlabel('Year')
    plt.ylabel('Renewable Electricity Consumption (TWh)')
    plt.title(f'Predicted Renewable Electricity Consumption in {country}')
    plt.legend()

    # Format y-axis to show as whole numbers
    ax = plt.gca()  # Get the current axis
    ax.yaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: f'{int(x):,}'))

    plt.show()

def get_highest_renewable_energy(predictions=None, use_db=False):
    if use_db:
        collection = connect_to_mongodb()
        pipeline = [
            {
                '$group': {
                    '_id': '$country',
                    'max_renewable_energy': {
                        '$max': '$predicted_renewable_electricity'
                    }
                }
            },
            {
                '$sort': {
                    'max_renewable_energy': -1
                }
            }
        ]
        result = collection.aggregate(pipeline)
        for doc in result:
            country = doc['_id']
            max_renewable_energy = doc['max_renewable_energy']
          #  print(f"Country: {country}, Highest Predicted Renewable Energy: {max_renewable_energy:.2f} TWh")
    else:
        if predictions is None:
            print("No predictions available. Run create_and_store_data first.")
            return
        df = pd.DataFrame(predictions)
        result = df.groupby('country')['predicted_renewable_electricity'].max().sort_values(ascending=False)
        for country, max_renewable_energy in result.items():
            print(f"Country: {country}, Highest Predicted Renewable Energy: {max_renewable_energy:.2f} TWh")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Renewable Energy Forecast Tool")
    parser.add_argument("--use_db", action="store_true", help="Use MongoDB for storage")
    parser.add_argument("--country", type=str, help="Country to predict energy for")
    parser.add_argument("--plot", action="store_true", help="Plot data for the specified country")
    args = parser.parse_args()

    # Load the data
    data = pd.read_csv('newdata.csv')
    countries = data['Entity'].unique()

    if args.country:
        # Process only the specified country
        if args.country in countries:
            predictions = create_and_store_data(use_db=args.use_db, specific_country=args.country)
            if args.plot:
                plot_data(args.country, predictions, use_db=args.use_db)
        else:
            print(f"Country '{args.country}' not found in the dataset.")
    else:
        # Process all countries if no specific country is given
        predictions = create_and_store_data(use_db=args.use_db)

    #get_highest_renewable_energy(predictions, use_db=args.use_db)