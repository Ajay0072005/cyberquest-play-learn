import React from "react";
import type { CareerTrack } from "@/data/roadmapData";
import { RoadmapCourseCard } from "./RoadmapCourseCard";

interface Props {
  tracks: CareerTrack[];
}

export const RoadmapCareerTracks: React.FC<Props> = ({ tracks }) => {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tracks.map((track) => (
          <div key={track.id} className="flex flex-col items-center">
            {/* Vertical connector from horizontal branch */}
            <div className="w-0.5 h-8 bg-border hidden md:block" />

            {/* Track header */}
            <div className="text-center mb-4">
              <div className={`mx-auto w-12 h-12 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center mb-3 shadow-lg`}>
                <track.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">{track.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[220px] mx-auto">{track.description}</p>
            </div>

            {/* Courses list with connecting line */}
            <div className="relative flex flex-col items-center gap-0 w-full">
              {track.courses.map((course, i) => (
                <React.Fragment key={course.id}>
                  {i > 0 && <div className="w-0.5 h-4 bg-border" />}
                  <div className="w-full max-w-[260px]">
                    <RoadmapCourseCard course={course} />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
