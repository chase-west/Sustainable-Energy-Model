import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { fetchRenewableData } from "./app.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load GLTF model
const loader = new GLTFLoader();

// Define an object to map country names to their respective year values
const countryYears = {};

// Function to update the year for a specific country
function updateCountryYear(countryName, newYear) {
  countryYears[countryName] = newYear;
}

// Function to get the year for a specific country (defaults to current year if not set)
function getCountryYear(countryName) {
  return countryYears[countryName];
}

function resetSlider(countryName) {
  const slider = document.getElementById('yearSlider');
  let year = new Date().getFullYear(); // Default to current year if year is not set

  if (countryName in countryYears) {
    year = countryYears[countryName];
    console.log('Year:', year);
    slider.value = year;
    document.getElementById('yearValue').textContent = year;
  }
  else {
     slider.value = year;
     document.getElementById('yearValue').textContent = year;
  }
}

// Function to update the slider value based on the selected year
function updateSliderYear(newYear) {
  document.getElementById('yearValue').textContent = newYear; // Update the slider value
}

function displaySlider() {
  const sliderContainers = document.getElementsByClassName('sliderContainer');
  Array.from(sliderContainers).forEach(container => {
    container.style.display = 'block';
  });
}

const yearSlider = document.getElementById('yearSlider');
let sliderTimer;
const countryMap = {
  "Hawaii": "United States",
  "Alaska": "United States",
  "Galapagos": "Ecuador",
  "South Georgia": "United Kingdom",
  "Svalbard": "Norway",
  "Heard Island": "Australia",
  "Kerguelen Islands": "France",
  "Andaman And Nicobar Islands": "India"
};

loader.load(
  '/static/model/mapModel.glb',
  function (gltf) {
    const object = gltf.scene;
    scene.add(object);

    const countriesLandmass = object.getObjectByName('COUNTRIES__Landmass_');

    if (countriesLandmass) {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      renderer.domElement.addEventListener('click', (event) => {
        mouse.x = ((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
        mouse.y = -((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(countriesLandmass, true);

        if (intersects.length > 0) {
          const clickedObject = intersects[0].object;
          let selectedCountry = clickedObject.parent.name;

          selectedCountry = selectedCountry.replace(/_/g, ' ');
          
          if (selectedCountry in countryMap) {
            selectedCountry = countryMap[selectedCountry];
          }

          resetSlider(selectedCountry);

          if (selectedCountry) {
            displaySlider();
            let year = getCountryYear(selectedCountry); // Get the year for the selected country

            // Event listener for slider input
            yearSlider.addEventListener('input', async () => {

            clearTimeout(sliderTimer); // Clear previous timer if exists

            year = parseInt(yearSlider.value); // Parse the slider value to an integer

            updateSliderYear(year); // Update the displayed year on the slider

              sliderTimer = setTimeout(async () => {
                  if (selectedCountry) {
                    updateCountryYear(selectedCountry, year); // Update the year for the selected country
                    console.log(`Clicked on parent object: ${selectedCountry}`);
              
                    // Use await inside an async function to fetch data
                    try {
                      const renewableData = await fetchRenewableData(selectedCountry, year);
                      console.log('Renewable Data:', renewableData);
                    } catch (error) {
                      console.error('Error fetching renewable data:', error);
                    }
                  }
                }, 300); // Delay in milliseconds before executing the function
              });
          }
        }
      });
    } else {
      console.warn('Empty object "COUNTRIES__Landmass_" not found in the loaded model');
    }
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    console.error('Error loading GLTF model:', error);
  }
);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Set up lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Soft white ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3); // White directional light
directionalLight.position.set(0, 1, 0); // Position the light directly above the scene
scene.add(directionalLight);

// Set camera position for top-down view
camera.position.set(0, 3, 0); // Place the camera above the scene looking down
camera.lookAt(scene.position); // Point the camera at the center of the scene

//navigation
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
