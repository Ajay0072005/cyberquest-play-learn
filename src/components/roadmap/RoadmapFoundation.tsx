import React from "react";
import type { RoadmapStage } from "@/data/roadmapData";
import { RoadmapCourseCard } from "./RoadmapCourseCard";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Props {
  stages: RoadmapStage[];
}

const StageCard: React.FC<{ stage: RoadmapStage; index: number }> = ({ stage, index }) => {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <div
      ref={ref}
      className="w-full max-w-md bg-card border border-border rounded-xl p-6 text-center shadow-lg relative z-10 transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${index * 150}ms`,
      }}
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <stage.icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold">{stage.title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{stage.description}</p>

      {stage.courses.length > 0 && (
        <div className="space-y-2">
          {stage.courses.map((course) => (
            <RoadmapCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export const RoadmapFoundation: React.FC<Props> = ({ stages }) => {
  return (
    <div className="relative flex flex-col items-center gap-0">
      {stages.map((stage, index) => (
        <React.Fragment key={stage.id}>
          {index > 0 && (
            <div className="w-0.5 h-10 bg-border" />
          )}
          <StageCard stage={stage} index={index} />
        </React.Fragment>
      ))}

      <div className="w-0.5 h-16 bg-border" />

      <div className="relative w-full flex justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-0.5 bg-border" />
      </div>
    </div>
  );
};
