import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { RoadmapCourse } from "@/data/roadmapData";

interface Props {
  course: RoadmapCourse;
}

const difficultyColors: Record<string, string> = {
  Easy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Hard: "bg-red-500/20 text-red-400 border-red-500/30",
};

const typeColors: Record<string, string> = {
  Path: "bg-primary/20 text-primary border-primary/30",
  "Professional Certification": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Add-on": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export const RoadmapCourseCard: React.FC<Props> = ({ course }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => course.link && navigate(course.link)}
      className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg border border-border bg-card/80 hover:bg-card hover:border-primary/40 transition-all text-left ${
        course.link ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <span className="text-sm font-medium truncate">{course.title}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${difficultyColors[course.difficulty]}`}>
          {course.difficulty}
        </Badge>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeColors[course.type]}`}>
          {course.type}
        </Badge>
      </div>
    </button>
  );
};
