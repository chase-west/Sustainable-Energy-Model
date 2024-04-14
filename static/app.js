//function to fetch renewable energy data from Flask backend
export async function fetchRenewableData(countryName, year) {
  const url = `/renewable-data?country=${countryName}&year=${year}`;

  return fetch(url)
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => {
          data.predicted_renewable_electricity = Math.round(data.predicted_renewable_electricity * 100) / 100; //round to 2 decimal places
          return data.predicted_renewable_electricity; //get predicted value from response
      })
      .catch(error => {
          console.error('Error fetching renewable energy data:', error);
          return null;
      });
}

export async function Fetch2024CountryData(countryName) {
    const url = `/renewable-data-2024?country=${countryName}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && typeof data[countryName] !== 'undefined') {
            data[countryName] = Math.round(data[countryName] * 100) / 100;
            return data[countryName]; // Return the predicted value directly
        } else {
            throw new Error('Country data not found or invalid response');
        }
    } catch (error) {
        console.error('Error fetching renewable energy data:', error);
        return null;
    }
}

