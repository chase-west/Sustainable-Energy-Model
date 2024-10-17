import { fetchRenewableData, Fetch2024CountryData } from "./app.js";

let energy = 0;
const renewableEnergyValue = document.getElementById('renewableEnergyValue');
const yearSlider = document.getElementById('yearSlider');
const toggleButton = document.getElementById('toggleInsights');

let sliderTimer;
const loadingScreen = document.getElementById('loading-screen');
const instructions = document.getElementById('instructions');

const uniformColor = '#34A56F'; // Uniform color for all countries
const colorScale = d3.scaleLinear()
.domain([0, 4000]) 
.range(['red', 'yellow']); 

let countryData = {}; // To store renewable energy data
let countryYears = {}; // To keep track of country years

let sliderDisplayed = false;
let selectedCountry = null; // Track the currently selected country

let globalRenewableData = {};
let topProducers = [];
let growthRates = {};

const world = Globe()
    .globeImageUrl("/static/images/earthbackground.png")
    .lineHoverPrecision(0)
    .polygonCapColor(() => uniformColor)
    .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
    .polygonStrokeColor(() => '#111')
    .onPolygonClick(async (hoverD) => {
        const countryName = nameMapping[hoverD.properties.ADMIN] || hoverD.properties.ADMIN;
        selectedCountry = countryName;

        // Display the slider the first time a country is clicked
        if (!sliderDisplayed) {
            displaySlider();
            sliderDisplayed = true; 
        }

        if (!countryData[selectedCountry]) {
            const renewableData = await Fetch2024CountryData(selectedCountry);
            countryData[selectedCountry] = renewableData;
            const newColor = colorScale(renewableData);
            countryData[selectedCountry + '_color'] = newColor;
            updateCountryColor(selectedCountry);
        }
        
        resetUI(selectedCountry);
    })
    .polygonsTransitionDuration(600)
    (document.getElementById('globe'));

const nameMapping = {
    "United States of America": "United States",
    "United Republic of Tanzania": "Tanzania",
    "Democratic Republic of the Congo": "Democratic Republic of Congo",
    "The Bahamas": "Bahamas",
    "Ivory Coast": "Cote d'Ivoire",
    "Republic of the Congo": "Congo",
    "eSwatini": "Eswatini",
    "Northern Cyprus": "Cyprus",
    "Somaliland": "Somalia",
    "Republic of Serbia": "Serbia"
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

function displaySlider() {
    const sliderContainers = document.getElementsByClassName('slider-container');
    Array.from(sliderContainers).forEach(container => {
        container.style.display = 'block';
    });
    toggleButton.style.display = 'block'
    instructions.style.display = 'none';
}

let currentYear = 2024; 

// Handle slider input change
yearSlider.addEventListener('input', async () => {
    currentYear = parseInt(yearSlider.value);
    updateSliderYear(currentYear);

    if (selectedCountry) {
        await handleSliderInput(currentYear, selectedCountry);
    }
});

async function handleSliderInput(year, selectedCountry) {
    clearTimeout(sliderTimer);
    sliderTimer = setTimeout(async () => {
        if (selectedCountry) {
            try {
                const renewableData = await fetchRenewableData(selectedCountry, year);
                countryData[selectedCountry] = renewableData;
                countryYears[selectedCountry] = year;
                updateCountryData(selectedCountry, renewableData);
                const newColor = colorScale(renewableData);
                countryData[selectedCountry + '_color'] = newColor;
                updateCountryColor(selectedCountry);
                updateDataInsights(selectedCountry, year);
            } catch (error) {
                console.error('Error fetching renewable data:', error);
            }
        }
    }, 200);
}

async function updateDataInsights(country, year) {
    // Fetch global data for the selected year
    const globalData = await fetchGlobalData(year);
    globalRenewableData[year] = globalData;
    
    // Calculate top producers
    topProducers = Object.entries(globalData)
        .filter(([country, _]) => country !== 'World') // exclude world from top producers list
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Calculate growth rates
    if (year > 2024) {
        const previousYearData = await fetchGlobalData(year - 1);
        growthRates = {};
        for (const [country, value] of Object.entries(globalData)) {
            const previousValue = previousYearData[country] || 0;
            if (previousValue > 0) {
                growthRates[country] = ((value - previousValue) / previousValue) * 100;
            } else {
                growthRates[country] = value > 0 ? 100 : 0; // 100% growth if previous was 0, 0% if both are 0
            }
        }
    } else {
        growthRates = {}; // No growth rates available for 2024
    }
    
    // Update the UI with new insights
    updateInsightsUI(country, year);
}

function updateInsightsUI(country, year) {
    const insightsContainer = document.getElementById('insights-container');
    
    let insightsHTML = `
        <h2>Data Insights for ${country} in ${year}</h2>
        <p>Renewable Energy Production: ${countryData[country]} TWh</p>
        <p>Global Ranking: ${getGlobalRanking(country, year)}</p>
    `;

    if (year > 2024) {
        insightsHTML += `<p>Growth Rate: ${growthRates[country]?.toFixed(2) || 'N/A'}%</p>`;
    }

    insightsHTML += `
        <h3>Top 5 Renewable Energy Producers:</h3>
        <ol>
            ${topProducers.map(([country, value]) => `<li>${country}: ${value} TWh</li>`).join('')}
        </ol>
    `;
    
    insightsHTML += `
        <h3 id = "global-energy-text">Global Renewable Energy:</h3>
        <p>World: ${globalRenewableData[year]['World']} TWh</p>
    `;

    insightsContainer.innerHTML = insightsHTML;
}

function getGlobalRanking(country, year) {
    const globalData = globalRenewableData[year];
    const sortedCountries = Object.entries(globalData)
        .sort((a, b) => b[1] - a[1]);
    return sortedCountries.findIndex(([c, _]) => c === country) + 1;
}

async function fetchGlobalData(year) {
    return fetch(`/global-renewable-data?year=${year}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching global renewable data:', error);
            return {};
        });
}

function updateCountryData(countryName, renewableData) {
    renewableEnergyValue.textContent = renewableData + ' TWh';
    countryData[countryName] = renewableData;
}

function updateCountryColor(countryName) {
    const color = countryData[countryName + '_color'] || uniformColor; // Get the saved color or use uniform color
    world.polygonCapColor(feat => {
        const mappedName = nameMapping[feat.properties.ADMIN] || feat.properties.ADMIN; // Map name for color update
        if (mappedName === countryName) {
            return color;
        }
        return uniformColor; // Return the uniform color for all other countries
    });
}

function resetUI(countryName) {
    // Check if the country has saved renewable data
    if (countryName in countryData) {
        energy = countryData[countryName]; 
        renewableEnergyValue.textContent = energy + ' TWh'; 
    } else {
        renewableEnergyValue.textContent = '0 TWh'; // Default to 0 TWh if no data is available
    }

    if (countryName in countryYears) {
        currentYear = countryYears[countryName]; 
    } else {
        currentYear = 2024; // Default to 2024 if no saved year exists
    }
    
    yearSlider.value = currentYear;
    document.getElementById('yearValue').textContent = currentYear;
    
    updateCountryColor(countryName);
    updateDataInsights(countryName, currentYear);
}

function updateSliderYear(newYear) {
    document.getElementById('yearValue').textContent = newYear; 
}

function handleWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Resize the globe's canvas
    world.width(width).height(height);
}

// Add event listener to handle window resizing
window.addEventListener('resize', handleWindowResize);

handleWindowResize();
loadCountries();
