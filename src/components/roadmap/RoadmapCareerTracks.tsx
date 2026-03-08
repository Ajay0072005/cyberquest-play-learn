import React from "react";
import type { CareerTrack } from "@/data/roadmapData";
import { RoadmapCourseCard } from "./RoadmapCourseCard";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Props {
  tracks: CareerTrack[];
  completedIds: Set<string>;
}

const TrackColumn: React.FC<{ track: CareerTrack; index: number; completedIds: Set<string> }> = ({ track, index, completedIds }) => {
  const { ref, isVisible } = useScrollReveal(0.15);
  const completedCount = track.courses.filter((c) => completedIds.has(c.id)).length;
  const totalCount = track.courses.length;

  return (
    <div
      ref={ref}
      className="flex flex-col items-center transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${index * 200}ms`,
      }}
    >
      <div className="w-0.5 h-8 bg-border hidden md:block" />

      <div className="text-center mb-4">
        <div className={`mx-auto w-12 h-12 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center mb-3 shadow-lg`}>
          <track.icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-bold">{track.title}</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-[220px] mx-auto">{track.description}</p>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mt-3 max-w-[220px] mx-auto">
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
      </div>

      <div className="relative flex flex-col items-center gap-0 w-full">
        {track.courses.map((course, i) => (
          <React.Fragment key={course.id}>
            {i > 0 && <div className="w-0.5 h-4 bg-border" />}
            <div
              className="w-full max-w-[260px] transition-all duration-500 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${index * 200 + (i + 1) * 100}ms`,
              }}
            >
              <RoadmapCourseCard course={course} completed={completedIds.has(course.id)} />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const RoadmapCareerTracks: React.FC<Props> = ({ tracks, completedIds }) => {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tracks.map((track, index) => (
          <TrackColumn key={track.id} track={track} index={index} completedIds={completedIds} />
        ))}
      </div>
    </div>
  );
};
