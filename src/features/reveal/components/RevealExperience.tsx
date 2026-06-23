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

gsap.registerPlugin(useGSAP);

type TiltStyle = CSSProperties & {
  "--motion-depth-x": string;
  "--motion-depth-y": string;
  "--motion-image-x": string;
  "--motion-image-y": string;
  "--motion-light-x": string;
  "--motion-light-y": string;
};

export function RevealExperience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const { trigger } = useWebHaptics();
  const revealMemory = useCallback(() => {
    setIsRevealed((currentValue) => {
      if (currentValue) {
        return currentValue;
      }

      trigger(HAPTIC_EVENTS.reveal, { intensity: 0.65 })?.catch(
        () => undefined,
      );

      return true;
    });
  }, [trigger]);

  const deviceProfile = useDeviceProfile();
  const deviceOrientation = useDeviceOrientation(revealMemory);
  const notifications = useNotifications();
  const pointerTilt = usePointerTilt(
    stageRef,
    deviceProfile.inputMode !== "motion" && !isRevealed,
    revealMemory,
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
  };

  useEffect(() => {
    if (!stageRef.current || deviceOrientation.permissionState !== "granted") {
      return;
    }

      stageRef.current.style.setProperty(
        "--motion-depth-x",
      `${interactionTilt.x * 20}deg`,
    );
    stageRef.current.style.setProperty(
      "--motion-depth-y",
      `${interactionTilt.y * -16}deg`,
    );
    stageRef.current.style.setProperty(
      "--motion-image-x",
      `${interactionTilt.x * 44}px`,
    );
    stageRef.current.style.setProperty(
      "--motion-image-y",
      `${interactionTilt.y * 34}px`,
    );
    stageRef.current.style.setProperty(
      "--motion-light-x",
      `${interactionTilt.x * 58}px`,
    );
    stageRef.current.style.setProperty(
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
        ".c-polaroid-card--is-active .c-polaroid-card__image",
        { filter: "blur(18px) grayscale(1) brightness(1.25)", opacity: 0.48 },
        {
          filter: "blur(0px) grayscale(0) brightness(1)",
          opacity: 1,
          duration: 1.4,
          ease: "sine.inOut",
        },
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

    revealMemory();
  };

  const handleReroll = () => {
    setIsRevealed(false);
    pointerTilt.resetPointerTilt();
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
          style={tiltStyle}
        >
          <div className="c-reveal-board">
            <p className="c-status-pill">3 reveals / jour - 3 rerolls</p>
            <div className="c-polaroid-stack" aria-live="polite">
              {MEMORIES.map((memory, index) => {
                const cardClassName = [
                  "c-polaroid-card",
                  `c-polaroid-card--tone-${memory.tone}`,
                  index === activeIndex ? "c-polaroid-card--is-active" : "",
                  index !== activeIndex ? "c-polaroid-card--is-parked" : "",
                  isRevealed && index === activeIndex
                    ? "c-polaroid-card--is-revealed"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <article className={cardClassName} key={memory.id}>
                    <div className="c-polaroid-card__paper">
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
                            : "Le souvenir se revele quand l'image retrouve sa lenteur."}
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
                : "Fallback reveal"}
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
                      ? "bouge le telephone pour reveler"
                      : `${deviceProfile.label} - autorisation requise`
                    : `${deviceProfile.label} - bouge la souris sur la photo`}
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
