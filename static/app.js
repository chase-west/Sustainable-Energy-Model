//function to fetch renewable energy data from Flask backend
function fetchRenewableData(countryName, year) {
  const url = `/renewable-data?country=${countryName}&year=${year}`;

  return fetch(url)
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => {
          return data.predicted_renewable_electricity; //get predicted value from response
      })
      .catch(error => {
          console.error('Error fetching renewable energy data:', error);
          return null;
      });
}

//event listener for click on the countryObject
countryMesh.addEventListener('click', async () => {
  const { countryName } = countryMesh.userData;
  const specificYear = 2024; //change later for dynamic year based off slider 

  try {
      const predictedValue = await fetchRenewableData(countryName, specificYear);

      if (predictedValue !== null) {
          console.log(`Predicted renewable electricity for ${countryName} in ${specificYear}: ${predictedValue} terawatt hours`);
          //change color of countryObject based on predicted value + show amount of energy 
          //implement
      } else {
          console.log(`No predicted renewable energy data found for ${countryName} in ${specificYear}`);
      }
  } catch (error) {
      console.error('Error:', error);
  }
});