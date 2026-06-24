"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { PolaroidCameraModel } from "@/features/reveal/data/polaroidCameraModels";

type CameraSceneState = {
  isEjecting: boolean;
  isPassive: boolean;
};

/** Total time (ms) for the print to slide fully out of the slot. */
const EJECT_DURATION = 2600;
/** Print dimensions in scene units — sized to stay fully in the base frame. */
const PHOTO_WIDTH = 0.98;
const PHOTO_HEIGHT = 1.16;
/** Camera scale once it recedes to make room for the developed print. */
const RECEDE_SCALE = 0.88;
/** How far the camera lifts up as it recedes (scene units). */
const RECEDE_LIFT = 0.14;

export function usePolaroidCameraScene(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  model: PolaroidCameraModel,
  state: CameraSceneState,
) {
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    const renderer = createRenderer(canvasRef.current);
    const root = new THREE.Group();
    const cameraGroup = new THREE.Group();
    // Mask the print at the slot mouth so only the part that has actually been
    // pushed out is visible — the rest reads as still inside the camera. This is
    // what makes the print look like it slides out, not a crop of the photo.
    const slotMask = new THREE.Plane(new THREE.Vector3(0, -1, 0), model.eject3d.slotY);
    const ejectedPhoto = createEjectedPhoto(slotMask);
    let frameId = 0;
    let ejectionStartedAt: number | null = null;
    let isDisposed = false;

    camera.position.set(0, -0.35, 9.0);
    root.add(cameraGroup, ejectedPhoto);
    scene.add(root);
    addLights(scene);

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(model.src, (gltf) => {
      if (isDisposed) {
        return;
      }

      normalizeModel(gltf.scene, model);
      // Start hidden and let the render loop fade the model in, so it appears
      // gracefully once decoded instead of popping in after the download.
      prepareFadeIn(gltf.scene);
      cameraGroup.add(gltf.scene);
    });

    const observer = new ResizeObserver(() => resizeRenderer(renderer, camera));
    observer.observe(canvasRef.current);
    resizeRenderer(renderer, camera);

    const render = () => {
      const currentState = stateRef.current;

      ejectionStartedAt = animateEjectedPhoto({
        model,
        photo: ejectedPhoto,
        startedAt: ejectionStartedAt,
        state: currentState,
      });
      animateCamera(cameraGroup, currentState);
      animateViewCamera(camera, currentState);
      fadeInModel(cameraGroup);
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      disposeModel(root);
      renderer.dispose();
    };
  }, [canvasRef, model]);
}

function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas,
    powerPreference: "high-performance",
  });

  renderer.localClippingEnabled = true;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  return renderer;
}

function addLights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0xfff8ea, 0x171114, 2.6));

  const keyLight = new THREE.DirectionalLight(0xfff2d2, 3.8);
  keyLight.position.set(-2.5, 3.2, 4.8);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x9fe8ff, 1.2);
  rimLight.position.set(3.8, 1.8, 2.5);
  scene.add(rimLight);
}

function resizeRenderer(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth || 1;
  const height = canvas.clientHeight || 1;

  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function normalizeModel(object: THREE.Object3D, model: PolaroidCameraModel) {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();

  box.getCenter(center);
  box.getSize(size);
  object.position.sub(center);
  object.scale.setScalar(model.targetSize / Math.max(size.x, size.y, size.z));
  object.rotation.set(...model.rotation);
  object.position.add(new THREE.Vector3(...model.position));
}

/**
 * Builds the ejected print as a full-size, centred group. The inner image is
 * offset toward the top so the print keeps the classic Polaroid wide bottom
 * border. Both surfaces are masked at the slot so the part still inside the
 * camera stays hidden while the print is fed out.
 */
function createEjectedPhoto(slotMask: THREE.Plane) {
  const group = new THREE.Group();
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(PHOTO_WIDTH, PHOTO_HEIGHT),
    new THREE.MeshStandardMaterial({
      clippingPlanes: [slotMask],
      color: 0xfffdf7,
      depthTest: false,
      depthWrite: false,
      metalness: 0,
      roughness: 0.92,
      transparent: true,
    }),
  );
  const imageSize = PHOTO_WIDTH - 0.28;
  const image = new THREE.Mesh(
    new THREE.PlaneGeometry(imageSize, imageSize),
    new THREE.MeshStandardMaterial({
      clippingPlanes: [slotMask],
      color: 0x0b0a0a,
      depthTest: false,
      depthWrite: false,
      metalness: 0,
      roughness: 0.86,
      transparent: true,
    }),
  );

  // Push the image up so the wide developing border sits along the bottom.
  image.position.set(0, PHOTO_HEIGHT / 2 - imageSize / 2 - 0.14, 0.012);
  paper.renderOrder = 30;
  image.renderOrder = 31;
  group.renderOrder = 30;
  group.add(paper, image);
  group.visible = false;

  return group;
}

function animateEjectedPhoto({
  model,
  photo,
  startedAt,
  state,
}: {
  model: PolaroidCameraModel;
  photo: THREE.Group;
  startedAt: number | null;
  state: CameraSceneState;
}) {
  if (!state.isEjecting) {
    // Crossfade out once it has handed off to the developed DOM card.
    if (photo.visible) {
      const opacity = fadePhoto(photo, -0.12);
      if (opacity <= 0.01) {
        photo.visible = false;
      }
    }
    return null;
  }

  const now = performance.now();
  const started = startedAt ?? now;
  const rawProgress = THREE.MathUtils.clamp((now - started) / EJECT_DURATION, 0, 1);
  // Steady motor feed: a gentle ease-in/out so it starts and ends softly but
  // pushes out at a believable, unhurried pace in between.
  const progress = smoothStep(rawProgress);
  // The print is fed straight down through the slot. It starts fully tucked
  // inside (entirely above the slot mask, so nothing shows) and travels down by
  // its whole height plus a little, so you watch it emerge edge-first and hang.
  const slotY = model.eject3d.slotY;
  const hiddenCenterY = slotY + PHOTO_HEIGHT / 2;
  const outCenterY = slotY - PHOTO_HEIGHT / 2 - 0.12;
  const centerY = THREE.MathUtils.lerp(hiddenCenterY, outCenterY, progress);
  // A subtle settle wobble as the motor pushes it out, fading as it finishes.
  const wobble = Math.sin(rawProgress * Math.PI * 2.4) * (1 - rawProgress) * 0.015;

  setPhotoOpacity(photo, 1);
  photo.visible = true;
  photo.position.set(model.eject3d.slotX, centerY, model.eject3d.z);
  photo.rotation.set(0, 0, model.eject3d.rotateZ * progress + wobble);

  return started;
}

function smoothStep(value: number) {
  return value * value * (3 - 2 * value);
}

function fadePhoto(photo: THREE.Group, delta: number) {
  let opacity = 1;
  photo.traverse((child) => {
    if (child instanceof THREE.Mesh && !Array.isArray(child.material)) {
      opacity = THREE.MathUtils.clamp(child.material.opacity + delta, 0, 1);
      child.material.opacity = opacity;
    }
  });

  return opacity;
}

function setPhotoOpacity(photo: THREE.Group, value: number) {
  photo.traverse((child) => {
    if (child instanceof THREE.Mesh && !Array.isArray(child.material)) {
      child.material.opacity = value;
    }
  });
}

/**
 * Idle bob on the camera, plus a smooth recede (scale down + lean back) once
 * the print has been ejected and the experience moves into the develop phase,
 * so the camera steps back and lets the developed print take the foreground.
 */
function animateCamera(cameraGroup: THREE.Group, state: CameraSceneState) {
  const time = performance.now() * 0.001;
  const targetScale = state.isPassive ? RECEDE_SCALE : 1;
  const idleY = Math.sin(time * 1.2) * 0.018;
  const ejectKick = state.isEjecting ? -0.018 : 0;
  const recedeLift = state.isPassive ? RECEDE_LIFT : 0;
  const recedePush = state.isPassive ? -0.2 : 0;
  const passiveTilt = state.isPassive ? 0.05 : 0;

  cameraGroup.scale.x += (targetScale - cameraGroup.scale.x) * 0.08;
  cameraGroup.scale.y = cameraGroup.scale.x;
  cameraGroup.scale.z = cameraGroup.scale.x;
  cameraGroup.position.y += (idleY + ejectKick + recedeLift - cameraGroup.position.y) * 0.08;
  cameraGroup.position.z += (recedePush - cameraGroup.position.z) * 0.08;
  cameraGroup.rotation.x += (passiveTilt - cameraGroup.rotation.x) * 0.07;
  cameraGroup.rotation.z += (ejectKick * 0.2 - cameraGroup.rotation.z) * 0.07;
}

/** Half-extents (scene units) the framing must always keep in view. */
const FIT_HALF_WIDTH = 1.35;
const FIT_HALF_HEIGHT = 2.4;

/**
 * Frames the whole shot, adapting the view distance to the canvas aspect so the
 * camera never gets cropped horizontally (portrait/tall canvases) and the whole
 * print always fits vertically. The base/eject framing keeps the camera roughly
 * centred with room below; only once the print has developed (the passive
 * phase) does the view pull back and drop to let the developed card take over.
 */
function animateViewCamera(camera: THREE.PerspectiveCamera, state: CameraSceneState) {
  const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  const fitZ = Math.max(
    FIT_HALF_WIDTH / (tan * Math.max(camera.aspect, 0.0001)),
    FIT_HALF_HEIGHT / tan,
  );
  // On develop, lift the camera up (more negative Y pushes it higher in frame)
  // and pull back (×1.4) so it shrinks into the top, leaving the lower screen
  // for the developed card.
  const targetY = state.isPassive ? -2.1 : -0.35;
  const targetZ = state.isPassive ? fitZ * 1.4 : fitZ;

  camera.position.y += (targetY - camera.position.y) * 0.06;
  camera.position.z += (targetZ - camera.position.z) * 0.06;
}

function prepareFadeIn(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0;
    });
  });
}

function fadeInModel(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (material.opacity < 1) {
        material.opacity = Math.min(material.opacity + 0.05, 1);
      }
    });
  });
}

function disposeModel(object: THREE.Object3D | null) {
  object?.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    child.geometry.dispose();
    disposeMaterial(child.material);
  });
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  const materials = Array.isArray(material) ? material : [material];

  materials.forEach((item) => {
    Object.values(item).forEach((value) => {
      if (value instanceof THREE.Texture) {
        value.dispose();
      }
    });
    item.dispose();
  });
}
