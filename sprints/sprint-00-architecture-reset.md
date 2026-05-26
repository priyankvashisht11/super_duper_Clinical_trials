# Sprint 0 — Architecture Reset + Branding

**Status:** ✅ COMPLETE  
**Shipped:** 2026-05-14  
**Duration:** 1 session

---

## Goal

Tear down the legacy scaffolding and establish NexTrial as the brand. Create a shared component foundation that every future sprint will build on.

---

## Deliverables

### Branding
- `index.html` — NexTrial title, favicon meta
- `TopNavigation` — branded nav with cobalt/teal gradient logo mark, all 6 tab links
- MUI theme — Primary `#0047AB` (cobalt), Secondary `#00897B` (teal), dark background `#0A1628`

### Shared Foundation
- `src/constants/trialStages.ts` — shared 6-stage definitions used across the whole app
  - Research → Protocol → Regulatory → Execute → Analyze → Submit
- `src/components/layout/LifecyclePipeline.tsx` — reusable pipeline component
  - Variants: `hero` (landing page), `dashboard`, `workspace`

### Pages Rebuilt
- `LandingPage` — hero, journey, features, India-first, CTA sections
- `DashboardPage` — authenticated PI dashboard with trial cards, stats, create-trial dialog

### Routing (App.tsx)
- `/dashboard` as main authenticated entry point
- `/research`, `/match`, `/regulatory`, `/edc`, `/analysis` stubs added

### Cleanup
- 85 `.md` files deleted (Windsurf/Kiro AI-generated junk)
- 9 dead `.tsx`/`.ts` files removed

---

## Acceptance Criteria

- [x] `npm run build` — 0 TypeScript errors
- [x] NexTrial brand shows in browser tab and nav
- [x] Dashboard renders authenticated trial cards
- [x] All 6 nav tabs are clickable (stubs OK)

---

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Brand name | NexTrial | Cleaner, more memorable than Clinical IQ |
| Primary colour | `#0047AB` cobalt | Medical trust without stale blue |
| Nav position | Top horizontal | Easier scanning for PI switching between tabs |
| Stage constants | Shared `trialStages.ts` | Single source of truth for pipeline labels |
