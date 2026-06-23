import type {
  DeviceMotionEventWithPermission,
  DeviceOrientationEventWithPermission,
  DeviceOrientationPermissionState,
} from "@/lib/gyroscope/deviceMotionTypes";

type SetPermission = (state: DeviceOrientationPermissionState) => void;
type SetListening = (isListening: boolean) => void;

export async function requestDeviceMotionAccess(
  setPermissionState: SetPermission,
  setIsListening: SetListening,
) {
  if (typeof window === "undefined") {
    setPermissionState("unsupported");
    return false;
  }

  const hasOrientationEvent = "DeviceOrientationEvent" in window;
  const hasMotionEvent = "DeviceMotionEvent" in window;

  if (!hasOrientationEvent && !hasMotionEvent) {
    setPermissionState("unsupported");
    return false;
  }

  const permissionRequests: Array<Promise<PermissionState>> = [];

  if (hasOrientationEvent) {
    const orientationEvent =
      window.DeviceOrientationEvent as DeviceOrientationEventWithPermission;

    if (typeof orientationEvent.requestPermission === "function") {
      permissionRequests.push(orientationEvent.requestPermission());
    }
  }

  if (hasMotionEvent) {
    const motionEvent = window.DeviceMotionEvent as DeviceMotionEventWithPermission;

    if (typeof motionEvent.requestPermission === "function") {
      permissionRequests.push(motionEvent.requestPermission());
    }
  }

  if (permissionRequests.length === 0) {
    setPermissionState("granted");
    setIsListening(true);
    return true;
  }

  try {
    const results = await Promise.allSettled(permissionRequests);
    const granted = results.some(
      (result) => result.status === "fulfilled" && result.value === "granted",
    );

    setPermissionState(granted ? "granted" : "denied");
    setIsListening(granted);

    return granted;
  } catch {
    setPermissionState("denied");
    setIsListening(false);
    return false;
  }
}
