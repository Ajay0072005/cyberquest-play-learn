import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Newspaper, ExternalLink, RefreshCw, Shield, Bug, Database, Globe, Clock, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface NewsArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category: string;
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  all: { label: 'All News', icon: Globe, color: 'bg-primary/20 text-primary' },
  general: { label: 'General', icon: Shield, color: 'bg-blue-500/20 text-blue-400' },
  vulnerabilities: { label: 'Vulnerabilities', icon: Bug, color: 'bg-red-500/20 text-red-400' },
  breaches: { label: 'Data Breaches', icon: Database, color: 'bg-orange-500/20 text-orange-400' },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return '';
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const CyberNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchNews = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('cyber-news');
      if (fnError) throw fnError;
      if (data?.success) {
        setArticles(data.articles);
      } else {
        throw new Error(data?.error || 'Failed to load news');
      }
    } catch (e: any) {
      console.error('News fetch error:', e);
      setError('Unable to load news feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const query = search.trim().toLowerCase();
  const filtered = articles
    .filter(a => filter === 'all' || a.category === filter)
    .filter(a => !query || a.title.toLowerCase().includes(query) || a.description.toLowerCase().includes(query) || a.source.toLowerCase().includes(query));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20">
              <Newspaper className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-cyber font-bold text-foreground">Cyber News Feed</h1>
              <p className="text-sm text-muted-foreground">Real-time cybersecurity news from trusted sources</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchNews} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(categoryConfig).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(key)}
                className="gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" />
                {cfg.label}
                {key !== 'all' && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                    {articles.filter(a => a.category === key).length}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles by keyword, source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4 text-center text-destructive">{error}</CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>
        )}

        {/* Articles */}
        {!loading && !error && (
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="grid gap-4 md:grid-cols-2 pr-4">
              {filtered.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No articles found for this category.
                  </CardContent>
                </Card>
              ) : (
                filtered.map((article, idx) => {
                  const cat = categoryConfig[article.category] || categoryConfig.general;
                  return (
                    <Card
                      key={idx}
                      className="group hover:border-primary/40 transition-all duration-200 cursor-pointer"
                      onClick={() => window.open(article.link, '_blank', 'noopener')}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </CardTitle>
                          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] ${cat.color}`}>
                            {cat.label}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground font-medium">{article.source}</span>
                          {article.pubDate && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timeAgo(article.pubDate)}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {article.description || 'Click to read more...'}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CyberNews;
