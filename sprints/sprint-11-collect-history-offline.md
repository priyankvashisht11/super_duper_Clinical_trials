# Sprint 11 — Collect: Version History & Offline Detection

**Status:** ✅ COMPLETE (backfilled 2026-10-03 — this doc did not exist; reconstructed from code and inline comments in `CollectPage.tsx`, since no sprint doc was written at the time)
**Shipped:** before 2026-10-03, exact date unknown (no commit/doc trail — see the numbering note in [Sprint 10](sprint-10-collect-presence.md))

---

## Goal

Give `CollectPage` a git-like safety net — a human-readable change history with the ability to roll back — plus basic offline awareness, since it's a field data-collection tool that coordinators may use with unreliable connectivity.

## What Shipped

### Commit-style version history (new "History" tab)
- Every meaningful state change (see `diffStates()`) is captured as a `Commit`: a 7-char random hash (`makeHash()`, like a short git SHA — not cryptographically derived from content, just a random id), timestamp, author (current user), a one-line message, a full list of diff lines, and a full snapshot of `CollectState` at that point
- `diffStates(prev, next)` produces human-readable diff lines: forms added/deleted, fields added/removed/renamed within a form, and record count deltas (`+ Submitted N new records`, `- Deleted N records`)
- Commits are persisted to `localStorage` (key `nextrial_collect_commits_v1`), newest first, with the most recent tagged "HEAD" in the UI
- A commit can be selected and its full snapshot restored (overwrites current state — no merge, it's a hard rollback)

### Offline detection
- Listens to the browser's `online`/`offline` events and shows a banner when offline
- Tracks a `pendingSync` counter conceptually, cleared on reconnect — **note:** since this page has no backend at all (pure localStorage + BroadcastChannel), "offline" here only means the browser's own network status, not an actual sync queue to a server. There's nothing to actually re-sync to on reconnect beyond other already-open tabs.

## Scope Note

Like [Sprint 10](sprint-10-collect-presence.md), this is all client-side state management with no backend. The version history is a genuinely useful safety net for a single user's browser session, but it does not back up data off-device — clearing browser storage loses all commits and records. If this tool is meant to handle real trial data rather than being a prototype/demo surface, it needs the same treatment `EDCPage` got in Sprint 7 (move to PostgreSQL) before field use.
