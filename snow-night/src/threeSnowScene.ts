import * as THREE from "three";
import { gsap } from "gsap";
import { assets } from "./assets";

type SceneHandle = {
  destroy: () => void;
};

const makeSnowLayer = (
  count: number,
  spreadX: number,
  spreadY: number,
  depth: number,
  texture: THREE.Texture,
  size: number,
  opacity: number,
) => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const drifts = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * spreadX;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
    positions[i * 3 + 2] = -Math.random() * depth;
    speeds[i] = 0.22 + Math.random() * 0.9;
    drifts[i] = -0.18 + Math.random() * 0.12;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("speed", new THREE.BufferAttribute(speeds, 1));
  geometry.setAttribute("drift", new THREE.BufferAttribute(drifts, 1));

  const material = new THREE.PointsMaterial({
    map: texture,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: new THREE.Color("#dbe8ff"),
  });

  const points = new THREE.Points(geometry, material);
  return { points, positions, speeds, drifts, spreadX, spreadY };
};

export const createSnowNightScene = (mount: HTMLDivElement): SceneHandle => {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#071331", 0.08);

  const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 120);
  camera.position.set(0, 0, 11);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const loader = new THREE.TextureLoader();
  const snowTexture = loader.load(assets.snowParticles);
  const glowTexture = loader.load(assets.glowFog);

  const farSnow = makeSnowLayer(520, 20, 12, 28, snowTexture, 0.08, 0.38);
  const midSnow = makeSnowLayer(340, 18, 10, 18, snowTexture, 0.13, 0.56);
  const nearSnow = makeSnowLayer(120, 15, 8, 10, snowTexture, 0.24, 0.78);
  scene.add(farSnow.points, midSnow.points, nearSnow.points);

  const fogMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: "#9cbaff",
  });
  const fogA = new THREE.Sprite(fogMaterial.clone());
  fogA.position.set(-2.2, -1.6, -6);
  fogA.scale.set(8, 2.2, 1);
  const fogB = new THREE.Sprite(fogMaterial.clone());
  fogB.position.set(2.6, -0.9, -9);
  fogB.scale.set(6.5, 1.6, 1);
  scene.add(fogA, fogB);

  const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: "#d9ecff",
  });
  const lampGlow = new THREE.Sprite(glowMaterial);
  lampGlow.position.set(2.25, 2.15, -4);
  lampGlow.scale.set(2.4, 2.4, 1);
  scene.add(lampGlow);

  const cameraTween = gsap.to(camera.position, {
    z: 9.7,
    duration: 28,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });
  const fogTween = gsap.to([fogA.material, fogB.material], {
    opacity: 0.28,
    duration: 7,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });

  let disposed = false;
  let previousTime = performance.now();
  let elapsedTime = 0;

  const resize = () => {
    const { width, height } = mount.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
  };

  const updateLayer = (layer: ReturnType<typeof makeSnowLayer>, delta: number, depthPush: number) => {
    const attr = layer.points.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < layer.speeds.length; i += 1) {
        layer.positions[i * 3] += layer.drifts[i] * delta + Math.sin(elapsedTime * 0.7 + i) * 0.002;
      layer.positions[i * 3 + 1] -= layer.speeds[i] * delta;
      layer.positions[i * 3 + 2] += depthPush * delta;

      if (layer.positions[i * 3 + 1] < -layer.spreadY / 2) {
        layer.positions[i * 3 + 1] = layer.spreadY / 2;
        layer.positions[i * 3] = (Math.random() - 0.5) * layer.spreadX;
      }
      if (layer.positions[i * 3] < -layer.spreadX / 2) layer.positions[i * 3] = layer.spreadX / 2;
      if (layer.positions[i * 3] > layer.spreadX / 2) layer.positions[i * 3] = -layer.spreadX / 2;
    }
    attr.needsUpdate = true;
  };

  const render = () => {
    if (disposed) return;
    const now = performance.now();
    const delta = Math.min((now - previousTime) / 1000, 0.04);
    previousTime = now;
    elapsedTime += delta;
    updateLayer(farSnow, delta, 0.035);
    updateLayer(midSnow, delta, 0.055);
    updateLayer(nearSnow, delta, 0.08);
    fogA.position.x = -2.2 + Math.sin(elapsedTime * 0.14) * 0.22;
    fogB.position.x = 2.6 + Math.cos(elapsedTime * 0.12) * 0.3;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };

  window.addEventListener("resize", resize);
  resize();
  render();

  return {
    destroy: () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      cameraTween.kill();
      fogTween.kill();
      renderer.dispose();
      snowTexture.dispose();
      glowTexture.dispose();
      farSnow.points.geometry.dispose();
      midSnow.points.geometry.dispose();
      nearSnow.points.geometry.dispose();
      mount.removeChild(renderer.domElement);
    },
  };
};
