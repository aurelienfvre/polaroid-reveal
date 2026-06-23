"use client";

import { useRef } from "react";
import { ExperienceStage } from "@/features/reveal/components/ExperienceStage";
import { RevealRoadmap } from "@/features/reveal/components/RevealRoadmap";
import { useRevealExperienceModel } from "@/features/reveal/hooks/useRevealExperienceModel";

export function RevealExperience() {
  const stageRef = useRef<HTMLDivElement>(null);
  const polaroidMotionRef = useRef<HTMLDivElement>(null);
  const model = useRevealExperienceModel(stageRef, polaroidMotionRef);

  return (
    <main className="p-home">
      <section
        className={`p-home__experience p-home__experience--is-${model.phase}`}
      >
        <div className="p-home__stage" ref={stageRef}>
          <ExperienceStage {...model.stage} motionRef={polaroidMotionRef} />
        </div>
      </section>
      <RevealRoadmap />
    </main>
  );
}
