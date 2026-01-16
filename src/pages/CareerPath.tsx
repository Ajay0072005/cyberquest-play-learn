import React from "react";
import { useParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { ChatBot } from "@/components/ChatBot";
import { getCareerPathBySlug, careerPaths } from "@/data/careerPathsData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Beaker, 
  Trophy,
  ChevronRight,
  Play,
  Lock
} from "lucide-react";

const CareerPath = () => {
  const { slug } = useParams<{ slug: string }>();
  const pathData = getCareerPathBySlug(slug || "");

  if (!pathData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-cyber font-bold mb-4">Path Not Found</h1>
          <p className="text-muted-foreground mb-8">The career path you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = careerPaths.findIndex(p => p.slug === slug);
  const prevPath = currentIndex > 0 ? careerPaths[currentIndex - 1] : null;
  const nextPath = currentIndex < careerPaths.length - 1 ? careerPaths[currentIndex + 1] : null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Intermediate":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Advanced":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Expert":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getLabTypeColor = (type: string) => {
    switch (type) {
      case "hands-on":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "ctf":
        return "bg-primary/20 text-primary border-primary/30";
      case "simulation":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const IconComponent = pathData.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Career Paths</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-primary">{pathData.title}</span>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Icon */}
            <div className={`h-24 w-24 rounded-2xl bg-gradient-to-br ${pathData.color} flex items-center justify-center shrink-0 shadow-lg`}>
              <IconComponent className="h-12 w-12 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="font-cyber text-primary border-primary/50">
                  LEVEL {pathData.level}
                </Badge>
                {pathData.level === 1 && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Start Here
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-cyber font-bold mb-4 cyber-glow">
                {pathData.title}
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mb-6">
                {pathData.longDescription}
              </p>
              
              {/* Skills */}
              <div className="flex flex-wrap gap-2">
                {pathData.skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary"
                    className="px-3 py-1"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Bar (placeholder) */}
          <div className="mt-8 p-4 rounded-lg cyber-bg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Path Progress</span>
              <span className="text-sm font-medium text-primary">0%</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-12 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-cyber font-bold">Courses</h2>
            <Badge variant="outline" className="ml-2">
              {pathData.courses.length} courses
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pathData.courses.map((course, index) => (
              <Card key={course.id} className="cyber-bg border-primary/20 hover:border-primary/40 transition-all group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {index + 1}/{pathData.courses.length}
                    </span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors mt-2">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course.lessons} lessons
                    </div>
                  </div>
                  <Button variant="outline" className="w-full group-hover:border-primary group-hover:text-primary">
                    <Play className="h-4 w-4 mr-2" />
                    Start Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Labs Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Beaker className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-cyber font-bold">Hands-On Labs</h2>
            <Badge variant="outline" className="ml-2">
              {pathData.labs.length} labs
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pathData.labs.map((lab) => (
              <Card key={lab.id} className="cyber-bg border-primary/20 hover:border-primary/40 transition-all group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className={getLabTypeColor(lab.type)}>
                      {lab.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-primary">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-medium">{lab.points} pts</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors mt-2">
                    {lab.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {lab.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lab.estimatedTime}
                    </div>
                  </div>
                  {lab.link ? (
                    <Link to={lab.link}>
                      <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                        <Beaker className="h-4 w-4 mr-2" />
                        Start Lab
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation between paths */}
      <section className="py-12 bg-muted/10 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            {prevPath ? (
              <Link to={`/path/${prevPath.slug}`} className="flex-1">
                <Card className="cyber-bg border-primary/20 hover:border-primary/40 transition-all group p-4">
                  <div className="flex items-center gap-4">
                    <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div>
                      <p className="text-xs text-muted-foreground">Previous Level</p>
                      <p className="font-cyber font-bold group-hover:text-primary transition-colors">
                        {prevPath.title}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            
            {nextPath && (
              <Link to={`/path/${nextPath.slug}`} className="flex-1">
                <Card className="cyber-bg border-primary/20 hover:border-primary/40 transition-all group p-4">
                  <div className="flex items-center justify-end gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Next Level</p>
                      <p className="font-cyber font-bold group-hover:text-primary transition-colors">
                        {nextPath.title}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Card>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 CyberQuest. Empowering the next generation of cybersecurity professionals.
          </p>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
};

export default CareerPath;
