import { NavLink } from 'react-router-dom';
import { Newspaper, Clock, Briefcase, CalendarDays, ArrowRight, Rss } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const feeds = [
  {
    icon: Newspaper,
    title: 'Cyber News',
    description: 'Latest threat intelligence, breaches and vulnerability headlines from top security sources.',
    path: '/cyber-news',
  },
  {
    icon: Clock,
    title: 'Time Travel',
    description: 'Revisit historic cyber incidents and learn how landmark attacks shaped today’s defenses.',
    path: '/time-travel',
  },
  {
    icon: Briefcase,
    title: 'Cyber Jobs',
    description: 'Live security job listings — SOC, pentest, GRC, cloud security and more, updated daily.',
    path: '/jobs',
  },
  {
    icon: CalendarDays,
    title: 'Events',
    description: 'Upcoming hackathons, CTFs, conferences, workshops and meetups in your region.',
    path: '/events',
  },
];

const CyberFeeds: React.FC = () => {
  return (
    <DashboardLayout>
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Rss className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-cyber font-bold text-foreground">
            Cyber Feeds
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Your unified hub for everything happening in cybersecurity — news, history, careers and live events, all in one place.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {feeds.map(({ icon: Icon, title, description, path }) => (
          <NavLink key={path} to={path} className="group">
            <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
                <p className="text-sm text-muted-foreground flex-1 mb-4">{description}</p>
                <Button variant="ghost" size="sm" className="justify-start px-0 text-primary hover:text-primary hover:bg-transparent group-hover:gap-3 transition-all gap-2">
                  Open
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </NavLink>
        ))}
      </section>
    </DashboardLayout>
  );
};

export default CyberFeeds;
