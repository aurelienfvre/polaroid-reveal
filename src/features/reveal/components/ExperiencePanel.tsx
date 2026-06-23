import { Bell, Camera, ImagePlus, MousePointer2, Move, RotateCcw } from "lucide-react";
import type { PanelCopy } from "@/features/reveal/types/revealTypes";

type Props = {
  copy: PanelCopy;
  isCanvasAvailable: boolean;
  onNotificationPermission: () => void;
  onPrimaryAction: () => void;
  onResetDailySession: () => void;
  onSecondaryAction: () => void;
  notificationState: string;
  phase: "camera" | "develop" | "canvas";
  primaryLabel: string;
  sensorLabel: string;
};

export function ExperiencePanel({
  copy,
  isCanvasAvailable,
  onNotificationPermission,
  onPrimaryAction,
  onResetDailySession,
  onSecondaryAction,
  notificationState,
  phase,
  primaryLabel,
  sensorLabel,
}: Props) {
  return (
    <aside className="p-home__panel" aria-label="Commandes du reveal">
      <p className="p-home__eyebrow">{copy.eyebrow}</p>
      <h1 className="p-home__title">{copy.title}</h1>
      <p className="p-home__intro">{copy.intro}</p>
      <div className="c-memory-controls">
        <button className="c-button c-button--primary" type="button" onClick={onPrimaryAction}>
          {phase === "canvas" ? <ImagePlus size={18} /> : <Camera size={18} />}
          {primaryLabel}
        </button>
        <button
          className="c-button c-button--ghost"
          type="button"
          onClick={phase === "canvas" ? onResetDailySession : onSecondaryAction}
        >
          {phase !== "canvas" && isCanvasAvailable ? <Move size={18} /> : <RotateCcw size={18} />}
          {phase === "canvas"
            ? "Reinitialiser le POC"
            : isCanvasAvailable
              ? "Voir le canvas"
              : "Reroll"}
        </button>
      </div>
      <div className="c-sensor-panel">
        <div className="c-sensor-panel__status">
          <MousePointer2 aria-hidden="true" size={18} />
          <span>Interaction detectee<small>{sensorLabel}</small></span>
        </div>
        <button
          className="c-sensor-panel__action"
          type="button"
          onClick={onNotificationPermission}
        >
          <Bell aria-hidden="true" size={18} />
          <span>Tester une notification<small>{notificationState}</small></span>
        </button>
      </div>
    </aside>
  );
}
