import { fetchRenewableData, Fetch2024CountryData } from "./app.js";

let energy = 0;
const renewableEnergyValue = document.getElementById('renewableEnergyValue');
const yearSlider = document.getElementById('yearSlider');
let sliderTimer;
const loadingScreen = document.getElementById('loading-screen');
const instructions = document.getElementById('instructions');

const uniformColor = '#69b3a2'; // Uniform color for all countries
const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);

let countryData = {}; // To store renewable energy data
let yearData = {}; // To store year-specific data
let countryYears = {}; // To keep track of country years

let sliderDisplayed = false; // Flag to check if the slider has been displayed
let selectedCountry = null; // Track the currently selected country

const world = Globe()
    .lineHoverPrecision(0)
    .polygonAltitude(0.06)
    .polygonCapColor(() => uniformColor) // Set uniform color for all countries
    .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
    .polygonStrokeColor(() => '#111')
    .polygonLabel(({ properties: d }) => `
      <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
    `)
    .onPolygonClick(async (hoverD) => {
        const countryName = nameMapping[hoverD.properties.ADMIN] || hoverD.properties.ADMIN; // Map name
        selectedCountry = countryName; // Update the selected country

        // Display the slider the first time a country is clicked
        if (!sliderDisplayed) {
            displaySlider();
            sliderDisplayed = true; // Set the flag to true
        }

        const renewableData = await fetchRenewableData(selectedCountry, yearSlider.value);
        countryData[selectedCountry] = renewableData;
        updateCountryColor(hoverD.properties.ISO_A2); // Use ISO_A2 for color update
        resetUI(selectedCountry);
    })
    .polygonsTransitionDuration(300)
    (document.getElementById('globe'));

const nameMapping = {
    "United States of America": "United States"
};

async function loadCountries() {
    const res = await fetch('/static/model/ne_110m_admin_0_countries.geojson');
    const countries = await res.json();

    // Load the country data for initial rendering
    const countryDataPromises = countries.features.map(async (d) => {
        // Use the mapping to determine the country name
        const countryName = nameMapping[d.properties.ADMIN] || d.properties.ADMIN;

        // Fetch data for the country
        const country2024Data = await Fetch2024CountryData(countryName);
        countryData[countryName] = country2024Data; // Store renewable energy data using the mapped name

        // Initially set the country color to uniformColor
        countryData[countryName + '_color'] = uniformColor; // Save uniform color for each country
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
            try {
                const renewableData = await fetchRenewableData(selectedCountry, year);
                updateCountryData(selectedCountry, renewableData);

                // Update the color based on renewable data (if needed)
                const newColor = colorScale(renewableData); // Calculate new color
                countryData[selectedCountry + '_color'] = newColor; // Save the new color for the selected country
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
function updateCountryColor(countryName) {
    const color = countryData[countryName + '_color'] || uniformColor; // Get the saved color or use uniform color
    world.polygonCapColor(feat => {
        const mappedName = nameMapping[feat.properties.ADMIN] || feat.properties.ADMIN; // Map name for color update
        if (mappedName === countryName) {
            return color; // Return updated color for the selected country
        }
        return uniformColor; // Return uniform color for all other countries
    });
}

// Reset the slider value based on the country color
function resetSliderValue(countryName) {
    // Use renewableData to set the slider value (if you want to reflect this)
    const renewableData = countryData[countryName]; // Get current renewable data
    yearSlider.value = renewableData; // Set slider value to current renewable data
    document.getElementById('yearValue').textContent = renewableData; // Update the display value
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
