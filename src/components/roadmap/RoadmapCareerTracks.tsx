import React from "react";
import type { CareerTrack } from "@/data/roadmapData";
import { RoadmapCourseCard } from "./RoadmapCourseCard";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Props {
  tracks: CareerTrack[];
}

const TrackColumn: React.FC<{ track: CareerTrack; index: number }> = ({ track, index }) => {
  const { ref, isVisible } = useScrollReveal(0.15);

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
              <RoadmapCourseCard course={course} />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const RoadmapCareerTracks: React.FC<Props> = ({ tracks }) => {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tracks.map((track, index) => (
          <TrackColumn key={track.id} track={track} index={index} />
        ))}
      </div>
    </div>
  );
};
