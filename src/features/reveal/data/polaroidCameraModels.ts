export type PolaroidCameraModel = {
  eject3d: {
    /** Z offset of the photo plane in front of the camera body. */
    z: number;
    /** Final z-rotation (radians) the developed photo settles into. */
    rotateZ: number;
    /** Per-model scale for the 3D print as it leaves unusually sized slots. */
    printScale?: number;
    /** X position of the print slot, in normalized scene units. */
    slotX: number;
    /**
     * Y position of the slot mouth (the photo's top edge). The print is
     * top-anchored here and grows downward as it is pushed out, so this is the
     * single value to tune per model to line the print up with the real slot.
     */
    slotY: number;
  };
  id: string;
  label: string;
  photoExit: {
    rotate: number;
    x: string;
    y: string;
  };
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  src: string;
  targetSize: number;
};

const CAMERA_MODEL_DRAW_WEIGHTS: Record<string, number> = {
  "polaroid-636": 3,
  "i-2": 3,
  supercolor: 3,
  luc: 7,
  manu: 7,
  remi: 7,
};

export const POLAROID_CAMERA_MODELS: PolaroidCameraModel[] = [
  defineCameraModel(
    "polaroid-636",
    "Polaroid 636",
    "/models/polaroid-636.glb",
    2.64,
    [0, -0.03, 0],
    {
      z: 0.66,
      rotateZ: -0.05,
      slotX: 0.02,
      slotY: -1.14,
    },
    { rotate: -2.8, x: "0.4rem", y: "6vh" },
  ),
  defineCameraModel(
    "i-2",
    "Polaroid I-2",
    "/models/i-2.glb",
    2.5,
    [0, -0.04, 0],
    {
      z: 0.64,
      rotateZ: -0.04,
      slotX: -0.04,
      slotY: -0.60,
    },
    { rotate: -2.4, x: "-0.2rem", y: "6vh" },
  ),
  defineCameraModel(
    "supercolor",
    "Polaroid Supercolor",
    "/models/supercolor.glb",
    2.5,
    [0, -0.1, 0],
    {
      z: 0.66,
      rotateZ: -0.045,
      slotX: 0.01,
      slotY: -1.1,
    },
  ),
  defineCameraModel("luc", "Luc", "/models/luc.glb", 2.54, [0, -0.08, 0], {
    z: 0.8,
    rotateZ: -0.01,
    printScale: 0.6,
    slotX: 0.02,
    slotY: -0.82,
  }),
  defineCameraModel("manu", "Manu", "/models/manu.glb", 2.54, [0, -0.08, 0], {
    z: 0.78,
    rotateZ: -0.03,
    printScale: 0.5,
    slotX: 0.03,
    slotY: -0.45,
  }),
  defineCameraModel("remi", "Rémi", "/models/remi.glb", 2.54, [0, -0.08, 0], {
    z: 0.78,
    rotateZ: -0.03,
    printScale: 0.7,
    slotX: 0.01,
    slotY: -0.62,
  }),
];

export function getRandomPolaroidCameraModel() {
  const totalWeight = POLAROID_CAMERA_MODELS.reduce(
    (total, model) => total + getCameraModelDrawWeight(model),
    0,
  );
  let cursor = Math.random() * totalWeight;

  for (const model of POLAROID_CAMERA_MODELS) {
    cursor -= getCameraModelDrawWeight(model);

    if (cursor <= 0) {
      return model;
    }
  }

  return POLAROID_CAMERA_MODELS[0];
}

function getCameraModelDrawWeight(model: PolaroidCameraModel) {
  return CAMERA_MODEL_DRAW_WEIGHTS[model.id] ?? 1;
}

function defineCameraModel(
  id: string,
  label: string,
  src: string,
  targetSize: number,
  position: PolaroidCameraModel["position"],
  eject3d: PolaroidCameraModel["eject3d"],
  photoExit: PolaroidCameraModel["photoExit"] = {
    rotate: -2.6,
    x: "0.2rem",
    y: "6vh",
  },
): PolaroidCameraModel {
  return {
    eject3d,
    id,
    label,
    photoExit,
    position,
    rotation: [0, 0, 0],
    src,
    targetSize,
  };
}
