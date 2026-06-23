"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Bell, Camera, MousePointer2, RotateCcw, WandSparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useWebHaptics } from "web-haptics/react";
import { MEMORIES, REVEAL_FLOW } from "@/features/reveal/data/memories";
import { useDeviceProfile } from "@/hooks/useDeviceProfile";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { useNotifications } from "@/hooks/useNotifications";
import { usePointerTilt } from "@/hooks/usePointerTilt";
import { normalizeTilt } from "@/lib/gyroscope/normalizeTilt";
import { HAPTIC_EVENTS } from "@/lib/haptics/hapticEvents";
import type { MotionImpulse } from "@/lib/motion/motionProgress";

gsap.registerPlugin(useGSAP);

type TiltStyle = CSSProperties & {
  "--motion-depth-x": string;
  "--motion-depth-y": string;
  "--motion-image-x": string;
  "--motion-image-y": string;
  "--motion-light-x": string;
  "--motion-light-y": string;
  "--reveal-progress": number;
  "--reveal-blur": string;
  "--reveal-grayscale": number;
  "--reveal-brightness": number;
  "--reveal-opacity": number;
  "--shake-x": string;
  "--shake-y": string;
  "--shake-rotate": string;
  "--develop-flash-opacity": number;
};

export function RevealExperience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealProgress, setRevealProgress] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const polaroidMotionRef = useRef<HTMLDivElement>(null);
  const revealProgressRef = useRef(0);
  const hasTriggeredRevealHapticRef = useRef(false);
  const { trigger } = useWebHaptics();

  const isRevealed = revealProgress >= 1;

  const playDevelopmentImpulse = useCallback(
    (amount: number, impulse?: MotionImpulse) => {
      const motionTarget = polaroidMotionRef.current;

      if (!motionTarget) {
        return;
      }

      const rawX = impulse?.x ?? Math.random() * 2 - 1;
      const rawY = impulse?.y ?? Math.random() * 2 - 1;
      const directionLength = Math.max(Math.hypot(rawX, rawY), 0.2);
      const directionX = rawX / directionLength;
      const directionY = rawY / directionLength;
      const force = Math.min(Math.max(impulse?.force ?? amount * 16, 0.8), 1.9);
      const shakeX = directionX * gsap.utils.random(18, 32) * force;
      const shakeY = directionY * gsap.utils.random(10, 22) * force;
      const shakeRotate =
        (-directionX * gsap.utils.random(5, 9) +
          directionY * gsap.utils.random(-2.2, 2.2)) *
        force;

      gsap.killTweensOf(motionTarget);
      gsap
        .timeline()
        .to(
          motionTarget,
          {
            "--shake-x": `${shakeX}px`,
            "--shake-y": `${shakeY}px`,
            "--shake-rotate": `${shakeRotate}deg`,
            "--develop-flash-opacity": Math.min(0.14 + amount * 1.8, 0.36),
            duration: 0.07,
            ease: "power3.out",
          },
          0,
        )
        .to(motionTarget, {
          "--shake-x": `${shakeX * -0.46}px`,
          "--shake-y": `${shakeY * -0.34}px`,
          "--shake-rotate": `${shakeRotate * -0.52}deg`,
          "--develop-flash-opacity": 0.08,
          duration: 0.11,
          ease: "sine.inOut",
        })
        .to(motionTarget, {
          "--develop-flash-opacity": 0,
          duration: 0.18,
          ease: "power2.out",
        })
        .to(
          motionTarget,
          {
            "--shake-x": "0px",
            "--shake-y": "0px",
            "--shake-rotate": "0deg",
            duration: 0.44,
            ease: "elastic.out(1, 0.46)",
          },
          "<",
        );
    },
    [],
  );

  const developMemory = useCallback((amount: number, impulse?: MotionImpulse) => {
    const nextProgress = Math.min(revealProgressRef.current + amount, 1);

    if (nextProgress === revealProgressRef.current) {
      return;
    }

    playDevelopmentImpulse(amount, impulse);
    revealProgressRef.current = nextProgress;
    setRevealProgress(nextProgress);

    if (nextProgress >= 1 && !hasTriggeredRevealHapticRef.current) {
      hasTriggeredRevealHapticRef.current = true;
      trigger(HAPTIC_EVENTS.reveal, { intensity: 0.65 })?.catch(
        () => undefined,
      );
    }
  }, [playDevelopmentImpulse, trigger]);

  const deviceProfile = useDeviceProfile();
  const deviceOrientation = useDeviceOrientation(developMemory);
  const notifications = useNotifications();
  const pointerTilt = usePointerTilt(
    stageRef,
    deviceProfile.inputMode !== "motion" && !isRevealed,
    developMemory,
    polaroidMotionRef,
  );

  const interactionTilt = useMemo(() => {
    if (deviceOrientation.permissionState !== "granted") {
      return { x: 0, y: 0 };
    }

    return normalizeTilt(deviceOrientation.orientation);
  }, [deviceOrientation.orientation, deviceOrientation.permissionState]);

  const tiltStyle: TiltStyle = {
    "--motion-depth-x": "0deg",
    "--motion-depth-y": "0deg",
    "--motion-image-x": "0px",
    "--motion-image-y": "0px",
    "--motion-light-x": "0px",
    "--motion-light-y": "0px",
    "--reveal-progress": revealProgress,
    "--reveal-blur": `${18 * (1 - revealProgress)}px`,
    "--reveal-grayscale": 1 - revealProgress,
    "--reveal-brightness": 1.25 - revealProgress * 0.25,
    "--reveal-opacity": 0.48 + revealProgress * 0.52,
    "--shake-x": "0px",
    "--shake-y": "0px",
    "--shake-rotate": "0deg",
    "--develop-flash-opacity": 0,
  };

  useEffect(() => {
    if (
      !polaroidMotionRef.current ||
      deviceOrientation.permissionState !== "granted"
    ) {
      return;
    }

    polaroidMotionRef.current.style.setProperty(
      "--motion-depth-x",
      `${interactionTilt.x * 20}deg`,
    );
    polaroidMotionRef.current.style.setProperty(
      "--motion-depth-y",
      `${interactionTilt.y * -16}deg`,
    );
    polaroidMotionRef.current.style.setProperty(
      "--motion-image-x",
      `${interactionTilt.x * 44}px`,
    );
    polaroidMotionRef.current.style.setProperty(
      "--motion-image-y",
      `${interactionTilt.y * 34}px`,
    );
    polaroidMotionRef.current.style.setProperty(
      "--motion-light-x",
      `${interactionTilt.x * 58}px`,
    );
    polaroidMotionRef.current.style.setProperty(
      "--motion-light-y",
      `${interactionTilt.y * 44}px`,
    );
  }, [
    deviceOrientation.permissionState,
    interactionTilt,
  ]);

  useGSAP(
    () => {
      gsap.fromTo(
        ".c-polaroid-card--is-active",
        { autoAlpha: 0, y: 28, rotate: -3 },
        { autoAlpha: 1, y: 0, rotate: 0, duration: 0.9, ease: "power3.out" },
      );
    },
    { scope: stageRef, dependencies: [activeIndex] },
  );

  useGSAP(
    () => {
      if (!isRevealed) {
        return;
      }

      gsap.fromTo(
        ".c-polaroid-card--is-active .c-polaroid-card__paper",
        { y: 4, rotate: -0.8 },
        { y: 0, rotate: 0, duration: 0.7, ease: "elastic.out(1, 0.55)" },
      );
    },
    { scope: stageRef, dependencies: [isRevealed] },
  );

  const handlePrimaryAction = async () => {
    if (
      deviceProfile.isMobileLike &&
      deviceOrientation.permissionState !== "granted"
    ) {
      await deviceOrientation.requestAccess().catch(() => false);
      return;
    }

    developMemory(0.12, {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      force: 1,
    });
  };

  const handleReroll = () => {
    revealProgressRef.current = 0;
    hasTriggeredRevealHapticRef.current = false;
    setRevealProgress(0);
    pointerTilt.resetPointerTilt();
    gsap.set(polaroidMotionRef.current, {
      "--shake-x": "0px",
      "--shake-y": "0px",
      "--shake-rotate": "0deg",
      "--develop-flash-opacity": 0,
    });
    setActiveIndex((currentIndex) => (currentIndex + 1) % MEMORIES.length);
    trigger(HAPTIC_EVENTS.snap, { intensity: 0.42 })?.catch(() => undefined);
  };

  const handleNotificationPermission = async () => {
    const granted = await notifications.requestPermission();

    if (granted) {
      await notifications.showPreviewNotification({
        title: "Une photo attend sa lumiere",
        body: "Secoue le souvenir pour laisser l'image revenir doucement.",
      });
    }

    trigger(granted ? HAPTIC_EVENTS.permissionOk : HAPTIC_EVENTS.permissionKo)?.catch(
      () => undefined,
    );
  };

  return (
    <main className="p-home">
      <section className="p-home__experience" aria-label="Prototype Polaroid">
        <div
          className="p-home__stage"
          ref={stageRef}
        >
          <div className="c-reveal-board">
            <div className="c-status-pill">
              <span className="c-status-pill__label">Developpement photo</span>
              <span
                className="c-status-pill__meter"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(revealProgress * 100)}
              >
                <span
                  className="c-status-pill__meter-fill"
                  style={{ width: `${Math.round(revealProgress * 100)}%` }}
                />
              </span>
            </div>
            <div className="c-polaroid-stack" aria-live="polite">
              {MEMORIES.map((memory, index) => {
                const cardClassName = [
                  "c-polaroid-card",
                  `c-polaroid-card--tone-${memory.tone}`,
                  index === activeIndex ? "c-polaroid-card--is-active" : "",
                  index !== activeIndex ? "c-polaroid-card--is-parked" : "",
                  revealProgress > 0 && index === activeIndex
                    ? "c-polaroid-card--is-developing"
                    : "",
                  isRevealed && index === activeIndex
                    ? "c-polaroid-card--is-revealed"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <article className={cardClassName} key={memory.id}>
                    <div
                      className="c-polaroid-card__paper"
                      ref={index === activeIndex ? polaroidMotionRef : undefined}
                      style={index === activeIndex ? tiltStyle : undefined}
                    >
                      <div className="c-polaroid-card__image">
                        <span className="c-polaroid-card__light-leak" />
                        <span className="c-polaroid-card__grain" />
                      </div>
                      <div className="c-polaroid-card__body">
                        <p className="c-polaroid-card__date">
                          {memory.dateLabel} - {memory.location}
                        </p>
                        <h2 className="c-polaroid-card__title">{memory.title}</h2>
                        <p className="c-polaroid-card__caption">
                          {isRevealed && index === activeIndex
                            ? memory.caption
                            : revealProgress > 0
                              ? "Continue de remuer plusieurs fois, l'image remonte doucement."
                              : "Remue plusieurs fois pour lancer le developpement."}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="p-home__panel" aria-label="Commandes du reveal">
          <p className="p-home__eyebrow">Polaroid memory lab</p>
          <h1 className="p-home__title">Reveler une photo oubliee</h1>
          <p className="p-home__intro">
            Un POC immersif pour transformer une bibliotheque de photos en
            rituel personnel : importer, filtrer les images faibles, reveler
            trois souvenirs, les personnaliser, puis composer un grand tableau
            scrapbook.
          </p>

          <div className="c-memory-controls">
            <button
              className="c-button c-button--primary"
              type="button"
              onClick={handlePrimaryAction}
            >
              <Camera aria-hidden="true" size={18} />
              {deviceProfile.inputMode === "motion" &&
              deviceOrientation.permissionState !== "granted"
                ? "Autoriser le mouvement"
                : "Aider un peu le developpement"}
            </button>
            <button
              className="c-button c-button--ghost"
              type="button"
              onClick={handleReroll}
            >
              <RotateCcw aria-hidden="true" size={18} />
              Reroll
            </button>
          </div>

          <div className="c-sensor-panel">
            <div className="c-sensor-panel__status">
              <MousePointer2 aria-hidden="true" size={18} />
              <span>
                Interaction detectee
                <small>
                  {deviceProfile.inputMode === "motion"
                    ? deviceOrientation.permissionState === "granted"
                      ? "secoue franchement le telephone plusieurs fois"
                      : `${deviceProfile.label} - autorisation requise`
                    : `${deviceProfile.label} - remue avec la souris ou le trackpad`}
                </small>
              </span>
            </div>

            <button
              className="c-sensor-panel__action"
              type="button"
              onClick={handleNotificationPermission}
            >
              <Bell aria-hidden="true" size={18} />
              <span>
                Tester une notification
                <small>{notifications.permissionState}</small>
              </span>
            </button>
          </div>
        </aside>
      </section>

      <section className="p-home__flow" aria-labelledby="flow-title">
        <div className="p-home__flow-header">
          <WandSparkles aria-hidden="true" size={18} />
          <h2 className="p-home__flow-title" id="flow-title">
            Parcours prototype
          </h2>
        </div>
        <ol className="c-reveal-roadmap">
          {REVEAL_FLOW.map((step, index) => (
            <li className="c-reveal-roadmap__item" key={step}>
              <span className="c-reveal-roadmap__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="c-reveal-roadmap__label">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
