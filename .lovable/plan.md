# Profile Page Redesign — LeetCode Style

Restructure `/profile` from the current stacked header + tab layout into a two-column dashboard that mirrors the reference screenshot, while keeping all existing data (XP, badges, activity heatmap, skills, certifications, socials, AI tutor avatar) and the badges dialog/claim flow intact.

## New layout

```text
┌───────────────────────────┬──────────────────────────────────────────────┐
│ LEFT SIDEBAR (sticky)     │ RIGHT MAIN COLUMN                            │
│                           │                                              │
│ [Avatar] Name             │ ┌── XP Progress / Rank card ──────────────┐  │
│         @username         │ │  XP: 1,414  ·  Rank #...  Streak: 3    │  │
│         Rank #...         │ │  [sparkline of weekly XP]              │  │
│                           │ └────────────────────────────────────────┘  │
│ Followers · Following     │                                              │
│                           │ ┌── Progress donut ──┐ ┌── Badges card ──┐  │
│ [ Edit Profile ]          │ │  41 / 120 Solved   │ │ Badges: 7       │  │
│                           │ │  Easy/Med/Hard     │ │ Locked: <next>  │  │
│ 📍 Location               │ └────────────────────┘ └─────────────────┘  │
│ 🎓 Certifications count   │                                              │
│ 🐙 GitHub                 │ ┌── Submissions/Activity heatmap ─────────┐  │
│ in LinkedIn               │ │  104 actions in past year · streak 3    │  │
│ 🐦 Twitter / 🌐 Website   │ │  [ActivityHeatmap reused]               │  │
│ ─────────────────         │ └─────────────────────────────────────────┘  │
│ Community Stats           │                                              │
│  • Views                  │ ┌── Tabs: Recent · Skills · Certs · Socials │
│  • Solutions              │ │       · Interests · Summary · AI Tutor   │
│  • Discuss                │ │  (content area)                          │
│  • Reputation             │ └─────────────────────────────────────────┘  │
│ ─────────────────         │                                              │
│ Languages / Skills        │                                              │
│  [Java] 41 solved         │                                              │
└───────────────────────────┴──────────────────────────────────────────────┘
```

- Desktop (`lg+`): two columns, sidebar `w-72` sticky, main fluid.
- Mobile / `md`: sidebar collapses above the main column.
- Page max width raised from `max-w-5xl` to `max-w-6xl`.

## Sections in detail

**Left sidebar (`ProfileSidebar`)**
- Large square avatar (rounded) + name + `@username` + `Rank #N`.
- Following / Followers row (placeholder 0 / 0 unless data exists).
- `Edit Profile` button (opens existing edit flow / scrolls to Overview tab).
- Inline list of meta: location, school/cert count, GitHub, LinkedIn, Twitter, website — only render rows that have data, each with its lucide icon.
- Community Stats block: Views, Solutions, Discuss, Reputation with a "Last week" delta line — wire to existing GameContext values where available (e.g. `chatMessagesSent` → Discuss, `cryptoPuzzlesSolved + sqlLevelsCompleted` → Solutions). Unknown ones display `0`.
- Languages block: render existing `skills[]` as pill + count (count = `points` proxy or omitted).

**Right column top — XP / rank card**
- Big number (XP), subtitle (rank or percentile), small inline trend caption.
- Lightweight inline SVG sparkline (no new lib) from a derived weekly XP series; if no data, show a flat line.

**Progress + Badges row**
- Progress donut: SVG conic/stroke arc showing earned achievements / total. Center shows `earned / total Solved` + small "X attempting" line (locked count). Right side mini list: Easy / Med / Hard split — map our categories (e.g. crypto / sql / terminal) into 3 difficulty-style chips with counts.
- Badges card: total badges number, locked "next badge" preview (first item from `claimable` or `nearUnlock`), keeps the existing dialog — clicking the card opens `badgesOpen` (reuse current dialog & claim flow untouched).

**Submissions / Activity card**
- Header: "N activities in the past year · Total active days · Max streak".
- Body: reuse `ActivityHeatmap` as-is.

**Tabs strip (slimmed)**
- Keep existing tab system but restyle as a compact pill row inside a card, default `Recent`. Reuse current tab panels for Summary / Socials / Skills / Certifications / Interests / AI Tutor / Activity. "Recent" tab shows last earned achievements list (from `userAchievements` joined with `achievements`, newest first).

## Components

New files:
- `src/components/profile/ProfileSidebar.tsx` — sticky left column.
- `src/components/profile/StatDonut.tsx` — SVG donut for progress.
- `src/components/profile/XPSparkline.tsx` — inline SVG sparkline.
- `src/components/profile/CommunityStats.tsx` — sidebar stats list.

Edited:
- `src/pages/Profile.tsx` — restructure JSX into sidebar + main grid; keep all existing state, edit modals, badges dialog, claim handler, and tab panels.

## Out of scope

- No backend / schema / RPC changes.
- No new dependencies (charts done with plain SVG).
- The existing badges dialog, claim animation, and `useAchievements` flow are untouched.
- Color usage stays on semantic tokens (`primary`, `secondary`, `muted`, `card`, `border`) — no LeetCode-specific hex.
