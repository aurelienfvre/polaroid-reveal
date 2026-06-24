"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { PolaroidCameraModel } from "@/features/reveal/data/polaroidCameraModels";

type CameraSceneState = {
  isEjecting: boolean;
  isPassive: boolean;
};

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
    const ejectedPhoto = createEjectedPhoto();
    let frameId = 0;
    let ejectionStartedAt: number | null = null;
    let isDisposed = false;

    camera.position.set(0, 0.05, 7.1);
    root.add(ejectedPhoto);
    scene.add(root);
    addLights(scene);

    new GLTFLoader().load(model.src, (gltf) => {
      if (isDisposed) {
        return;
      }

      normalizeModel(gltf.scene, model);
      root.add(gltf.scene);
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
      animateRoot(root, currentState);
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

function createEjectedPhoto() {
  const group = new THREE.Group();
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 0.94),
    new THREE.MeshStandardMaterial({
      color: 0xfffdf7,
      depthTest: false,
      depthWrite: false,
      metalness: 0,
      roughness: 0.92,
    }),
  );
  const image = new THREE.Mesh(
    new THREE.PlaneGeometry(0.58, 0.58),
    new THREE.MeshStandardMaterial({
      color: 0x0b0a0a,
      depthTest: false,
      depthWrite: false,
      metalness: 0,
      roughness: 0.86,
    }),
  );

  paper.position.set(0, -0.47, 0);
  image.position.set(0, -0.36, 0.012);
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
    photo.visible = false;
    return null;
  }

  const now = performance.now();
  const started = startedAt ?? now;
  const rawProgress = THREE.MathUtils.clamp((now - started) / 1900, 0, 1);
  const progress = rawProgress < 0.5
    ? 4 * rawProgress ** 3
    : 1 - (-2 * rawProgress + 2) ** 3 / 2;
  const revealScale = THREE.MathUtils.lerp(0.08, 0.74, progress);

  photo.visible = true;
  photo.position.set(
    model.eject3d.x,
    THREE.MathUtils.lerp(model.eject3d.startY, model.eject3d.endY, progress),
    model.eject3d.z,
  );
  photo.rotation.set(0, 0, model.eject3d.rotateZ);
  photo.scale.set(1, revealScale, 1);

  return started;
}

function animateRoot(root: THREE.Group, state: CameraSceneState) {
  const time = performance.now() * 0.001;
  const idleY = Math.sin(time * 1.2) * 0.018;
  const ejectKick = state.isEjecting ? -0.018 : 0;
  const passiveTilt = state.isPassive ? 0.006 : 0;

  root.position.y += (idleY + ejectKick - root.position.y) * 0.08;
  root.rotation.x += (passiveTilt - root.rotation.x) * 0.07;
  root.rotation.y += (0 - root.rotation.y) * 0.07;
  root.rotation.z += (ejectKick * 0.2 - root.rotation.z) * 0.07;
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
