import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.model_selection import cross_val_score, GridSearchCV
from prophet import Prophet
from sklearn.pipeline import make_pipeline


# Load the dataset
df = pd.read_csv('newdata.csv')

def polynomial_regression_cv(country, df):
    country_data = df[df['Entity'] == country]
    
    if country_data.empty:
        print(f"No data available for {country}.")
        return None
    
    X = country_data[['Year']].values
    y = country_data['Total Renewable Generation - TWh'].values

    best_degree = None
    best_score = -float('inf')

    # Test polynomial degrees 1 to 5
    for degree in range(1, 6):
        model = make_pipeline(PolynomialFeatures(degree), LinearRegression())
        try:
            scores = cross_val_score(model, X, y, scoring='neg_mean_squared_error', cv=5)
            mean_score = np.mean(scores)
            if mean_score > best_score:
                best_score = mean_score
                best_degree = degree
        except ValueError:
            print(f"Not enough samples to perform cross-validation for {country} with degree {degree}.")
            continue

    if best_degree is not None:
        print(f"Best polynomial degree for {country}: {best_degree}")
    else:
        print(f"Failed to find the best polynomial degree for {country}.")
    return best_degree

def ridge_regression_cv(country, df):
    country_data = df[df['Entity'] == country]
    
    if country_data.empty:
        print(f"No data available for {country}.")
        return None
    
    X = country_data[['Year']].values
    y = country_data['Total Renewable Generation - TWh'].values

    # Set up polynomial feature transformer
    poly = PolynomialFeatures()

    # Ridge regression with GridSearchCV for hyperparameter tuning
    ridge = Ridge()
    param_grid = {'alpha': [0.1, 1.0, 10.0], 'degree': [2, 3, 4, 5]}
    grid = GridSearchCV(make_pipeline(PolynomialFeatures(), Ridge()), param_grid, cv=5, scoring='neg_mean_squared_error')
    
    try:
        grid.fit(X, y)
        best_model = grid.best_estimator_
        print(f"Best parameters for {country}: {grid.best_params_}")
        return best_model
    except ValueError:
        print(f"Not enough samples to perform GridSearchCV for {country}.")
        return None

def time_series_forecast(country, df):
    country_data = df[df['Entity'] == country][['Year', 'Total Renewable Generation - TWh']]
    
    if country_data.empty:
        print(f"No data available for {country}.")
        return
    
    country_data.columns = ['ds', 'y']  # Prophet expects 'ds' for date and 'y' for the value

    model = Prophet()
    model.fit(country_data)

    future = model.make_future_dataframe(periods=100, freq='Y')
    forecast = model.predict(future)

    model.plot(forecast)
    plt.title(f'Prophet Time-Series Forecast for {country}')
    plt.show()

def plot_residuals(model, X, y, title):
    predictions = model.predict(X)
    residuals = y - predictions
    plt.scatter(X, residuals)
    plt.hlines(0, X.min(), X.max(), color='red')
    plt.title(f'Residual Plot: {title}')
    plt.xlabel('Year')
    plt.ylabel('Residuals')
    plt.grid(True)
    plt.show()

def find_optimal_regression(country, df):
    print(f"Processing {country}...")

    best_degree = polynomial_regression_cv(country, df)

    ridge_model = ridge_regression_cv(country, df)

    time_series_forecast(country, df)

    if ridge_model is not None:
        country_data = df[df['Entity'] == country]
        X = country_data[['Year']].values
        y = country_data['Total Renewable Generation - TWh'].values
        plot_residuals(ridge_model, X, y, f"Ridge Regression with degree {ridge_model.named_steps['polynomialfeatures'].degree}")

def main():
    country = "Saudi Arabia"  # Change the country as needed
    find_optimal_regression(country, df)

if __name__ == "__main__":
    main()