-- Allow NULL for team slots in SEMIFINAL / FINAL placeholder fixtures.
-- Hibernate's `update` mode will not widen NOT NULL → NULL automatically,
-- so we run this as a DataSource-level migration on startup.
ALTER TABLE match_fixtures MODIFY COLUMN team1_id BIGINT NULL;
ALTER TABLE match_fixtures MODIFY COLUMN team2_id BIGINT NULL;
