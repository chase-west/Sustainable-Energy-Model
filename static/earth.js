import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { fetchRenewableData } from "./app.js";
import { Fetch2024CountryData } from "./app.js";

//Create necessary variables
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
let energy = 0;
const renewableEnergyValue = document.getElementById('renewableEnergyValue');
const yearSlider = document.getElementById('yearSlider');
let sliderTimer;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const loadingScreen = document.getElementById('loading-screen');
const instructions = document.getElementById('instructions');

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load GLTF model
const loader = new GLTFLoader();

//Maps to store country data with each value
const countryYears = {};
const countryData = {};
const countryColors = {};

// Country map to map different names of countries to the same name
const countryMap = {
  "Hawaii": "United States",
  "Alaska": "United States",
  "Galapagos": "Ecuador",
  "South Georgia": "United Kingdom",
  "Svalbard": "Norway",
  "Heard Island": "Australia",
  "Kerguelen Islands": "France",
  "Andaman And Nicobar Islands": "India",
  "Kashmir": "India",
  "Czech Rep ": "Czechia"
};

//Load the GLTF model
loader.load(
  '/static/model/mapModel.glb',
  function (gltf) {
    const object = gltf.scene;
    scene.add(object);

    //Find the countries landmass object in the loaded model
    const countriesLandmass = object.getObjectByName('COUNTRIES__Landmass_');
    if (countriesLandmass) {

      countriesLandmass.traverse(child => {
        if (child.isMesh) {
          //Apply a new material or color to each child mesh (make green)
          child.material = new THREE.MeshBasicMaterial({ color: 0x006b3e });
        }
      });

      //Add event listener for mouse click on the renderer
      renderer.domElement.addEventListener('click', async (event) => {
        mouse.x = ((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
        mouse.y = -((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;

        //Raycast from the camera to the mouse position
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(countriesLandmass, true);

        //If the ray intersects with the object
        if (intersects.length > 0) {
          const clickedObject = intersects[0].object;
          let selectedCountry = clickedObject.parent.name; //Parent object is the country name
           
          // Replace underscores with spaces in the country name
          selectedCountry = selectedCountry.replace(/_/g, ' ');

          // Fix country name if in countryMap
          if (selectedCountry in countryMap) {
            selectedCountry = countryMap[selectedCountry];
          }

          //Make displays renewable energy value for 2024
          if (getCountryYear(selectedCountry) === undefined) {
            let country2024Data = await Fetch2024CountryData(selectedCountry);
            updateCountryData(selectedCountry, country2024Data);
            countryYears[selectedCountry] = 2024;
          }

          //Highlight the clicked country
          highlightCountry(clickedObject);

          //Check if country doesn't have changed version (color adjusted by slider), if not reset to selected color
          if (getCountryYear(selectedCountry) === 2024) {
            clickedObject.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
          }

          //If country has changed version, change color to changed version
          else {
            clickedObject.material.color = countryColors[selectedCountry];
          }       
          
          //Reset UI elements 
          resetUI(selectedCountry);

          //If the country is selected, display the slider
          if (selectedCountry) {
            displaySlider();

            // Get the year for the selected country
            let year = getCountryYear(selectedCountry);

            // Event listener for slider input
            yearSlider.addEventListener('input', async () => {

            // Clear previous timer if exists
            clearTimeout(sliderTimer); 

            // Parse the slider value to an integer
            year = parseInt(yearSlider.value); 

            // Update the displayed year on the slider
            updateSliderYear(year); 

            // Set a timer to fetch renewable data after a delay
              sliderTimer = setTimeout(async () => {
                  if (selectedCountry) {
                    updateCountryYear(selectedCountry, year);
              
                    // Use await inside an async function to fetch data
                    try {
                      let renewableData = await fetchRenewableData(selectedCountry, year);
                      updateCountryData(selectedCountry, renewableData, year);
                      changeCountryColor(clickedObject, selectedCountry);
                    } catch (error) {
                      console.error('Error fetching renewable data:', error);
                    }
                  }
                }, 200); // Delay in milliseconds before executing the function
              });
          }
      }
      });
    } else {
      console.warn('Empty object "COUNTRIES__Landmass_" not found in the loaded model');
    }
  },
  //Show progress of loading the model
  function (xhr) {
    if (xhr.loaded === xhr.total) {
      loadingScreen.style.display = 'none';
      instructions.style.display = 'block';
    }
  },
  function (error) {
    console.error('Error loading GLTF model:', error);
  }
);

//Resize the renderer when the window is resized
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//Function to change the color of a country based on renewable energy data amount
function changeCountryColor(clickedObject, selectedCountry) {
  // Get renewable energy data
  let renewableData = countryData[selectedCountry];

  clickedObject.traverse(child => {
    if (child.isMesh) {
      const MAX_RENEWABLE_VALUE = 67135.88;
      
      // Calculate color based on renewable energy data
      const colorScale = Math.min(renewableData / MAX_RENEWABLE_VALUE, 1); // Scale between 0 and 1
      
      // Calculate yellow component for direct transition to yellow
      const yellowComponent = Math.min(1.0, colorScale * 15); // Scale yellow up to 1.0 more quickly
      
      // Create a new color with RGB values (1.0, yellowComponent, 0)
      const newColor = new THREE.Color(1.0, yellowComponent, 0);
      // Apply the new color to the child mesh
      child.material.color = newColor;

      updateCountryColor(selectedCountry, newColor);
    }
  });
}

//Vars to keep track of highlighted country
let currentHighlightedCountry = null;
const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });

function highlightCountry(clickedObject) {
  if (currentHighlightedCountry !== clickedObject) {
    // Reset material of previously highlighted country
    if (currentHighlightedCountry) {
      currentHighlightedCountry.material = new THREE.MeshBasicMaterial({ color: 0x006b3e });
    }

    // Apply highlight material to the clicked country
    clickedObject.material = highlightMaterial;
    currentHighlightedCountry = clickedObject;
  }
}

// Function to update the year for a specific country
function updateCountryYear(countryName, newYear) {
  countryYears[countryName] = newYear;
}

function updateCountryColor(countryName, newColor) {
  countryColors[countryName] = newColor;
}

// Function to get the year for a specific country (defaults to current year if not set)
function getCountryYear(countryName) {
  return countryYears[countryName];
}

function resetUI(countryName) {
  if (countryName in countryData) {
    energy = countryData[countryName];
    renewableEnergyValue.textContent = energy + ' TWh';
  }
  else {
     renewableEnergyValue.textContent = energy + ' TWh';
  }
  
  let year = new Date().getFullYear(); // Default to current year if year is not set

  if (countryName in countryYears) {
    year = countryYears[countryName];
    yearSlider.value = year;
    document.getElementById('yearValue').textContent = year;
  }
  else {
    yearSlider.value = year;
     document.getElementById('yearValue').textContent = year;
  }
}

// Function to update the renewable energy data for a specific country
function updateCountryData(countryName, renewableData) {
  renewableEnergyValue.textContent = renewableData + ' TWh';
  countryData[countryName] = renewableData;
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

/////// Set up the scene ///////

// Set up lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Soft white ambient light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3); // White directional light
directionalLight.position.set(0, 1, 0); // Position the light directly above the scene
scene.add(directionalLight);

// Set camera position for top-down view
camera.position.set(0, 3, 0); // Place the camera above the scene looking down
camera.lookAt(scene.position); // Point the camera at the center of the scene

//Navigation
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true; // Allow zooming with mouse wheel
controls.enablePan = true; // Allow panning with mouse drag

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Update controls
  renderer.render(scene, camera); // Render the scene
}

animate(); // Start animation loop
