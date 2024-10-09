import { fetchRenewableData, Fetch2024CountryData } from "./app.js";

let energy = 0;
const renewableEnergyValue = document.getElementById('renewableEnergyValue');
const yearSlider = document.getElementById('yearSlider');
let sliderTimer;
const loadingScreen = document.getElementById('loading-screen');
const instructions = document.getElementById('instructions');

const uniformColor = '#34A56F'; // Uniform color for all countries
const colorScale = d3.scaleLinear()
.domain([0, 8000]) 
.range(['red', 'yellow']); 

let countryData = {}; // To store renewable energy data
let countryYears = {}; // To keep track of country years

let sliderDisplayed = false; // Flag to check if the slider has been displayed
let selectedCountry = null; // Track the currently selected country

const world = Globe()
    .globeImageUrl("https://www.icolorpalette.com/download/solidcolorimage/375673_solid_color_background_icolorpalette.png")
    .lineHoverPrecision(0)
    .polygonCapColor(() => uniformColor) // Set uniform color for all countries
    .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
    .polygonStrokeColor(() => '#111')
    .polygonLabel(({ properties: d }) => `
      <b>${d.ADMIN}</b> <br />
    `)
    .onPolygonClick(async (hoverD) => {
        const countryName = nameMapping[hoverD.properties.ADMIN] || hoverD.properties.ADMIN; // Map name
        selectedCountry = countryName; // Update the selected country
    
        // Display the slider the first time a country is clicked
        if (!sliderDisplayed) {
            displaySlider();
            sliderDisplayed = true; // Set the flag to true
        }
    
        // Check if data for the selected country is already fetched
        if (!countryData[selectedCountry]) {
            // Fetch data only if it's not already available
            const renewableData = await Fetch2024CountryData(selectedCountry);
    
            // Store the fetched renewable data for immediate use
            countryData[selectedCountry] = renewableData; // Store renewable energy data
    
            // Update the color based on the fetched renewable data immediately
            const newColor = colorScale(renewableData); // Get the color from the scale
            countryData[selectedCountry + '_color'] = newColor; // Store the new color for the country
    
            // Apply the color immediately to the country
            updateCountryColor(selectedCountry);
        }
        
        // After fetching, reset the UI
        resetUI(selectedCountry);
    })
    .polygonsTransitionDuration(600)
    (document.getElementById('globe'));

const nameMapping = {
    "United States of America": "United States"
};

async function loadCountries() {
    const res = await fetch('/static/model/ne_110m_admin_0_countries.geojson');
    const countries = await res.json();

    // Update the globe with the countries
    world.polygonsData(countries.features.filter(d => d.properties.ISO_A2 !== 'AQ'));

    // Delay hiding the loading screen to allow transitions to appear
    setTimeout(() => {
        loadingScreen.style.display = 'none'; 
        instructions.style.display = 'block'; 
    }, 600); 
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

                // Store the renewable data and year for future reference
                countryData[selectedCountry] = renewableData; // Save the renewable energy value
                countryYears[selectedCountry] = year; // Save the selected year

                updateCountryData(selectedCountry, renewableData);

                // Update the color based on renewable energy value
                const newColor = colorScale(renewableData); // Get color from scale
                countryData[selectedCountry + '_color'] = newColor; // Save the new color for the selected country
                updateCountryColor(selectedCountry); // Apply color change on the globe
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
            return color; // Return the updated color for the selected country
        }
        return uniformColor; // Return the uniform color for all other countries
    });
}

function resetUI(countryName) {
    // Check if the country has saved renewable data
    if (countryName in countryData) {
        energy = countryData[countryName]; // Get the saved energy value
        renewableEnergyValue.textContent = energy + ' TWh'; // Display the saved energy value
    } else {
        renewableEnergyValue.textContent = '0 TWh'; // Default to 0 TWh if no data is available
    }

    let year = new Date().getFullYear(); // Default to the current year
    if (countryName in countryYears) {
        year = countryYears[countryName]; // Get the saved year
        yearSlider.value = year; // Set the slider to the saved year
        document.getElementById('yearValue').textContent = year; // Display the saved year
    } else {
        yearSlider.value = year; // Default to the current year if no saved year exists
        document.getElementById('yearValue').textContent = year;
    }
    
    // Update the country color if saved
    updateCountryColor(countryName);
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

// Function to handle resizing of the globe
function handleWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Resize the globe's canvas
    world.width(width).height(height);
}

// Add event listener to handle window resizing
window.addEventListener('resize', handleWindowResize);

// Call the resize function immediately to set the initial size
handleWindowResize();

loadCountries(); // Start loading countries
