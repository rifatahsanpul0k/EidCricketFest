package com.eidcricketfest.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "match_fixtures")
public class MatchFixture {

  public enum MatchStatus {
    SCHEDULED, LIVE, COMPLETED
  }

  public enum TossDecision {
    BAT, BOWL
  }

  public enum MatchStage {
    LEAGUE, SEMIFINAL, FINAL
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tournament_id", nullable = false)
  private Tournament tournament;

  /**
   * Nullable for SEMIFINAL/FINAL placeholders — teams assigned after league ends
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "team1_id", nullable = true)
  private Team team1;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "team2_id", nullable = true)
  private Team team2;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private MatchStatus matchStatus;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "toss_winner_id")
  private Team tossWinner;

  @Enumerated(EnumType.STRING)
  private TossDecision tossDecision;

  private String umpire1;
  private String umpire2;

  /** Bracket round (1-based, for legacy bracket display) */
  @Builder.Default
  private int roundNumber = 1;

  /** Slot within the round (1-based) */
  @Builder.Default
  private int matchNumber = 1;

  /** True if this match was a BYE auto-advance entry */
  @Builder.Default
  private boolean isBye = false;

  /** Tournament stage: LEAGUE / SEMIFINAL / FINAL */
  @Enumerated(EnumType.STRING)
  @Builder.Default
  private MatchStage matchStage = MatchStage.LEAGUE;

  /** Human-readable label, e.g. "Match 3", "Semi-Final 2", "Grand Final" */
  private String matchLabel;

  /** Match winner (set after match is completed) */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "winner_id")
  private Team winner;
}
