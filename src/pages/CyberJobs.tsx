import React, { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  ExternalLink,
  Building2,
  Filter,
  Globe,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";
import { cyberJobs, jobCategories, type CyberJob } from "@/data/cyberJobsData";

const levelColors: Record<string, string> = {
  Entry: "bg-green-500/20 text-green-400 border-green-500/30",
  Mid: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Senior: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Lead: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Executive: "bg-red-500/20 text-red-400 border-red-500/30",
};

const remoteColors: Record<string, string> = {
  Remote: "bg-emerald-500/20 text-emerald-400",
  Hybrid: "bg-amber-500/20 text-amber-400",
  "On-site": "bg-sky-500/20 text-sky-400",
};

const popularSearches = [
  "Penetration Tester",
  "SOC Analyst",
  "Cloud Security",
  "Security Engineer",
  "OSCP",
  "DevSecOps",
];

const JobCard = ({ job }: { job: CyberJob }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className="group border-border/50 bg-card/50 hover:bg-card/80 hover:border-primary/30 transition-all duration-300 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg leading-tight">
                {job.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground/80">{job.company}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {job.type}
                </span>
                <Badge variant="outline" className={`text-xs ${remoteColors[job.remote]}`}>
                  <Globe className="h-3 w-3 mr-1" />
                  {job.remote}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {job.salary && (
              <span className="text-sm font-medium text-primary flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                {job.salary}
              </span>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {job.postedAt}
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3 animate-in slide-in-from-top-2">
            <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`${levelColors[job.level]} text-xs`}>
                {job.level} Level
              </Badge>
              <Badge variant="outline" className="text-xs">
                {job.category}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-xs bg-muted/50"
                >
                  {skill}
                </Badge>
              ))}
            </div>
            <Button
              size="sm"
              variant="cyber"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                window.open(job.applyUrl, "_blank");
              }}
            >
              Apply Now
              <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CyberJobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedRemote, setSelectedRemote] = useState("All");

  const filteredJobs = useMemo(() => {
    return cyberJobs.filter((job) => {
      const matchesSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        job.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "All" || job.category === selectedCategory;
      const matchesLevel = selectedLevel === "All" || job.level === selectedLevel;
      const matchesRemote = selectedRemote === "All" || job.remote === selectedRemote;

      return matchesSearch && matchesCategory && matchesLevel && matchesRemote;
    });
  }, [searchQuery, selectedCategory, selectedLevel, selectedRemote]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-16">
        {/* Hero */}
        <div className="container mx-auto px-4 mb-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                CyberQuest Job Board
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-cyber font-bold text-foreground">
              Get hired by top{" "}
              <span className="text-primary cyber-glow">security</span> teams
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Discover cybersecurity career opportunities from leading companies worldwide. From entry-level to executive roles.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for job title, company, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 text-base bg-card/50 border-border/50 focus:border-primary"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">Popular:</span>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="text-xs px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  # {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters + Results */}
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] bg-card/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {jobCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[140px] bg-card/50">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {["All", "Entry", "Mid", "Senior", "Lead", "Executive"].map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRemote} onValueChange={setSelectedRemote}>
              <SelectTrigger className="w-[140px] bg-card/50">
                <SelectValue placeholder="Work Type" />
              </SelectTrigger>
              <SelectContent>
                {["All", "Remote", "Hybrid", "On-site"].map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(selectedCategory !== "All" || selectedLevel !== "All" || selectedRemote !== "All" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedLevel("All");
                  setSelectedRemote("All");
                  setSearchQuery("");
                }}
                className="text-xs text-muted-foreground"
              >
                Clear filters
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Showing <span className="text-foreground font-medium">{filteredJobs.length}</span> of{" "}
            {cyberJobs.length} jobs
          </p>

          <div className="space-y-3 max-w-4xl">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your search or filters to find more opportunities.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberJobs;
