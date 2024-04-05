import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import r2_score

#load the data
data = pd.read_csv('data.csv')
countries = data['country'].unique()

def createData():
    for country in countries:
        # Filter the data based on the user input country
        filteredData = data[data['country'] == country]
        # Drop NaN values in 'year' and 'renewables_electricity' columns
        filteredData.dropna(subset=['year', 'renewables_electricity'], inplace=True)
        # Check if there are any valid data points left after dropping NaN values
        if filteredData.empty:
            print(f"No valid data available for {country}")
            continue  # Skip to the next country if no valid data
        startYear = 2024
        x = filteredData.year.astype(int)
        y = filteredData.renewables_electricity
        
        for i in range(0, 100):
            mymodel = np.poly1d(np.polyfit(x, y, 3))
            predicted_y = mymodel(i + startYear)
            r_squared = r2_score(y, mymodel(x))
            print("R-squared score:", r_squared)
            print(f"Predicted renewable electricity consumption for {country} in {i + startYear}: {predicted_y} terawatt hours")
#function to plot the data and the predicted value 
def plot_data():
  plt.scatter(x, y, color="black")
  plt.scatter(yearChoice, predicted_y, color='blue', label='Predicted')
  plt.plot(x, mymodel(x), color="red", label='Polynomial Regression')
  plt.xlabel('Year')
  plt.ylabel('Renewable Electricity Consumption (In terawatt hours)')
  plt.title(f'Polynomial Regression for {countryChoice} Renewable Electricity Consumption')
  plt.legend()
  plt.show()

createData()
