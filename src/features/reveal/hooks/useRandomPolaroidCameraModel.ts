"use client";

import { useSyncExternalStore } from "react";
import {
  POLAROID_CAMERA_MODELS,
  getRandomPolaroidCameraModel,
  type PolaroidCameraModel,
} from "@/features/reveal/data/polaroidCameraModels";

export function useRandomPolaroidCameraModel() {
  return useSyncExternalStore(subscribe, getClientModel, getServerModel);
}

let clientModel: PolaroidCameraModel | null = null;

function getClientModel() {
  clientModel ??= getRandomPolaroidCameraModel();

  return clientModel;
}

function getServerModel() {
  return POLAROID_CAMERA_MODELS[0];
}

function subscribe() {
  return () => {};
}
