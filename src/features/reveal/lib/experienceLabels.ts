import type { DeviceProfile } from "@/hooks/useDeviceProfile";
import type { ExperiencePhase } from "@/features/reveal/types/revealTypes";

type Params = {
  deviceProfile: DeviceProfile;
  isRevealed: boolean;
  motionPermission: string;
  phase: ExperiencePhase;
};

export function getPrimaryActionLabel({
  deviceProfile,
  isRevealed,
  motionPermission,
  phase,
}: Params) {
  if (phase === "camera") {
    return "Sortir une photo";
  }

  if (phase === "canvas") {
    return "Revenir a l'appareil";
  }

  if (isRevealed) {
    return "Placer sur le canvas";
  }

  if (deviceProfile.inputMode === "motion" && motionPermission !== "granted") {
    return "Autoriser le mouvement";
  }

  return "Aider un peu le developpement";
}

export function getSensorLabel({
  deviceProfile,
  motionPermission,
  phase,
}: Omit<Params, "isRevealed">) {
  if (phase === "canvas") {
    return "drag libre sur le tableau";
  }

  if (phase === "camera") {
    return "clic appareil puis zoom photo";
  }

  if (deviceProfile.inputMode !== "motion") {
    return `${deviceProfile.label} - remue avec la souris ou le trackpad`;
  }

  return motionPermission === "granted"
    ? "secoue franchement le telephone plusieurs fois"
    : `${deviceProfile.label} - autorisation requise`;
}
