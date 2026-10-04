-- Restores `is_complete` on `protocol_sections`.
--
-- This column existed in the original schema (20260208173819_init) and was dropped in
-- 20260209114231_fix_missing_columns as part of a cleanup. However, the frontend
-- (protocolService.ts, SectionNav.tsx) and backend (validation.service.ts,
-- UpdateSectionSchema in protocol.model.ts) were never updated to stop using it —
-- section-level completion tracking has been silently broken (Prisma throws on
-- unknown field) since that drop. Re-adding it restores the intended feature.
ALTER TABLE "protocol_sections" ADD COLUMN "is_complete" BOOLEAN NOT NULL DEFAULT false;
