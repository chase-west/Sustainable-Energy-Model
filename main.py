import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import r2_score

#load the data
data = pd.read_csv('data.csv')

#get user input for country and year
countryChoice = input("Enter country you want to predict renewable electricity consumption for: ")
yearChoice = int(input("Enter year you want to predict renewable electricity consumption for: "))  

#filter the data based on the user input
filteredData = data[data['country'] == countryChoice]
filteredData.dropna(subset=['year', 'renewables_electricity'], inplace=True)

#perform polynomial regression
x = filteredData.year.astype(int)
y = filteredData.renewables_electricity
mymodel = np.poly1d(np.polyfit(x, y, 3))

#predicted energy consumption for the user input year
predicted_y = mymodel(yearChoice)

#measures how tight the fit is to plot line
r_squared = r2_score(y, mymodel(x))
print("R-squared score:", r_squared)

print(f"Predicted renewable electricity consumption for {countryChoice} in {yearChoice}: {predicted_y} terawatt hours")

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


#def createData():