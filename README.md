# Visit the site here! 
[Production Website](https://sustainable-energy-model.onrender.com)

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
We are not accepting contributions right now as this app will be submitted for the congressional app challenge. 
We will accept contributions in the future when the contest is over!  


