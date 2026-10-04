# Sprint 10 — Collect: Presence & Real-Time Sync

**Status:** ✅ COMPLETE (backfilled 2026-10-03 — this doc did not exist; reconstructed from code and inline comments in `CollectPage.tsx`, since no sprint doc was written at the time)
**Shipped:** before 2026-10-03, exact date unknown (no commit/doc trail — see note below)

> **Note on numbering:** This sprint number collides with [Sprint 9 — Compliance Layer](sprint-09-compliance-layer.md), which covers an unrelated feature track (DPDP/PII/CTRI ingestion). `CollectPage.tsx` itself is attributed to "Sprint 9" in `App.tsx`'s route comment, and these presence features are commented inline as "Sprint 10." It's unclear whether sprint numbers were tracked per-feature-track rather than globally, or whether this was simply never reconciled with the compliance-layer sprint. Flagging rather than guessing — ask whoever did this work if the numbering matters to them.

---

## Goal

Make `CollectPage` (`/collect`, a separate REDCap/ODK-inspired field-data-collection tool from the Postgres-backed `EDCPage`) usable by more than one person on more than one browser tab at once, without a backend.

## What Shipped

### Cross-tab sync via `BroadcastChannel`
- Channel name: `nextrial_collect_sync`
- On any local state change, the tab posts a `state_update` message; every other tab listening on the same channel applies it and re-persists to `localStorage` (key `nextrial_collect_v1`)
- A small "synced" toast fires when a tab receives an update from elsewhere

### Presence indicators
- Each tab announces itself (`presence_ping`: id, display name from the logged-in user, an assigned color, current sub-tab) on mount and every 4s (heartbeat)
- Other tabs reply in kind, building a live roster of who's "in" the page right now, shown as colored avatars
- Stale presence entries (no ping in >12s) are pruned client-side
- A `presence_leave` message fires on unmount/tab close

## Important Limitation — read before relying on this for a real multi-user claim

**`BroadcastChannel` only works same-origin, same-browser.** This is tab-to-tab sync within one person's browser (e.g., a PI with the Collect page open in two tabs), **not** multi-device or multi-coordinator sync across different computers. If a site coordinator on one laptop and a PI on another both open `/collect`, they will **not** see each other or each other's changes — each gets an independent `localStorage` copy. Don't describe this feature to a sponsor or PI as real-time multi-user collaboration without that caveat; the real EDC module (`EDCPage.tsx`, Postgres-backed) is the one with actual cross-device persistence.

## Relationship to EDCPage

This remains architecturally separate from the Postgres-backed `EDCPage.tsx` (Sprint 5/7). Two EDC-like tools currently exist in the product; see `full.md` §3 for the full comparison. Converging them is listed as a Phase 3 item in the current roadmap.
