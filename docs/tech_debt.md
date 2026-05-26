# NexTrial — Technical Debt Register

Tracked here so pre-existing issues don't get misattributed to new sprints.
Each item: severity, file, what it is, and what a fix requires.

---

## Pre-existing TypeScript Errors (~18 errors, present since before Sprint 8)

These errors exist in controllers that were built in earlier sprints and have not been touched since.
None of them affect runtime in practice (Express routes work despite the type mismatch), but they
will flag on `npx tsc --noEmit` and should be cleaned before production.

### Category 1: `string | string[]` param type (req.params / req.query)

**Files:** `edc.controller.ts`, `notification.controller.ts`, `user.controller.ts`  
**Count:** ~12 errors  
**Pattern:** `req.params['id']` returns `string | string[]` in Express types but Prisma expects `string`.

```typescript
// Current (broken):
const id = req.params['id'];  // string | string[]

// Fix:
const id = req.params['id'] as string;
// or use Express's typed param accessor: req.params.id
```

**Fix effort:** 30 minutes. Low risk — just add `as string` casts or switch to dot notation.

### Category 2: Missing `orderIndex` on Intervention create (`protocol.controller.ts`)

**File:** `backend/src/controllers/protocol.controller.ts`, line 218  
**Count:** 1 error  
**Pattern:** Prisma's `InterventionUncheckedCreateInput` requires `orderIndex` but it's not being set.

```typescript
// Fix: add orderIndex to the create payload
orderIndex: 0,  // or compute from existing intervention count
```

**Fix effort:** 5 minutes. Low risk.

### Category 3: `isComplete` property missing on ProtocolSection type (`protocol.controller.ts`)

**File:** `backend/src/controllers/protocol.controller.ts`, line 303  
**Count:** 1 error  
**Pattern:** Code references `.isComplete` but this field doesn't exist on the Prisma-generated type.
Likely a field that was removed from the schema at some point.

```typescript
// Fix: either add isComplete to the schema or remove the reference
```

**Fix effort:** 10 minutes. Needs schema investigation.

---

## Other Known Debt

### Email service stub (auth.controller.ts)
Password reset and email verification tokens exist in the DB but no email is ever sent.
`TODO` comments in `auth.controller.ts`. Needs: Nodemailer + SendGrid/SES or similar.
**Fix effort:** 2–3 hours. Blocks full auth flow (users can't reset passwords).

### JWT in localStorage (XSS risk)
Tokens stored in `localStorage` / `sessionStorage` — accessible to any JS on the page.
Proper fix: `httpOnly` cookie with `SameSite=Strict`. Current state is acceptable for internal
prototype but must change before public access.
**Fix effort:** 1 day (requires frontend + backend cookie handling changes).

### queryHash rainbow-table risk (multi-tenant)
`AgentAuditLog.queryHash` is SHA-256[:16] of the query, unsalted. In a single-tenant prototype
this is fine. When multi-tenant is added (Phase 6), salt with userId to prevent cross-tenant
correlation. Documented in sprint-09-compliance-layer.md.
**Fix effort:** 30 minutes when multi-tenant work begins.

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
