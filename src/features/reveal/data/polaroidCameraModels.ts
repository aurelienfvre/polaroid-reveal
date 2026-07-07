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

export const POLAROID_CAMERA_MODELS: PolaroidCameraModel[] = [
  defineCameraModel("polaroid-636", "Polaroid 636", "/models/polaroid-636.glb", 2.64, [0, -0.03, 0], {
    z: 0.66, rotateZ: -0.05, slotX: 0.02, slotY: -1.14,
  }, { rotate: -2.8, x: "0.4rem", y: "6vh" }),
  defineCameraModel("i-2", "Polaroid I-2", "/models/i-2.glb", 2.5, [0, -0.04, 0], {
    z: 0.64, rotateZ: -0.04, slotX: -0.04, slotY: -0.92,
  }, { rotate: -2.4, x: "-0.2rem", y: "6vh" }),
  defineCameraModel("supercolor", "Polaroid Supercolor", "/models/supercolor.glb", 2.5, [0, -0.1, 0], {
    z: 0.66, rotateZ: -0.045, slotX: 0.01, slotY: -1.1,
  }),
  defineCameraModel(
    "luc",
    "Luc",
    "/models/luc.glb",
    2.54,
    [0, -0.08, 0],
    { z: 0.8, rotateZ: -0.03, printScale: 0.72, slotX: 0.05, slotY: -0.62 },
  ),
  defineCameraModel(
    "manu",
    "Manu",
    "/models/manu.glb",
    2.54,
    [0, -0.08, 0],
    { z: 0.78, rotateZ: -0.03, printScale: 0.72, slotX: 0.12, slotY: -0.58 },
  ),
  defineCameraModel(
    "remi",
    "Rémi",
    "/models/remi.glb",
    2.54,
    [0, -0.08, 0],
    { z: 0.78, rotateZ: -0.03, printScale: 0.78, slotX: 0.04, slotY: -0.59 },
  ),
];

export function getRandomPolaroidCameraModel() {
  const index = Math.floor(Math.random() * POLAROID_CAMERA_MODELS.length);

  return POLAROID_CAMERA_MODELS[index];
}

function defineCameraModel(
  id: string,
  label: string,
  src: string,
  targetSize: number,
  position: PolaroidCameraModel["position"],
  eject3d: PolaroidCameraModel["eject3d"],
  photoExit: PolaroidCameraModel["photoExit"] = { rotate: -2.6, x: "0.2rem", y: "6vh" },
): PolaroidCameraModel {
  return { eject3d, id, label, photoExit, position, rotation: [0, 0, 0], src, targetSize };
}
