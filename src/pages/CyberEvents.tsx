import React, { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  Search,
  Loader2,
  RefreshCw,
  AlertCircle,
  Flag,
  Trophy,
  GraduationCap,
  Mic,
  Wrench,
  BookOpen,
  Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CyberEvent {
  title: string;
  date: string;
  location: string;
  type: string;
  organizer: string;
  description: string;
  url: string;
  is_free: boolean;
  status: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  hackathon: { icon: Trophy, color: "text-yellow-400", label: "Hackathon" },
  ctf: { icon: Flag, color: "text-red-400", label: "CTF" },
  seminar: { icon: Mic, color: "text-blue-400", label: "Seminar" },
  workshop: { icon: Wrench, color: "text-green-400", label: "Workshop" },
  conference: { icon: Users, color: "text-purple-400", label: "Conference" },
  meetup: { icon: Users, color: "text-cyan-400", label: "Meetup" },
  training: { icon: GraduationCap, color: "text-orange-400", label: "Training" },
};

const statusColors: Record<string, string> = {
  upcoming: "bg-green-500/20 text-green-400 border-green-500/30",
  ongoing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-muted text-muted-foreground border-border",
};

const categories = [
  { value: "all", label: "All Events" },
  { value: "hackathon", label: "Hackathons" },
  { value: "ctf", label: "CTF" },
  { value: "seminar", label: "Seminars" },
  { value: "workshop", label: "Workshops" },
  { value: "conference", label: "Conferences" },
  { value: "meetup", label: "Meetups" },
  { value: "training", label: "Training" },
];

const CyberEvents: React.FC = () => {
  const [events, setEvents] = useState<CyberEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchEvents = async (category = "all") => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("cyber-events", {
        body: { category },
      });
      if (error) throw error;
      setEvents(data?.events || []);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive",
      });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(activeCategory);
  }, [activeCategory]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-24 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🛡️ Cyber Events — Tamil Nadu
          </h1>
          <p className="text-muted-foreground">
            Real-time hackathons, CTFs, seminars & community gatherings powered by AI search
          </p>
        </div>

        {/* Search + Refresh */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events, locations, organizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchEvents(activeCategory)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveCategory(cat.value)}
              className="whitespace-nowrap text-xs"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">
              Searching for cybersecurity events in Tamil Nadu...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <p>No events found. Try a different category or search.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((event, i) => {
              const config = typeConfig[event.type] || typeConfig.meetup;
              const Icon = config.icon;
              return (
                <Card
                  key={i}
                  className="bg-card border-border hover:border-primary/40 transition-colors"
                >
                  <CardContent className="p-5">
                    {/* Top row: type + status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        <span className={`text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.is_free && (
                          <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                            Free
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${statusColors[event.status] || statusColors.upcoming}`}
                        >
                          {event.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Meta */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{event.organizer}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    {/* CTA */}
                    {event.url ? (
                      <a href={event.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="w-full gap-2 text-xs">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Visit Organizer Site
                        </Button>
                      </a>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2 text-xs"
                        onClick={() => {
                          window.open(`https://www.google.com/search?q=${encodeURIComponent(event.title + " " + event.organizer + " Tamil Nadu")}`, "_blank");
                        }}
                      >
                        <Search className="h-3.5 w-3.5" />
                        Search for Event
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-[11px] text-muted-foreground mt-8">
          Events are fetched in real-time using AI search. Some details may need verification.
        </p>
      </div>
    </div>
  );
};

export default CyberEvents;
