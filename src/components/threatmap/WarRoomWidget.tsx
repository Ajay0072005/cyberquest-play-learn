import { lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe2, ArrowUpRight, Radio } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useThreatFeed } from '@/hooks/useThreatFeed';
import { ATTACK_TYPES } from '@/components/threatmap/threatData';

const ThreatGlobe = lazy(() => import('@/components/threatmap/ThreatGlobe'));

/** Compact Cyber War Room globe for the Dashboard. Click anything to open the full view. */
export const WarRoomWidget: React.FC = () => {
  const navigate = useNavigate();
  const { active, total } = useThreatFeed(ATTACK_TYPES);

  return (
    <Card className="relative overflow-hidden h-[340px] md:h-[380px] border-border group">
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Loading globe…
            </div>
          }
        >
          <ThreatGlobe
            attacks={active}
            autoRotate
            compact
            onSelect={() => navigate('/threat-map')}
          />
        </Suspense>
      </div>

      {/* Header overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
        <div className="rounded-md bg-background/80 backdrop-blur px-3 py-2 border border-border">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Radio className="h-3 w-3 text-primary" />
            Cyber War Room
          </div>
          <div className="text-lg font-mono font-bold text-primary leading-tight">
            {total.toLocaleString()}
            <span className="text-xs text-muted-foreground font-sans font-medium ml-1">attacks tracked</span>
          </div>
        </div>
      </div>

      {/* Open full view */}
      <div className="absolute bottom-3 right-3">
        <Button asChild size="sm" variant="outline" className="bg-background/80 backdrop-blur border-border group-hover:border-primary/50">
          <a
            href="/threat-map"
            onClick={(e) => { e.preventDefault(); navigate('/threat-map'); }}
          >
            Open full view
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </a>
        </Button>
      </div>

      <Link
        to="/threat-map"
        aria-label="Open the full Cyber War Room"
        className="absolute inset-0 z-0"
      />
    </Card>
  );
};

export default WarRoomWidget;
