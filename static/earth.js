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

loader.load(
  '/static/model/mapModel.glb',
  function (gltf) {
    const object = gltf.scene;
    scene.add(object);

    // Assuming "COUNTRIES__Landmass_" is a child object within the loaded model
    const countriesLandmass = object.getObjectByName('COUNTRIES__Landmass_');

    if (countriesLandmass) {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      renderer.domElement.addEventListener('click', async (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        raycaster.setFromCamera(mouse, camera);
    
        const intersects = raycaster.intersectObject(countriesLandmass, true);
    
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            const parentObject = clickedObject.parent;
    
            if (parentObject) {
                let year = 2024;
                // Check if the parent object's name matches 'USA'
                if (parentObject.name === 'USA') {
                    // Perform custom handling for 'USA'
                    const customCountryName = 'United States'; // Rename for further operations
                    console.log(`Clicked on parent object: ${customCountryName}`);
                    // Fetch renewable data for the renamed country
                    try {
                        const renewableData = await fetchRenewableData(customCountryName, year);
                        console.log('Renewable Data:', renewableData);
                    } catch (error) {
                        console.error('Error fetching renewable data:', error);
                    }
                } else {
                    console.log(`Clicked on parent object: ${parentObject.name}`);
                    const renewableData = await fetchRenewableData(parentObject.name, year);
                    console.log('Renewable Data:', renewableData);
                }
            }
        }
    });} else {
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

// Orbit controls for easy navigation
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
