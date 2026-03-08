import React from "react";
import type { RoadmapStage } from "@/data/roadmapData";
import { RoadmapCourseCard } from "./RoadmapCourseCard";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Props {
  stages: RoadmapStage[];
  completedIds: Set<string>;
}

const StageCard: React.FC<{ stage: RoadmapStage; index: number; completedIds: Set<string> }> = ({ stage, index, completedIds }) => {
  const { ref, isVisible } = useScrollReveal(0.2);
  const completedCount = stage.courses.filter((c) => completedIds.has(c.id)).length;
  const totalCount = stage.courses.length;

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

      {totalCount > 0 && (
        <>
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="space-y-2">
            {stage.courses.map((course) => (
              <RoadmapCourseCard key={course.id} course={course} completed={completedIds.has(course.id)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const RoadmapFoundation: React.FC<Props> = ({ stages, completedIds }) => {
  return (
    <div className="relative flex flex-col items-center gap-0">
      {stages.map((stage, index) => (
        <React.Fragment key={stage.id}>
          {index > 0 && (
            <div className="w-0.5 h-10 bg-border" />
          )}
          <StageCard stage={stage} index={index} completedIds={completedIds} />
        </React.Fragment>
      ))}

      <div className="w-0.5 h-16 bg-border" />

      <div className="relative w-full flex justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-0.5 bg-border" />
      </div>
    </div>
  );
};
