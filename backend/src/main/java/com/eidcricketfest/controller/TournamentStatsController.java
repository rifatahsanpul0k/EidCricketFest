package com.eidcricketfest.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eidcricketfest.entity.Delivery;
import com.eidcricketfest.entity.Player;
import com.eidcricketfest.repository.DeliveryRepository;
import com.eidcricketfest.repository.TournamentRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tournament-stats")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TournamentStatsController {

  private final TournamentRepository tournamentRepository;
  private final DeliveryRepository deliveryRepository;

  /**
   * GET /api/tournament-stats/{tournamentId} — Returns tournament statistics
   * including most runs, most wickets, best performance, etc.
   */
  @GetMapping("/{tournamentId}")
  public ResponseEntity<Map<String, Object>> getTournamentStats(
      @PathVariable Long tournamentId) {

    if (!tournamentRepository.existsById(tournamentId)) {
      return ResponseEntity.notFound().build();
    }

    // Fetch all deliveries for this tournament
    List<Delivery> deliveries = deliveryRepository.findByMatchTournamentId(tournamentId);

    Map<String, Object> stats = new LinkedHashMap<>();

    // ── Most Runs Scorer ──────────────────────────────────────────────────────
    Map<Player, Integer> batterRuns = new LinkedHashMap<>();
    for (Delivery d : deliveries) {
      if (d.getStriker() != null) {
        batterRuns.merge(d.getStriker(), d.getRunsOffBat() + d.getExtras(), Integer::sum);
      }
    }

    List<Map<String, Object>> topRunScorers = batterRuns.entrySet().stream()
        .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
        .limit(5)
        .map(entry -> {
          Map<String, Object> m = new LinkedHashMap<>();
          m.put("playerId", entry.getKey().getId());
          m.put("playerName", entry.getKey().getName());
          m.put("runs", entry.getValue());
          return m;
        })
        .collect(Collectors.toList());

    stats.put("topRunScorers", topRunScorers);

    // ── Most Wicket Taker ─────────────────────────────────────────────────────
    Map<Player, Integer> bowlerWickets = new LinkedHashMap<>();
    for (Delivery d : deliveries) {
      if (d.isWicket() && d.getWicketType().toString().equals("NONE") == false
          && d.getBowler() != null) {
        bowlerWickets.merge(d.getBowler(), 1, Integer::sum);
      }
    }

    List<Map<String, Object>> topWicketTakers = bowlerWickets.entrySet().stream()
        .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
        .limit(5)
        .map(entry -> {
          Map<String, Object> m = new LinkedHashMap<>();
          m.put("playerId", entry.getKey().getId());
          m.put("playerName", entry.getKey().getName());
          m.put("wickets", entry.getValue());
          return m;
        })
        .collect(Collectors.toList());

    stats.put("topWicketTakers", topWicketTakers);

    // ── Highest Individual Score ──────────────────────────────────────────────
    Map<String, Object> highestScore = new LinkedHashMap<>();
    int maxRuns = 0;
    Player topScorer = null;
    int runsThisInning = 0;
    Player currentBatter = null;

    // Simple heuristic: group deliveries by batter to find highest single inning
    for (Delivery d : deliveries) {
      if (d.getStriker() != null) {
        if (currentBatter != d.getStriker()) {
          if (runsThisInning > maxRuns) {
            maxRuns = runsThisInning;
            topScorer = currentBatter;
          }
          currentBatter = d.getStriker();
          runsThisInning = 0;
        }
        runsThisInning += d.getRunsOffBat() + d.getExtras();
      }
    }
    // Check last inning
    if (runsThisInning > maxRuns && currentBatter != null) {
      maxRuns = runsThisInning;
      topScorer = currentBatter;
    }

    if (topScorer != null) {
      highestScore.put("playerId", topScorer.getId());
      highestScore.put("playerName", topScorer.getName());
      highestScore.put("runs", maxRuns);
    } else {
      highestScore.put("playerName", "N/A");
      highestScore.put("runs", 0);
    }
    stats.put("highestIndividualScore", highestScore);

    // ── Best Bowling Figures ──────────────────────────────────────────────────
    Map<String, Object> bestBowling = new LinkedHashMap<>();
    int maxWicketsForBowler = 0;
    Player bestBowler = null;

    for (Player bowler : bowlerWickets.keySet()) {
      if (bowlerWickets.get(bowler) > maxWicketsForBowler) {
        maxWicketsForBowler = bowlerWickets.get(bowler);
        bestBowler = bowler;
      }
    }

    if (bestBowler != null) {
      bestBowling.put("playerId", bestBowler.getId());
      bestBowling.put("playerName", bestBowler.getName());
      bestBowling.put("wickets", maxWicketsForBowler);
    } else {
      bestBowling.put("playerName", "N/A");
      bestBowling.put("wickets", 0);
    }
    stats.put("bestBowlingFigures", bestBowling);

    return ResponseEntity.ok(stats);
  }
}
