import { fetchRenewableData, Fetch2024CountryData } from "./app.js";

let energy = 0;
const renewableEnergyValue = document.getElementById('renewableEnergyValue');
const yearSlider = document.getElementById('yearSlider');
let sliderTimer;
const loadingScreen = document.getElementById('loading-screen');
const instructions = document.getElementById('instructions');

const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);

let countryData = {}; // to store renewable energy data
let yearData = {}; // to store year-specific data
let countryYears = {}; // To keep track of country years

let sliderDisplayed = false; // Flag to check if the slider has been displayed
let selectedCountry = null; // Track the currently selected country

const world = Globe()
    .lineHoverPrecision(0)
    .polygonAltitude(0.06)
    .polygonCapColor(feat => colorScale(countryData[feat.properties.ISO_A2] || 0))
    .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
    .polygonStrokeColor(() => '#111')
    .polygonLabel(({ properties: d }) => `
      <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
    `)
    .onPolygonClick(async (hoverD) => {
        selectedCountry = hoverD.properties.ADMIN; // Update the selected country

        // Display the slider the first time a country is clicked
        if (!sliderDisplayed) {
            displaySlider();
            sliderDisplayed = true; // Set the flag to true
        }

        const renewableData = await fetchRenewableData(selectedCountry, yearSlider.value);
        countryData[selectedCountry] = renewableData;
        updateCountryColor(selectedCountry);
        resetUI(selectedCountry);
    })
    .polygonsTransitionDuration(300)
    (document.getElementById('globe'));

    async function loadCountries() {
      const res = await fetch('/static/model/ne_110m_admin_0_countries.geojson');
      const countries = await res.json();
  
      // Create a mapping of original names to desired names
      const nameMapping = {
          "United States of America": "United States"
      };
  
      // Load the country data for initial rendering
      const countryDataPromises = countries.features.map(async (d) => {
          // Use the mapping to determine the country name
          const countryName = nameMapping[d.properties.ADMIN] || d.properties.ADMIN;
  
          // Fetch data for the country using the mapped name
          const country2024Data = await Fetch2024CountryData(countryName);
          countryData[d.properties.ISO_A2] = country2024Data;
  
          // Optional: Update the country properties with the new name for display
          d.properties.ADMIN = countryName; // Update the property directly if you need to reflect the change
      });
  
      // Wait for all promises to resolve before proceeding
      await Promise.all(countryDataPromises);
  
      // Update the globe with the countries
      world.polygonsData(countries.features.filter(d => d.properties.ISO_A2 !== 'AQ'));
      loadingScreen.style.display = 'none';
      instructions.style.display = 'block';
  }

// Handle slider input change
yearSlider.addEventListener('input', async () => {
    const year = parseInt(yearSlider.value);
    updateSliderYear(year);

    if (selectedCountry) {
        await handleSliderInput(year, selectedCountry); // Call handleSliderInput with the selected country
    }
});

async function handleSliderInput(year, selectedCountry) {
    clearTimeout(sliderTimer);
    sliderTimer = setTimeout(async () => {
        if (selectedCountry) {
            updateCountryYear(selectedCountry, year);
            try {
                const renewableData = await fetchRenewableData(selectedCountry, year);
                updateCountryData(selectedCountry, renewableData);
                updateCountryColor(selectedCountry); // Update color after data change
            } catch (error) {
                console.error('Error fetching renewable data:', error);
            }
        }
    }, 200);
}

// Function to update the renewable energy data for a specific country
function updateCountryData(countryName, renewableData) {
    renewableEnergyValue.textContent = renewableData + ' TWh';
    countryData[countryName] = renewableData;
}

// Function to update the color of the specified country on the globe
function updateCountryColor(countryCode) {
    world.polygonCapColor(feat => colorScale(countryData[feat.properties.ISO_A2] || 0));
}

function resetUI(countryName) {
    if (countryName in countryData) {
        energy = countryData[countryName];
        renewableEnergyValue.textContent = energy + ' TWh';
    } else {
        renewableEnergyValue.textContent = '0 TWh';
    }

    let year = new Date().getFullYear(); // Default to current year if year is not set
    if (countryName in countryYears) {
        year = countryYears[countryName];
        yearSlider.value = year;
        document.getElementById('yearValue').textContent = year;
    } else {
        yearSlider.value = year;
        document.getElementById('yearValue').textContent = year;
    }
}

// Function to update the slider value based on the selected year
function updateSliderYear(newYear) {
    document.getElementById('yearValue').textContent = newYear; // Update the slider value
}

// Function to display the slider and hide the instructions
function displaySlider() {
    const sliderContainers = document.getElementsByClassName('slider-container');
    Array.from(sliderContainers).forEach(container => {
        container.style.display = 'block';
    });
    instructions.style.display = 'none';
}

loadCountries(); // Start loading countries
