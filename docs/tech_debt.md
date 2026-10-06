# NexTrial — Technical Debt Register

Tracked here so pre-existing issues don't get misattributed to new sprints.
Each item: severity, file, what it is, and what a fix requires.

---

## Other Known Debt

### 🔴 Critical — most API routes have no authentication at all (found 2026-10-04, NOT fixed)
`ai`, `analysis`, `edc`, `match`, `protocol`, and `research` routes never call `authenticateToken`
— only `agent`, `notification`, and `user` routes do (see `backend/src/routes/*.routes.ts`: grep for
`authenticateToken`). This means **any unauthenticated request can read, create, update, and delete
any protocol, EDC form/patient/entry, and run AI/match/research/analysis calls** — there's no login
check at all on those routes today, independent of the cookie-vs-localStorage question.

This is distinct from (and bigger than) the RBAC work done 2026-10-04 (see Resolved Debt below),
which only gated two narrow things: the validation-rules toggle endpoint and the new audit-log
endpoint. It was deliberately **not** fixed in that pass, because gating it properly needs a product
decision, not just a middleware line:
- `Protocol`, `CrfForm`/`EdcPatient`/`EdcEntry` etc. have **no owner/userId field at all** — adding
  `authenticateToken` alone would require *being logged in* but every logged-in user would still see
  *everyone's* protocols and EDC data (no per-user scoping exists in the schema to filter by).
- Is anonymous access to Research/Match/Analysis intentional right now (e.g. for investor/sales
  demos without a login wall), or an oversight? That changes whether the fix is "add auth" or
  "add auth + ownership columns + scope every query," which is a materially bigger migration.

**Fix effort:** 30 min to bolt on `authenticateToken` everywhere (cheap, but doesn't actually scope
data per-user — just adds a login wall). Proper fix (add `userId`/`ownerId` columns + migration +
scope every controller query + decide the demo-access question) is more like 1–2 days.

### Email service stub (auth.controller.ts) — ✅ fixed 2026-10-04
Password reset and email verification tokens exist in the DB but no email was ever sent (`TODO`
comments in `auth.controller.ts`). Fixed via `backend/src/services/email.service.ts` — provider-
agnostic SMTP (nodemailer), so it works with SendGrid/SES/Mailgun/Postmark/Gmail by just setting
`SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM` in `.env`. **If `SMTP_HOST` is unset, emails are
logged to the console instead of sent** (dev fallback) — so this still needs real SMTP credentials
configured in production (`.env.production.example` has the placeholders) before password reset
actually reaches anyone's inbox.

### JWT in localStorage (XSS risk) — ✅ fixed 2026-10-04
Tokens were stored in `localStorage`, readable by any injected script. Migrated to `httpOnly`
cookies (`access_token`, `refresh_token`; `sameSite: 'lax'`, `secure` in production) set by the
backend on login/register/refresh — see `auth.controller.ts` / `auth.middleware.ts`. Frontend no
longer stores or reads a token at all (`axios.defaults.withCredentials = true` / `credentials:
'include'` on fetch calls carries the cookie automatically); `localStorage.auth_user` remains only
as a non-sensitive cached display copy (name/role, not a credential) for instant UI render before
`getCurrentUser()` confirms the session. Bonus side effect: the SSE agent-stream endpoint no longer
needs `?token=...` in the URL (it was only there because `EventSource` couldn't set a header —
`EventSource(url, { withCredentials: true })` sends the cookie instead), which also closes a
token-in-server-logs/browser-history leak that existed alongside the localStorage issue.
**Residual:** `JWT_REFRESH_SECRET` is still defined in `.env.production.example` /
`docker-compose.prod.yml` but was never actually used in `auth.utils.ts` — both access and refresh
tokens are signed with the single `JWT_SECRET`. Not fixed here (changing which secret signs which
token type is a separate, deliberate security decision); flagging so it isn't mistaken for "already
using two secrets."

### PIIRedactor had two real redaction gaps (fixed 2026-10-04)
Writing the adversarial test suite required by `sprints/sprint-09-compliance-layer.md` (36 cases,
`backend/src/services/pii.redactor.test.ts`) surfaced two genuine false negatives, not just missing
tests: the DOB regex's `\d{1,2}` cap on the first group meant `YYYY-MM-DD` dates could never match
(despite the code comment claiming they did), and the MRN regex's `[-:\s]?` only consumed one
separator character, so `"MRN: 004521"` (colon *and* space) passed through unredacted. Both fixed
in `pii.redactor.ts` — see the sprint-09 doc for detail. **No backend test runner existed before
this** (no vitest/jest, no `test` script) — added via Node's built-in test runner (`tsx --test`,
zero new dependencies) rather than installing vitest, since that install was OOM-killed in this
environment. `npm test` in `backend/` now works.

### queryHash rainbow-table risk (multi-tenant) — ✅ fixed 2026-10-04
`AgentAuditLog.queryHash` was SHA-256[:16] of the raw query text, unsalted — two users submitting
the same query produced identical hashes, a cross-tenant correlation risk once multi-tenant ships.
Fixed in `agent.orchestrator.ts`'s `hashInput()`: now salts with `userId` before hashing
(`sha256(userId:query)`).

### No ownership check on agent artifact downloads (found + fixed 2026-10-04)
`GET /api/agent/artifacts/:id/download` required being logged in (the whole `agent` router is
behind `authenticateToken`) but never checked that the artifact's session belonged to the
requesting user — any authenticated user could download any artifact (including another PI's
generated PDFs/reports) just by knowing or guessing its ID. Fixed by joining through to the
artifact's session and checking `session.userId === requester.userId` in
`agent.controller.ts#downloadArtifact`.

### RBAC — `User.role` now enforced in two places (2026-10-04), most routes still don't check it
`requireRole()` middleware already existed in `auth.middleware.ts` but was never called anywhere.
Now applied to: `PATCH /api/protocols/validation-rules/:ruleId/toggle` (admin-only — toggling a
rule is global, affects every user's validation runs) and `GET /api/agent/audit` (self-service by
default; `?userId=<other>` requires `role === 'admin'`). This is a narrow, deliberately bounded
fix — it does **not** mean RBAC is enforced broadly. See the "most API routes have no
authentication at all" item above; role checks are meaningless on routes that don't even check
*who* is logged in yet.

---

## Resolved Debt

| Item | Resolution | Sprint |
|---|---|---|
| Dead code: ProtocolBuilderPage.OLD.tsx etc. | Deleted | Sprint 0 |
| 85 .md junk files | Deleted | Sprint 0 |
| Validation sidebar cluttering builder | Removed entirely | Sprint 2 |
| Mock PDF export | Replaced with jsPDF | Sprint 6 |
| localStorage-only EDC | PostgreSQL backend added | Sprint 7 |
| No e-signature on CRF | SignatureModal shipped | Sprint 7 |
| No audit trail for agent actions | AgentAuditLog shipped | Sprint 8 |
| No PII protection for match tab | PIIRedactor shipped | Sprint 8 |
| 24 backend TypeScript errors (the former "Pre-existing TypeScript Errors" section below) | All fixed 2026-10-03 — see detail below | — |
| JWT in localStorage (XSS risk) | Migrated to httpOnly cookies | — |
| Email service stub — no password reset/verification email ever sent | nodemailer SMTP service, console fallback in dev | — |
| `AgentAuditLog.queryHash` unsalted | Salted with `userId` | — |
| No ownership check on agent artifact downloads | Fixed — checks `session.userId` | — |
| `requireRole()` middleware existed but was never used | Applied to validation-rules toggle + new audit endpoint | — |

### Detail: the 24 backend TypeScript errors (fixed 2026-10-03)

- **`req.params` destructuring (`edc.controller.ts`, `notification.controller.ts`, `user.controller.ts`, ~14 errors):** `@types/express` is pinned to `^5.0.0` while the actual `express` dependency is `^4.21.2` — the v5 types allow `string | string[]` on route params (for Express 5's splat-route support), which Express 4 never actually produces at runtime. Fixed by casting destructured params, e.g. `const { id } = req.params as { id: string };`. Purely a types-vs-runtime mismatch; no behavior change. (A more thorough fix would be pinning `@types/express@^4` to match the real `express` major version — not done here to keep the change minimal, but worth considering.)
- **`protocol.controller.ts` create-input errors (objective/criterion/intervention, 3 errors):** Prisma's `create()` data type is a union of `CheckedCreateInput | UncheckedCreateInput`; spreading a zod-validated object against that union confused inference. Fixed by casting to the explicit `*UncheckedCreateInput` type (these records are always created with flat FK fields, never nested `connect`, so this is the correct variant). The `Intervention` create was also missing `orderIndex` (the old Category 2 bug) — now set to `0`.
- **`isComplete` on `ProtocolSection` (1 error) — this was a real latent bug, not just a type error.** The `is_complete` column existed in the original schema, was dropped in migration `20260209114231_fix_missing_columns`, but the frontend (`protocolService.ts`, `SectionNav.tsx`) and backend (`validation.service.ts`, `UpdateSectionSchema`) were never updated and kept reading/writing it. Any section-completion save was silently broken since that migration (Prisma throws on unknown fields at runtime for destructured update calls that happen to typecheck). Fixed by restoring the column: migration `20261003120000_restore_section_is_complete` adds `is_complete BOOLEAN NOT NULL DEFAULT false` back. **Run `npx prisma migrate deploy` (or `migrate dev` in dev) against your DB to apply it** — generating the Prisma client alone (done) only fixes the types, not the live schema.
- **`isEnabled` vs `isActive` (`validation-rules.controller.ts`, `seed-validation-rules.ts`, 2 errors):** code used a field name (`isEnabled`) that was never in the `ValidationRule` model — the real column is `isActive`. Fixed by using the correct field name; no schema change needed.
- **`unique_domain_code` (`seed.ts`, 1 error):** `ControlledTerminology`'s `@@unique([domain, code])` has no explicit name, so Prisma's generated compound-key name is `domain_code`, not `unique_domain_code`. Fixed to match.
- **`research.service.ts` relevance-score fields (4 errors):** `formatClinicalTrial`/`formatPubMedArticles` return object-literal types that don't declare `relevanceScore`/`queryStrategy`/`searchStrategy`; later code mutated the returned objects to add those fields, which TS correctly rejected. Fixed by building new objects with spread (`{ ...formatted, relevanceScore: ... }`) instead of mutating — same runtime result, no interface changes needed.

**Still true:** CI (`deploy.yml`) only typechecks the frontend, and `backend/Dockerfile` still runs `npx tsc --noEmitOnError false || true`, so a backend typecheck regression would again ship silently. Worth tightening CI to also run `cd backend && npx tsc --noEmit` as a blocking step, now that the backend is actually clean.
