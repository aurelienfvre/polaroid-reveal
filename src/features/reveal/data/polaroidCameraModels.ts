export type PolaroidCameraModel = {
  eject3d: {
    endY: number;
    rotateZ: number;
    startY: number;
    x: number;
    z: number;
  };
  id: string;
  label: string;
  photoExit: {
    endY: string;
    rotate: number;
    startY: string;
    x: string;
  };
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  src: string;
  targetSize: number;
};

export const POLAROID_CAMERA_MODELS: PolaroidCameraModel[] = [
  {
    eject3d: {
      endY: -0.72,
      rotateZ: -0.025,
      startY: -0.22,
      x: 0.02,
      z: 0.62,
    },
    id: "polaroid-636",
    label: "Polaroid 636",
    photoExit: {
      endY: "9.5vh",
      rotate: -0.7,
      startY: "9.5vh",
      x: "0",
    },
    position: [0, -0.03, 0],
    rotation: [0, 0, 0],
    src: "/models/Meshy_AI_Polaroid_636_CloseUp_0624142010_image-to-3d-texture.glb",
    targetSize: 2.64,
  },
  {
    eject3d: {
      endY: -0.7,
      rotateZ: -0.018,
      startY: -0.2,
      x: -0.03,
      z: 0.6,
    },
    id: "i-2",
    label: "Polaroid I-2",
    photoExit: {
      endY: "9.4vh",
      rotate: -0.45,
      startY: "9.4vh",
      x: "-0.1rem",
    },
    position: [0, -0.04, 0],
    rotation: [0, 0, 0],
    src: "/models/Meshy_AI_Polaroid_I_2_0624130653_image-to-3d-texture.glb",
    targetSize: 2.5,
  },
  {
    eject3d: {
      endY: -0.72,
      rotateZ: -0.022,
      startY: -0.23,
      x: 0.01,
      z: 0.62,
    },
    id: "supercolor",
    label: "Polaroid Supercolor",
    photoExit: {
      endY: "9.5vh",
      rotate: -0.55,
      startY: "9.5vh",
      x: "0",
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
