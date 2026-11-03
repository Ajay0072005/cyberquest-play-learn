import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Settings,
  LogOut,
  MessageSquare,
  Award,
  BookOpen,
  FlaskConical,
  ShieldOff as SecurityLabIcon,
  ShieldAlert,
  ShieldCheck,
  Rss,
  Globe2,
  User,
  Compass,
  Menu,
  ChevronDown,
  Map,
  Terminal as TerminalIcon,
  Database,
  KeyRound,
  Gamepad2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo-transparent.png';
import { useAuth } from '@/context/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useModeratorRole } from '@/hooks/useModeratorRole';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Fragment, useState } from 'react';

type NavLeaf = { label: string; path: string; icon: React.ComponentType<{ className?: string }>; description?: string };
type NavGroup = { label: string; icon: React.ComponentType<{ className?: string }>; items: NavLeaf[] };
type NavEntry = NavLeaf | NavGroup;

const isGroup = (e: NavEntry): e is NavGroup => 'items' in e;

const navEntries: NavEntry[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Learn',
    icon: BookOpen,
    items: [
      { label: 'Sherlock Course', path: '/sherlock', icon: BookOpen, description: 'Story-driven cybersecurity course' },
      { label: 'Career Paths', path: '/career-roles', icon: Compass, description: 'Role-based learning roadmaps' },
      { label: 'Roadmap', path: '/roadmap', icon: Map, description: 'Foundation skills and tracks' },
    ],
  },
  {
    label: 'Practice',
    icon: FlaskConical,
    items: [
      { label: 'Practical Labs', path: '/labs', icon: FlaskConical, description: 'Hands-on mini labs' },
      { label: 'Security Labs', path: '/security-labs', icon: SecurityLabIcon, description: 'Guided attack & defence labs' },
      { label: 'Terminal', path: '/terminal', icon: TerminalIcon, description: 'Linux terminal challenges' },
      { label: 'SQL Injection', path: '/sql-game', icon: Database, description: 'SQLi training game' },
      { label: 'Crypto Puzzles', path: '/crypto-puzzles', icon: KeyRound, description: 'Cipher and crypto challenges' },
      { label: 'Cyber Game', path: '/cyber-game', icon: Gamepad2, description: '3D mission city' },
    ],
  },
  {
    label: 'Compete',
    icon: Trophy,
    items: [
      { label: 'Leaderboard', path: '/leaderboard', icon: Trophy, description: 'Global XP rankings' },
      { label: 'Achievements', path: '/achievements', icon: Award, description: 'Badges you have earned' },
    ],
  },
  { label: 'Cyber Feeds', path: '/cyber-feeds', icon: Rss },
  { label: 'War Room', path: '/threat-map', icon: Globe2 },
  { label: 'AI Chat', path: '/chat', icon: MessageSquare },
];

export const TopNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { isAdmin } = useAdminRole();
  const { isModerator } = useModeratorRole();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const isActivePath = (path: string) => location.pathname === path;
  const isActiveGroup = (group: NavGroup) =>
    group.items.some((i) => location.pathname === i.path || location.pathname.startsWith(i.path + '/'));

  const moderatorItem: NavLeaf | null = isModerator
    ? { label: 'Moderator', path: '/moderator', icon: ShieldCheck }
    : null;
  const adminItem: NavLeaf | null = isAdmin
    ? { label: 'Admin', path: '/admin/roles', icon: ShieldAlert }
    : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logo} alt="CyberQuest" className="h-8 w-8" />
            <span className="text-lg font-cyber font-bold text-foreground hidden sm:inline">
              CyberQuest
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center" aria-label="Main navigation">
            {navEntries.map((entry, idx) => {
              const separatorBefore = idx === 1 || idx === 4;
              if (!isGroup(entry)) {
                const active = isActivePath(entry.path);
                const Icon = entry.icon;
                return (
                  <Fragment key={entry.path}>
                    {separatorBefore && (
                      <div aria-hidden="true" className="h-7 w-px bg-border/60 mx-1.5 flex-shrink-0" />
                    )}
                    <Link
                      to={entry.path}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-md transition-colors min-w-[72px] relative outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        active
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{entry.label}</span>
                      {active && (
                        <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full" />
                      )}
                    </Link>
                  </Fragment>
                );
              }

              const active = isActiveGroup(entry);
              const Icon = entry.icon;
              return (
                <Fragment key={entry.label}>
                  {separatorBefore && (
                    <div aria-hidden="true" className="h-7 w-px bg-border/60 mx-1.5 flex-shrink-0" />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          'flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-md transition-colors min-w-[72px] relative outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          active
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium flex items-center gap-0.5">
                          {entry.label}
                          <ChevronDown className="h-3 w-3 opacity-60" />
                        </span>
                        {active && (
                          <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-64">
                      <DropdownMenuLabel>{entry.label}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {entry.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <DropdownMenuItem
                            key={item.path}
                            onSelect={() => navigate(item.path)}
                            className="gap-3 py-2 cursor-pointer"
                          >
                            <ItemIcon className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{item.label}</span>
                              {item.description && (
                                <span className="text-xs text-muted-foreground">{item.description}</span>
                              )}
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Fragment>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {(moderatorItem || adminItem) && (
              <div className="hidden lg:flex items-center gap-1">
                {moderatorItem && (
                  <Button
                    variant={isActivePath(moderatorItem.path) ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => navigate(moderatorItem.path)}
                    className="gap-1.5"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Mod
                  </Button>
                )}
                {adminItem && (
                  <Button
                    variant={isActivePath(adminItem.path) ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => navigate(adminItem.path)}
                    className="gap-1.5"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Admin
                  </Button>
                )}
              </div>
            )}

            {/* Profile menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Open profile menu" className="flex items-center gap-2 rounded-full border border-border bg-background hover:bg-muted/50 transition-colors pl-1 pr-3 py-1">
                  <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user && (
                  <>
                    <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onSelect={() => navigate('/profile')} className="gap-2 cursor-pointer">
                  <User className="h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/settings')} className="gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => signOut()}
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0 overflow-y-auto">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <img src={logo} alt="CyberQuest" className="h-7 w-7" />
                  <span className="font-cyber font-bold">CyberQuest</span>
                </div>
                <div className="p-2 space-y-1">
                  {navEntries.map((entry) => {
                    if (!isGroup(entry)) {
                      const Icon = entry.icon;
                      const active = isActivePath(entry.path);
                      return (
                        <Link
                          key={entry.path}
                          to={entry.path}
                          onClick={() => setMobileOpen(false)}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm',
                            active
                              ? 'bg-primary/15 text-primary'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {entry.label}
                        </Link>
                      );
                    }
                    const Icon = entry.icon;
                    const isOpen = openGroups[entry.label] ?? isActiveGroup(entry);
                    return (
                      <div key={entry.label} className="pt-2">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`mobile-group-${entry.label}`}
                          onClick={() => setOpenGroups((prev) => ({ ...prev, [entry.label]: !isOpen }))}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs uppercase tracking-wide text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            isOpen && 'text-primary'
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="flex-1 text-left">{entry.label}</span>
                          <ChevronDown
                            className={cn('h-3.5 w-3.5 transition-transform duration-200', isOpen && 'rotate-180')}
                          />
                        </button>
                        <div
                          id={`mobile-group-${entry.label}`}
                          className={cn(
                            'grid transition-[grid-template-rows] duration-200 ease-out',
                            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                          )}
                        >
                          <div className="overflow-hidden min-h-0">

                            {entry.items.map((item) => {
                              const ItemIcon = item.icon;
                              const active = isActivePath(item.path);
                              return (
                                <Link
                                  key={item.path}
                                  to={item.path}
                                  onClick={() => setMobileOpen(false)}
                                  aria-current={active ? 'page' : undefined}
                                  className={cn(
                                    'flex items-center gap-3 px-5 py-2 rounded-md text-sm',
                                    active
                                      ? 'bg-primary/15 text-primary'
                                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                  )}
                                >
                                  <ItemIcon className="h-4 w-4" />
                                  {item.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(moderatorItem || adminItem) && (
                    <div className="pt-2 border-t border-border mt-2">
                      {moderatorItem && (
                        <Link
                          to={moderatorItem.path}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <ShieldCheck className="h-4 w-4" /> Moderator
                        </Link>
                      )}
                      {adminItem && (
                        <Link
                          to={adminItem.path}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <ShieldAlert className="h-4 w-4" /> Admin
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
