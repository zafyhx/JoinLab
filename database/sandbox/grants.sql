-- ============================================================
-- Grants for read-only role on sandbox schemas (PostgreSQL)
-- NOTE: Role creation is handled by sandbox-rebuild.ts (idempotent).
-- ============================================================

GRANT USAGE ON SCHEMA sb_akademik TO joinlab_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA sb_akademik TO joinlab_ro;

GRANT USAGE ON SCHEMA sb_toko TO joinlab_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA sb_toko TO joinlab_ro;

GRANT USAGE ON SCHEMA sb_perpustakaan TO joinlab_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA sb_perpustakaan TO joinlab_ro;
