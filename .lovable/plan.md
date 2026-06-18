# Cyber Feeds Hub

Create a new `/cyber-feeds` hub page that groups the four existing feed-style pages into one entry point. The existing pages (`/cyber-news`, `/cyber-time-travel`, `/cyber-jobs`, `/events`) stay as-is and keep their own sidebar links.

## What gets built

**New page: `src/pages/CyberFeeds.tsx`**
- Uses `DashboardLayout`
- Hero header: title "Cyber Feeds", short subtitle, single H1
- 4 feature cards in a responsive grid (1 col mobile / 2 col tablet / 4 col desktop):
  1. Cyber News — icon `Newspaper`, blurb about latest threat intel headlines → `/cyber-news`
  2. Time Travel — icon `History`, blurb about historic cyber events → `/cyber-time-travel`
  3. Cyber Jobs — icon `Briefcase`, blurb about live security job listings → `/cyber-jobs`
  4. Events — icon `CalendarDays`, blurb about hackathons / CTFs / conferences → `/events`
- Each card: hover lift, icon chip, title, 1–2 line description, "Open" button using `NavLink`
- Uses semantic tokens only (no hardcoded colors), matches existing dark navy / lime theme

**Routing: `src/App.tsx`**
- Add `<Route path="/cyber-feeds" element={<ProtectedRoute><CyberFeeds /></ProtectedRoute>} />`

**Sidebar: `src/components/DashboardSidebar.tsx`**
- Add one new entry "Cyber Feeds" (icon `Rss` or `LayoutGrid`) linking to `/cyber-feeds`
- Place it just above the existing News / Time Travel / Jobs / Events links so it reads as the group overview
- Keep the existing 4 links untouched

**Bottom nav (`src/components/BottomNav.tsx`)** — only if it currently lists any of these 4 feeds; add Cyber Feeds alongside. No removals.

## Out of scope
- No changes to the four existing feed pages, their edge functions, or data fetching
- No redirects, no removed routes
- No backend / DB changes
