"use client";

import { useState } from "react";
import {
  getRandomPolaroidCameraModel,
  type PolaroidCameraModel,
} from "@/features/reveal/data/polaroidCameraModels";

export function useRandomPolaroidCameraModel() {
  const [model] = useState<PolaroidCameraModel>(getRandomPolaroidCameraModel);

  return model;
}
