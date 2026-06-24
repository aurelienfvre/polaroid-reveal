export type PolaroidCameraModel = {
  eject3d: {
    /** Z offset of the photo plane in front of the camera body. */
    z: number;
    /** Final z-rotation (radians) the developed photo settles into. */
    rotateZ: number;
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
  {
    eject3d: {
      z: 0.66,
      rotateZ: -0.05,
      slotX: 0.02,
      slotY: -1.14,
    },
    id: "polaroid-636",
    label: "Polaroid 636",
    photoExit: {
      rotate: -2.8,
      x: "0.4rem",
      y: "6vh",
    },
    position: [0, -0.03, 0],
    rotation: [0, 0, 0],
    src: "/models/Meshy_AI_Polaroid_636_CloseUp_0624142010_image-to-3d-texture.glb",
    targetSize: 2.64,
  },
  {
    eject3d: {
      z: 0.64,
      rotateZ: -0.04,
      slotX: -0.04,
      slotY: -0.92,
    },
    id: "i-2",
    label: "Polaroid I-2",
    photoExit: {
      rotate: -2.4,
      x: "-0.2rem",
      y: "6vh",
    },
    position: [0, -0.04, 0],
    rotation: [0, 0, 0],
    src: "/models/Meshy_AI_Polaroid_I_2_0624130653_image-to-3d-texture.glb",
    targetSize: 2.5,
  },
  {
    eject3d: {
      z: 0.66,
      rotateZ: -0.045,
      slotX: 0.01,
      slotY: -1.1,
    },
    id: "supercolor",
    label: "Polaroid Supercolor",
    photoExit: {
      rotate: -2.6,
      x: "0.2rem",
      y: "6vh",
    },
    position: [0, -0.1, 0],
    rotation: [0, 0, 0],
    src: "/models/Meshy_AI_Polaroid_Supercolor_1_0624122839_image-to-3d-texture.glb",
    targetSize: 2.5,
  },
];

export function getRandomPolaroidCameraModel() {
  const index = Math.floor(Math.random() * POLAROID_CAMERA_MODELS.length);

  return POLAROID_CAMERA_MODELS[index];
}
