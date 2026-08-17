import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('viewer-container');
const loadingEl = document.getElementById('viewer-loading');
const hintsEl = document.getElementById('viewer-hints');
if (!container) throw new Error('Viewer container not found');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(4, 3, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x22c55e, 0.8);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0x22c55e, 2.5);
dirLight1.position.set(5, 5, 5);
dirLight1.castShadow = true;
dirLight1.shadow.mapSize.width = 1024;
dirLight1.shadow.mapSize.height = 1024;
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0x22c55e, 1.2);
dirLight2.position.set(-3, 3, -3);
scene.add(dirLight2);

const pointLight = new THREE.PointLight(0x10b981, 1.0);
pointLight.position.set(0, 3, 0);
scene.add(pointLight);

// Ground shadow
const shadowGeometry = new THREE.PlaneGeometry(8, 8);
const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
const shadowPlane = new THREE.Mesh(shadowGeometry, shadowMaterial);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = -0.5;
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = 2;
controls.maxDistance = 12;
controls.maxPolarAngle = Math.PI / 2.2;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, -0.2, 0);

// Load model
const loader = new OBJLoader();
loader.load(
  '/Hexaboard_v3_Display.obj',
  (obj) => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#6b7db8',
          metalness: 0.7,
          roughness: 0.25,
          envMapIntensity: 0.5,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    obj.scale.setScalar(0.12);
    obj.rotation.set(-Math.PI / 2, 0, 0);
    obj.position.set(0, -0.2, 0);
    scene.add(obj);

    if (loadingEl) loadingEl.style.display = 'none';
    if (hintsEl) hintsEl.style.display = 'flex';
  },
  undefined,
  (error) => {
    console.error('Error loading OBJ:', error);
    if (loadingEl) {
      loadingEl.innerHTML = '<p class="text-red-400 text-sm">Failed to load 3D model</p>';
    }
  }
);

// Resize handler
function onResize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
