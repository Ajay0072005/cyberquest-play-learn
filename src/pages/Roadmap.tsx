import React from "react";
import { Navigation } from "@/components/Navigation";
import { foundationStages, careerTracks } from "@/data/roadmapData";
import { RoadmapFoundation } from "@/components/roadmap/RoadmapFoundation";
import { RoadmapCareerTracks } from "@/components/roadmap/RoadmapCareerTracks";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLabProgress } from "@/hooks/useLabProgress";
import { useAuth } from "@/context/AuthContext";

export default function Roadmap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { completedLabs } = useLabProgress();

  // Build a Set of completed lab IDs for quick lookup
  const completedIds = new Set(completedLabs.map((l) => l.lab_id));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-cyber font-bold mb-4">
              Cyber Security Learning Roadmap
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              From fundamental principles to advanced techniques, this roadmap provides clear steps and essential resources to help you build a robust skill set.
            </p>
          </div>

          {/* Foundation Stages */}
          <RoadmapFoundation stages={foundationStages} completedIds={completedIds} />

          {/* Career Tracks */}
          <RoadmapCareerTracks tracks={careerTracks} completedIds={completedIds} />

          {/* What's Next */}
          <div className="text-center mt-20">
            <h2 className="text-2xl font-cyber font-bold mb-3">What's next?</h2>
            <p className="text-muted-foreground mb-6">
              Explore courses, challenges, and labs with new content added every week!
            </p>
            <Button variant="outline" size="lg" onClick={() => navigate("/labs")}>
              Explore more
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
