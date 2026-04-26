import React, { useState, useMemo, useEffect } from "react";
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
  Shield,
  Loader2,
  RefreshCw,
  AlertCircle,
  X,
} from "lucide-react";

interface CyberJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  remote: string;
  salary: string | null;
  postedAt: string;
  category: string;
  level: string;
  description: string;
  skills: string[];
  applyUrl: string;
}

const levelColors: Record<string, string> = {
  Entry: "bg-green-500/15 text-green-400 border-green-500/20",
  Mid: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Senior: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  Lead: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Executive: "bg-red-500/15 text-red-400 border-red-500/20",
};

const remoteColors: Record<string, string> = {
  Remote: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Hybrid: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "On-site": "bg-sky-500/15 text-sky-400 border-sky-500/20",
};

const searchSuggestions = [
  "Penetration Tester",
  "SOC Analyst",
  "Cloud Security",
  "Security Engineer",
  "DevSecOps",
];

const countryOptions = [
  { value: "us", label: "🇺🇸 USA" },
  { value: "gb", label: "🇬🇧 UK" },
  { value: "ca", label: "🇨🇦 Canada" },
  { value: "de", label: "🇩🇪 Germany" },
  { value: "au", label: "🇦🇺 Australia" },
  { value: "in", label: "🇮🇳 India" },
];

const JobListItem = ({
  job,
  isSelected,
  onClick,
}: {
  job: CyberJob;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-4 border-b border-border/30 transition-colors hover:bg-primary/5 ${
      isSelected ? "bg-primary/10 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-sm leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
          {job.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{job.company}</p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${remoteColors[job.remote] || ""}`}>
            {job.remote}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {job.postedAt}
        </span>
        {job.salary && (
          <span className="text-[11px] font-medium text-primary">{job.salary}</span>
        )}
      </div>
    </div>
  </button>
);

const JobDetail = ({ job, onClose }: { job: CyberJob; onClose: () => void }) => (
  <div className="h-full flex flex-col">
    <div className="p-6 border-b border-border/30 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">{job.title}</h2>
        <div className="flex items-center gap-2 mt-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground/90">{job.company}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>

    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Meta info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary/70" />
          {job.location}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4 text-primary/70" />
          {job.type}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Globe className="h-4 w-4 text-primary/70" />
          {job.remote}
        </div>
        {job.salary && (
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <DollarSign className="h-4 w-4" />
            {job.salary}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 text-primary/70" />
          Posted {job.postedAt}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className={`text-xs ${levelColors[job.level] || ""}`}>
          {job.level} Level
        </Badge>
        <Badge variant="outline" className="text-xs border-border/50">
          {job.category}
        </Badge>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Job Description</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
      </div>

      {/* Skills */}
      {job.skills.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs bg-muted/50">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Apply button fixed at bottom */}
    <div className="p-4 border-t border-border/30">
      <Button
        className="w-full"
        variant="cyber"
        onClick={() => window.open(job.applyUrl, "_blank", "noopener,noreferrer")}
      >
        Apply on Company Site
        <ExternalLink className="h-4 w-4 ml-2" />
      </Button>
    </div>
  </div>
);

const CyberJobs = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedRemote, setSelectedRemote] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [selectedJob, setSelectedJob] = useState<CyberJob | null>(null);
  const [jobs, setJobs] = useState<CyberJob[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async (query: string, country: string) => {
    setLoading(true);
    setError(null);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const params = new URLSearchParams({
        query: query || "cyber security",
        country,
        results_per_page: "30",
      });
      const url = `https://${projectId}.supabase.co/functions/v1/fetch-jobs?${params}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.status}`);

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      setJobs(result.jobs || []);
      setTotalJobs(result.total || 0);
      setSelectedJob(null);
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(searchQuery, selectedCountry);
  }, [searchQuery, selectedCountry]);

  const handleSearch = () => setSearchQuery(searchInput);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesLevel = selectedLevel === "All" || job.level === selectedLevel;
      const matchesRemote = selectedRemote === "All" || job.remote === selectedRemote;
      const matchesType = selectedType === "All" || job.type === selectedType;
      return matchesLevel && matchesRemote && matchesType;
    });
  }, [jobs, selectedLevel, selectedRemote, selectedType]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 flex flex-col h-screen">
        {/* Top bar */}
        <div className="border-b border-border/30 bg-card/30 px-4 py-4">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">
                CyberQuest <span className="text-primary">Job Board</span>
              </h1>
              <span className="text-xs text-muted-foreground ml-auto">
                Powered by Adzuna
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 h-9 text-sm bg-background/50 border-border/50"
                />
              </div>
              <Button onClick={handleSearch} size="sm" variant="cyber" className="h-9">
                Search
              </Button>

              <div className="hidden md:flex items-center gap-2 ml-2 border-l border-border/30 pl-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-[110px] h-9 text-xs bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[100px] h-9 text-xs bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["All", "Entry", "Mid", "Senior", "Lead", "Executive"].map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedRemote} onValueChange={setSelectedRemote}>
                  <SelectTrigger className="w-[100px] h-9 text-xs bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["All", "Remote", "Hybrid", "On-site"].map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[120px] h-9 text-xs bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["All", "Full time", "Part time", "Internship", "Contract"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => fetchJobs(searchQuery, selectedCountry)}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Quick search tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {searchSuggestions.map((term) => (
                <button
                  key={term}
                  onClick={() => { setSearchInput(term); setSearchQuery(term); }}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content: two-column layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Job list */}
          <div className="w-full lg:w-[420px] xl:w-[480px] border-r border-border/30 flex flex-col bg-card/20 shrink-0">
            <div className="px-4 py-2 border-b border-border/20 bg-card/30">
              <p className="text-xs text-muted-foreground">
                {loading ? "Loading..." : (
                  <>
                    <span className="text-foreground font-medium">{filteredJobs.length}</span> jobs
                    {totalJobs > 0 && <span> · {totalJobs.toLocaleString()} total</span>}
                    {searchQuery && <span> for "<span className="text-primary">{searchQuery}</span>"</span>}
                  </>
                )}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                  <p className="text-sm text-muted-foreground">Fetching jobs...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">{error}</p>
                  <Button variant="outline" size="sm" onClick={() => fetchJobs(searchQuery, selectedCountry)}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Retry
                  </Button>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No jobs match your filters.</p>
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <JobListItem
                    key={job.id}
                    job={job}
                    isSelected={selectedJob?.id === job.id}
                    onClick={() => setSelectedJob(job)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right: Job detail */}
          <div className="hidden lg:flex flex-1 flex-col bg-background">
            {selectedJob ? (
              <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-primary/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Select a job</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Click on a job listing to view the full description and apply directly on the company's website.
                </p>
              </div>
            )}
          </div>

          {/* Mobile detail overlay */}
          {selectedJob && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background">
              <div className="pt-20 h-full">
                <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CyberJobs;
