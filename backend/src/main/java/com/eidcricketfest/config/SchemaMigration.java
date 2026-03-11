package com.eidcricketfest.config;

import java.sql.DatabaseMetaData;

import javax.sql.DataSource;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Runs one-time DDL alterations after Hibernate's auto-DDL has run.
 * We need team1_id / team2_id to be nullable for SEMIFINAL/FINAL placeholder
 * rows.
 * Hibernate `update` mode does NOT widen NOT NULL → NULL on existing columns.
 * Supports both MySQL (MODIFY COLUMN) and PostgreSQL (ALTER COLUMN DROP NOT
 * NULL).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SchemaMigration {

  private final JdbcTemplate jdbc;
  private final DataSource dataSource;

  @EventListener(ApplicationReadyEvent.class)
  public void makeTeamColumnsNullable() {
    boolean isPostgres = isPostgresDatabase();
    makeColumnNullable("team1_id", isPostgres);
    makeColumnNullable("team2_id", isPostgres);
  }

  private void makeColumnNullable(String column, boolean isPostgres) {
    String sql = isPostgres
        ? "ALTER TABLE match_fixtures ALTER COLUMN " + column + " DROP NOT NULL"
        : "ALTER TABLE match_fixtures MODIFY COLUMN " + column + " BIGINT NULL";
    try {
      jdbc.execute(sql);
      log.info("SchemaMigration: {} set to NULLABLE", column);
    } catch (Exception e) {
      // Already nullable or column structure already correct — safe to ignore
      log.debug("SchemaMigration {}: {}", column, e.getMessage());
    }
  }

  private boolean isPostgresDatabase() {
    try (var conn = dataSource.getConnection()) {
      DatabaseMetaData meta = conn.getMetaData();
      return meta.getDatabaseProductName().toLowerCase().contains("postgresql");
    } catch (Exception e) {
      log.warn("SchemaMigration: could not detect DB type, defaulting to MySQL syntax: {}", e.getMessage());
      return false;
    }
  }
}
