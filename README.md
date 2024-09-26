# Visit the site here! 
[Production Website](https://sustainable-energy-model.onrender.com)

# Renewable Energy Prediction Project
This project utilizes linear regression to predict the renewable energy production for every country over the next 100 years. The predicted data is visualized on a front-end interface, which fetches the data from a Flask backend connected to an online MongoDB database.

# Project Overview
The goal of this project is to provide insights into the future renewable energy production of various countries, enabling stakeholders to make informed decisions regarding energy planning and policy-making. By utilizing linear regression modeling techniques, the project forecasts energy production trends for the next century.

# Features
- Meta Prophet Data Prediction: Utilizes Meta's Prophet procedure to predict renewable energy production for each country.
- Front-end Visualization: Visualizes predicted energy production data using a 3d map of the world.
- Backend Data Fetching: Fetches prediction data from a Flask backend connected to an online MongoDB database.
# Getting Started
To get started with this project, follow these steps:

- Clone the repository to your local machine.
- Install the necessary dependencies. 
- Set up and configure the Flask backend to connect to your MongoDB database by creating a .env file and adding MONGO_URI="YourMongoURI".
- Launch the Flask server to start serving prediction data (Run app.py).
- Open the front-end interface in a web browser to visualize the predicted energy production.
# Note
The database isn't provided. If you would like, you can use your own online mongo database. There is a free version which I used for this project. To create the data for this database run the create_and_store_data() function in the LinearRegression.py file. 

# Contributing
Contributions are welcome! Feel free to fork the repository, make improvements, and submit pull requests. For major changes, please open an issue first to discuss the proposed changes.


