package com.eidcricketfest.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Runs one-time DDL alterations after Hibernate's auto-DDL has run.
 * We need team1_id / team2_id to be nullable for SEMIFINAL/FINAL placeholder
 * rows.
 * Hibernate `update` mode does NOT widen NOT NULL → NULL on existing columns.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SchemaMigration {

    private final JdbcTemplate jdbc;

    @EventListener(ApplicationReadyEvent.class)
    public void makeTeamColumnsNullable() {
        try {
            jdbc.execute(
                    "ALTER TABLE match_fixtures MODIFY COLUMN team1_id BIGINT NULL");
            log.info("SchemaMigration: team1_id set to NULLABLE");
        } catch (Exception e) {
            // Might fail if already nullable — that's fine
            log.debug("SchemaMigration team1_id: {}", e.getMessage());
        }
        try {
            jdbc.execute(
                    "ALTER TABLE match_fixtures MODIFY COLUMN team2_id BIGINT NULL");
            log.info("SchemaMigration: team2_id set to NULLABLE");
        } catch (Exception e) {
            log.debug("SchemaMigration team2_id: {}", e.getMessage());
        }
    }
}
