"use client";

import { useEffect, useState } from "react";

export type DeviceProfile = {
  inputMode: "unknown" | "pointer" | "motion";
  isMobileLike: boolean;
  label: string;
};

const DEFAULT_PROFILE: DeviceProfile = {
  inputMode: "unknown",
  isMobileLike: false,
  label: "detection en cours",
};

type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: {
    mobile?: boolean;
  };
};

function getDeviceProfile(): DeviceProfile {
  if (typeof window === "undefined") {
    return DEFAULT_PROFILE;
  }

  const navigatorWithHints = navigator as NavigatorWithUserAgentData;
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const hasAnyCoarsePointer = window.matchMedia("(any-pointer: coarse)").matches;
  const hasHover = window.matchMedia("(hover: hover)").matches;
  const hasAnyHover = window.matchMedia("(any-hover: hover)").matches;
  const hasTouch = navigator.maxTouchPoints > 0;
  const hasMotionApi =
    "DeviceOrientationEvent" in window || "DeviceMotionEvent" in window;
  const isUserAgentMobile =
    navigatorWithHints.userAgentData?.mobile === true ||
    /android|iphone|ipod|ipad|mobile|windows phone/.test(userAgent);
  const isIpadDesktopMode = platform === "macintel" && navigator.maxTouchPoints > 1;
  const isSmallTouchScreen =
    hasTouch && Math.min(window.screen.width, window.screen.height) <= 820;
  const isMobileLike =
    isUserAgentMobile ||
    isIpadDesktopMode ||
    hasCoarsePointer ||
    (hasAnyCoarsePointer && !hasAnyHover) ||
    (hasTouch && !hasHover) ||
    isSmallTouchScreen ||
    (hasMotionApi && hasTouch);

  return {
    inputMode: isMobileLike ? "motion" : "pointer",
    isMobileLike,
    label: isMobileLike ? "telephone detecte" : "ordinateur detecte",
  };
}

export function useDeviceProfile() {
  const [profile, setProfile] = useState<DeviceProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    const updateProfile = () => {
      setProfile(getDeviceProfile());
    };

    updateProfile();

    const pointerQuery = window.matchMedia("(pointer: coarse)");
    const anyPointerQuery = window.matchMedia("(any-pointer: coarse)");
    const hoverQuery = window.matchMedia("(hover: hover)");
    const anyHoverQuery = window.matchMedia("(any-hover: hover)");

    pointerQuery.addEventListener("change", updateProfile);
    anyPointerQuery.addEventListener("change", updateProfile);
    hoverQuery.addEventListener("change", updateProfile);
    anyHoverQuery.addEventListener("change", updateProfile);
    window.addEventListener("resize", updateProfile);
    window.addEventListener("orientationchange", updateProfile);

    return () => {
      pointerQuery.removeEventListener("change", updateProfile);
      anyPointerQuery.removeEventListener("change", updateProfile);
      hoverQuery.removeEventListener("change", updateProfile);
      anyHoverQuery.removeEventListener("change", updateProfile);
      window.removeEventListener("resize", updateProfile);
      window.removeEventListener("orientationchange", updateProfile);
    };
  }, []);

  return profile;
}
