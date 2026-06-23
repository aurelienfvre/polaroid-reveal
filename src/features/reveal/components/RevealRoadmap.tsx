import { WandSparkles } from "lucide-react";
import { REVEAL_FLOW } from "@/features/reveal/data/memories";

export function RevealRoadmap() {
  return (
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
  );
}
