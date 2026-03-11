package com.eidcricketfest.config;

/**
 * Central configuration for cricket-related constants
 */
public class CricketConstants {

  // Overs and deliveries
  public static final int BALLS_PER_OVER = 6;
  public static final int DEFAULT_MAX_OVERS = 20;
  public static final int DEFAULT_POWERPLAY_OVERS = 6;
  public static final int DEFAULT_MAX_BOWLER_OVERS = 4;

  // Player ratings
  public static final int MIN_PLAYER_RATING = 0;
  public static final int MAX_PLAYER_RATING = 100;
  public static final int DEFAULT_PLAYER_RATING = 50;
  public static final int MIN_TEAM_SIZE = 2;
  public static final int DEFAULT_TEAM_SIZE = 11;

  // Delivery extras
  public static final String WIDE_EXTRA = "WIDE";
  public static final String NO_BALL_EXTRA = "NO_BALL";

  // CORS configuration
  public static final String CORS_ALLOWED_ORIGIN = "http://localhost:5173";

  private CricketConstants() {
    // Private constructor to prevent instantiation
  }
}
