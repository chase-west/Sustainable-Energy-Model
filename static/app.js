export { fetchRenewableData };
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

