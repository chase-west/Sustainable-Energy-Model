import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader();

let object;

loader.load(
  `/static/model/low_poly_earth.glb`,
  function (gltf) {
    object = gltf.scene;

    object.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material.name === "earth") {
        //change material color to green
        child.material.color.set(0x00ff00); //green color
      }
    });
    object.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material.name === "water") {
        //change water material color to blue
        child.material.color.set(0x0000A5); //blue color
      }
    });

    scene.add(object);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    console.error(error);
  }
);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Set up lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 3;

let initialAnimationComplete = false;

function animate() {
  requestAnimationFrame(animate);
  // Update directional light position and target to match the camera's position and look at the center of the scene
  directionalLight.position.copy(camera.position);
  directionalLight.target.position.set(0, 0, 0);
  directionalLight.target.updateMatrixWorld();
  renderer.render(scene, camera);
}
animate();
