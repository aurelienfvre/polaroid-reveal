import * as THREE from "three";
import type { PolaroidCameraModel } from "@/features/reveal/data/polaroidCameraModels";

type PressMesh = {
  basePositions: Float32Array;
  max: THREE.Vector3;
  min: THREE.Vector3;
  position: THREE.BufferAttribute;
};

export type CameraModelPressRig = {
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
  baseScale: THREE.Vector3;
  lastAppliedAmount: number;
  meshes: PressMesh[];
  renderedAmount: number;
  root: THREE.Object3D;
};

const EXPRESSIVE_CAMERA_MODELS = new Set(["luc", "manu", "remi"]);
const PRESS_DURATION = 420;

export function createCameraModelPressRig(
  root: THREE.Object3D,
  model: PolaroidCameraModel,
): CameraModelPressRig | null {
  if (!EXPRESSIVE_CAMERA_MODELS.has(model.id)) {
    return null;
  }

  return {
    basePosition: root.position.clone(),
    baseRotation: root.rotation.clone(),
    baseScale: root.scale.clone(),
    lastAppliedAmount: 0,
    meshes: collectPressMeshes(root),
    renderedAmount: 0,
    root,
  };
}

export function animateCameraModelPress(
  rig: CameraModelPressRig | null,
  isPressing: boolean,
  startedAt: number | null,
) {
  if (!rig) {
    return;
  }

  const targetAmount = isPressing && startedAt ? getPressAmount(startedAt) : 0;

  rig.renderedAmount += (targetAmount - rig.renderedAmount) * 0.48;
  if (targetAmount === 0 && rig.renderedAmount < 0.001) {
    rig.renderedAmount = 0;
  }

  if (Math.abs(rig.renderedAmount - rig.lastAppliedAmount) < 0.001) {
    return;
  }

  applyRootPress(rig, rig.renderedAmount);
  applyMeshPress(rig, rig.renderedAmount);
  rig.lastAppliedAmount = rig.renderedAmount;
}

function collectPressMeshes(root: THREE.Object3D) {
  const meshes: PressMesh[] = [];

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const geometry = child.geometry;
    const position = geometry.getAttribute("position");

    if (!(position instanceof THREE.BufferAttribute)) {
      return;
    }

    geometry.computeBoundingBox();

    if (!geometry.boundingBox) {
      return;
    }

    meshes.push({
      basePositions: new Float32Array(position.array),
      max: geometry.boundingBox.max.clone(),
      min: geometry.boundingBox.min.clone(),
      position,
    });
  });

  return meshes;
}

function getPressAmount(startedAt: number) {
  const elapsed = performance.now() - startedAt;
  const progress = THREE.MathUtils.clamp(elapsed / PRESS_DURATION, 0, 1);
  const press = 1 - smoothStep(THREE.MathUtils.clamp((progress - 0.02) / 0.48, 0, 1));
  const pulse = Math.sin(progress * Math.PI * 9) * (1 - progress) * 0.12;

  return THREE.MathUtils.clamp(press + pulse, 0, 1);
}

function applyRootPress(rig: CameraModelPressRig, amount: number) {
  const wobble = Math.sin(performance.now() * 0.018) * amount * 0.018;

  rig.root.scale.set(
    rig.baseScale.x * (1 + amount * 0.34),
    rig.baseScale.y * (1 - amount * 0.46),
    rig.baseScale.z * (1 + amount * 0.2),
  );
  rig.root.position.set(
    rig.basePosition.x,
    rig.basePosition.y - amount * 0.34,
    rig.basePosition.z + amount * 0.12,
  );
  rig.root.rotation.set(
    rig.baseRotation.x + amount * 0.28,
    rig.baseRotation.y,
    rig.baseRotation.z + wobble * 1.7,
  );
}

function applyMeshPress(rig: CameraModelPressRig, amount: number) {
  rig.meshes.forEach((mesh) => {
    const array = mesh.position.array;
    const width = Math.max(mesh.max.x - mesh.min.x, 0.0001);
    const height = Math.max(mesh.max.y - mesh.min.y, 0.0001);
    const depth = Math.max(mesh.max.z - mesh.min.z, 0.0001);

    for (let index = 0; index < mesh.basePositions.length; index += 3) {
      const baseX = mesh.basePositions[index];
      const baseY = mesh.basePositions[index + 1];
      const baseZ = mesh.basePositions[index + 2];
      const xNorm = ((baseX - mesh.min.x) / width) * 2 - 1;
      const yNorm = ((baseY - mesh.min.y) / height) * 2 - 1;
      const zNorm = ((baseZ - mesh.min.z) / depth) * 2 - 1;
      const upper = smoothRange(yNorm, 0.15, 1);
      const side = smoothRange(Math.abs(xNorm), 0.42, 1);
      const front = smoothRange(zNorm, 0.18, 1);
      const earSpread = upper * side;
      const facePop = front * smoothRange(yNorm, -0.25, 0.75);

      array[index] = baseX + Math.sign(xNorm) * earSpread * amount * width * 0.27;
      array[index + 1] = baseY - upper * amount * height * 0.18;
      array[index + 2] = baseZ + facePop * amount * depth * 0.17;
    }

    mesh.position.needsUpdate = true;
  });
}

function smoothRange(value: number, min: number, max: number) {
  const progress = THREE.MathUtils.clamp((value - min) / (max - min), 0, 1);

  return smoothStep(progress);
}

function smoothStep(value: number) {
  return value * value * (3 - 2 * value);
}
