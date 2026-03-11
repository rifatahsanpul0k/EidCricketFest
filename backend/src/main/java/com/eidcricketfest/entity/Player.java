package com.eidcricketfest.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "players")
public class Player {

  public enum PrimaryRole {
    BATSMAN, BOWLER, ALL_ROUNDER, WICKETKEEPER
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  @NotBlank(message = "Player name is required")
  private String name;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PrimaryRole primaryRole;

  @Min(value = 0, message = "Batting rating must be at least 0")
  @Max(value = 100, message = "Batting rating cannot exceed 100")
  private int battingRating;

  @Min(value = 0, message = "Bowling rating must be at least 0")
  @Max(value = 100, message = "Bowling rating cannot exceed 100")
  private int bowlingRating;

  @Min(value = 0, message = "Fielding rating must be at least 0")
  @Max(value = 100, message = "Fielding rating cannot exceed 100")
  private int fieldingRating;

  @Column(columnDefinition = "LONGTEXT")
  private String imageUrl;
}
