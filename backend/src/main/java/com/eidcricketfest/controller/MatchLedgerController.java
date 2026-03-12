package com.eidcricketfest.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eidcricketfest.dto.DeliveryRequestDTO;
import com.eidcricketfest.dto.LiveScoreboardDTO;
import com.eidcricketfest.entity.MatchFixture;
import com.eidcricketfest.entity.Team;
import com.eidcricketfest.entity.Tournament;
import com.eidcricketfest.entity.TournamentSquad;
import com.eidcricketfest.repository.DeliveryRepository;
import com.eidcricketfest.repository.MatchFixtureRepository;
import com.eidcricketfest.repository.TeamRepository;
import com.eidcricketfest.repository.TournamentRepository;
import com.eidcricketfest.repository.TournamentSquadRepository;
import com.eidcricketfest.service.LedgerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchLedgerController {

  private final LedgerService ledgerService;
  private final MatchFixtureRepository matchFixtureRepository;
  private final TournamentSquadRepository tournamentSquadRepository;
  private final TeamRepository teamRepository;
  private final TournamentRepository tournamentRepository;
  private final DeliveryRepository deliveryRepository;

  @GetMapping
  public ResponseEntity<List<Map<String, Object>>> getAllMatches() {
    List<MatchFixture> matches = matchFixtureRepository.findAll();
    List<Map<String, Object>> result = matches.stream().map(m -> {
      Map<String, Object> map = new HashMap<>();
      map.put("id", m.getId());
      map.put("team1", m.getTeam1() != null ? m.getTeam1().getTeamName() : "TBD");
      map.put("team1Id", m.getTeam1() != null ? m.getTeam1().getId() : null);
      map.put("team2", m.getTeam2() != null ? m.getTeam2().getTeamName() : "TBD");
      map.put("team2Id", m.getTeam2() != null ? m.getTeam2().getId() : null);
      map.put("status", m.getMatchStatus() != null ? m.getMatchStatus().name() : "SCHEDULED");
      map.put("round", m.getRoundNumber());
      map.put("matchNumber", m.getMatchNumber());
      map.put("stage", m.getMatchStage() != null ? m.getMatchStage().name() : "LEAGUE");
      map.put("matchLabel", m.getMatchLabel());
      return map;
    }).toList();
    return ResponseEntity.ok(result);
  }

  /** POST /api/matches — create a single fixture manually */
  @PostMapping
  @Transactional
  public ResponseEntity<Map<String, Object>> createFixture(@RequestBody Map<String, Object> body) {
    Long team1Id = Long.valueOf(body.get("team1Id").toString());
    Long team2Id = Long.valueOf(body.get("team2Id").toString());
    Long tournamentId = body.containsKey("tournamentId")
        ? Long.valueOf(body.get("tournamentId").toString())
        : 1L;

    if (team1Id.equals(team2Id)) {
      return ResponseEntity.badRequest().body(Map.of("error", "A team cannot play against itself."));
    }

    Tournament tournament = tournamentRepository.findById(tournamentId)
        .orElseThrow(() -> new RuntimeException("Tournament not found"));
    Team team1 = teamRepository.findById(team1Id)
        .orElseThrow(() -> new RuntimeException("Team 1 not found"));
    Team team2 = teamRepository.findById(team2Id)
        .orElseThrow(() -> new RuntimeException("Team 2 not found"));

    MatchFixture fixture = MatchFixture.builder()
        .tournament(tournament)
        .team1(team1)
        .team2(team2)
        .matchStatus(MatchFixture.MatchStatus.SCHEDULED)
        .matchStage(MatchFixture.MatchStage.LEAGUE)
        .build();
    MatchFixture saved = matchFixtureRepository.save(fixture);

    Map<String, Object> resp = new HashMap<>();
    resp.put("id", saved.getId());
    resp.put("team1", team1.getTeamName());
    resp.put("team1Id", team1.getId());
    resp.put("team2", team2.getTeamName());
    resp.put("team2Id", team2.getId());
    resp.put("status", "SCHEDULED");
    resp.put("stage", "LEAGUE");
    resp.put("round", null);
    resp.put("matchNumber", null);
    resp.put("matchLabel", null);
    return ResponseEntity.ok(resp);
  }

  /**
   * POST /api/matches/auto-generate
   *
   * Single-elimination bracket algorithm:
   * 1. shuffle(T)
   * 2. n = |T|, m = 2^ceil(log2(n))
   * 3. pad with (m-n) BYE slots
   * 4. pair (0,1),(2,3),... as Round 1 matches
   * - real vs real → SCHEDULED fixture
   * - real vs BYE → team auto-advances (no fixture created)
   * - BYE vs BYE → skipped entirely
   * 5. advance real winners / BYE-winners and repeat for Round 2, 3, …
   * until champion decided (TBD fixtures created as placeholders)
   *
   * Clears existing SCHEDULED fixtures before generating.
   */
  @PostMapping("/auto-generate")
  @Transactional
  public ResponseEntity<List<Map<String, Object>>> autoGenerateFixtures(
      @RequestBody(required = false) Map<String, Object> body) {

    Long tournamentId = (body != null && body.containsKey("tournamentId"))
        ? Long.valueOf(body.get("tournamentId").toString())
        : 1L;

    Tournament tournament = tournamentRepository.findById(tournamentId)
        .orElseThrow(() -> new RuntimeException("Tournament not found"));

    List<Team> teams = teamRepository.findAll().stream()
        .filter(t -> t.getTournament().getId().equals(tournamentId))
        .collect(Collectors.toList());

    if (teams.size() < 2) {
      return ResponseEntity.badRequest().body(List.of(Map.of("error", "Need at least 2 teams")));
    }

    // Delete SCHEDULED fixtures only (keep LIVE/COMPLETED)
    // Must delete child deliveries first to satisfy FK constraint
    List<MatchFixture> scheduled = matchFixtureRepository.findAll().stream()
        .filter(m -> m.getMatchStatus() == MatchFixture.MatchStatus.SCHEDULED)
        .collect(Collectors.toList());
    for (MatchFixture mf : scheduled) {
      deliveryRepository.deleteByMatchFixtureId(mf.getId());
    }
    matchFixtureRepository.deleteAll(scheduled);

    // ── Step 1: shuffle ────────────────────────────────────────────────────
    java.util.Collections.shuffle(teams);

    // ── Step 2: n, m = next power of 2 ────────────────────────────────────
    int n = teams.size();
    int m = 1;
    while (m < n)
      m <<= 1;

    // ── Step 3: pad with null (BYE) slots ─────────────────────────────────
    // slots: Team entry = real team, null = BYE
    List<Team> slots = new ArrayList<>(teams);
    while (slots.size() < m)
      slots.add(null); // null == BYE

    // ── Steps 4+5: iterate rounds ─────────────────────────────────────────
    List<MatchFixture> allFixtures = new ArrayList<>();
    List<Team> currentRound = slots;
    int roundNum = 0;

    while (currentRound.size() > 1) {
      roundNum++;
      List<Team> nextRound = new ArrayList<>();
      int matchNum = 0;

      for (int i = 0; i < currentRound.size(); i += 2) {
        matchNum++;
        Team a = currentRound.get(i);
        Team b = currentRound.get(i + 1);

        if (a == null && b == null) {
          // BYE vs BYE — skip, no slot advances
          nextRound.add(null);
        } else if (a == null) {
          // BYE vs real: b auto-advances — no match needed
          nextRound.add(b);
        } else if (b == null) {
          // real vs BYE: a auto-advances — no match needed
          nextRound.add(a);
        } else {
          // real vs real — create a SCHEDULED fixture
          allFixtures.add(MatchFixture.builder()
              .tournament(tournament)
              .team1(a)
              .team2(b)
              .matchStatus(MatchFixture.MatchStatus.SCHEDULED)
              .roundNumber(roundNum)
              .matchNumber(matchNum)
              .isBye(false)
              .build());
          // Winner is TBD — advance null as placeholder
          nextRound.add(null);
        }
      }
      currentRound = nextRound;
    }

    List<MatchFixture> saved = matchFixtureRepository.saveAll(allFixtures);

    List<Map<String, Object>> result = saved.stream().map(mx -> {
      Map<String, Object> map = new HashMap<>();
      map.put("id", mx.getId());
      map.put("team1", mx.getTeam1().getTeamName());
      map.put("team1Id", mx.getTeam1().getId());
      map.put("team2", mx.getTeam2().getTeamName());
      map.put("team2Id", mx.getTeam2().getId());
      map.put("status", "SCHEDULED");
      map.put("round", mx.getRoundNumber());
      map.put("matchNumber", mx.getMatchNumber());
      return map;
    }).collect(Collectors.toList());

    return ResponseEntity.ok(result);
  }

  /** DELETE /api/matches/{id} — remove a fixture (blocked if LIVE) */
  @DeleteMapping("/{id}")
  @Transactional
  public ResponseEntity<?> deleteFixture(@PathVariable Long id) {
    return matchFixtureRepository.findById(id).map(m -> {
      if (m.getMatchStatus() == MatchFixture.MatchStatus.LIVE) {
        return ResponseEntity.status(409)
            .<String>body("Cannot delete a LIVE match. Mark it as COMPLETED first.");
      }
      deliveryRepository.deleteByMatchFixtureId(id);
      matchFixtureRepository.deleteById(id);
      return ResponseEntity.ok("Deleted");
    }).orElse(ResponseEntity.notFound().<String>build());
  }

  /** PATCH /api/matches/{id}/status — update match status */
  @PatchMapping("/{id}/status")
  @Transactional
  public ResponseEntity<Map<String, Object>> updateStatus(
      @PathVariable Long id, @RequestBody Map<String, String> body) {
    return matchFixtureRepository.findById(id).map(m -> {
      m.setMatchStatus(MatchFixture.MatchStatus.valueOf(body.get("status")));
      matchFixtureRepository.save(m);
      Map<String, Object> resp = new HashMap<>();
      resp.put("id", m.getId());
      resp.put("status", m.getMatchStatus().name());
      return ResponseEntity.ok(resp);
    }).orElse(ResponseEntity.notFound().build());
  }

  /**
   * PATCH /api/matches/{id}/teams — assign team1/team2 to a fixture (for knockout
   * slots)
   */
  @PatchMapping("/{id}/teams")
  @Transactional
  public ResponseEntity<Map<String, Object>> updateTeams(
      @PathVariable Long id, @RequestBody Map<String, Object> body) {
    return matchFixtureRepository.findById(id).map(m -> {
      if (body.containsKey("team1Id")) {
        Long t1Id = body.get("team1Id") == null ? null : Long.valueOf(body.get("team1Id").toString());
        m.setTeam1(t1Id == null ? null
            : teamRepository.findById(t1Id)
                .orElseThrow(() -> new RuntimeException("Team 1 not found")));
      }
      if (body.containsKey("team2Id")) {
        Long t2Id = body.get("team2Id") == null ? null : Long.valueOf(body.get("team2Id").toString());
        m.setTeam2(t2Id == null ? null
            : teamRepository.findById(t2Id)
                .orElseThrow(() -> new RuntimeException("Team 2 not found")));
      }
      matchFixtureRepository.save(m);
      Map<String, Object> resp = new HashMap<>();
      resp.put("id", m.getId());
      resp.put("team1", m.getTeam1() != null ? m.getTeam1().getTeamName() : "TBD");
      resp.put("team1Id", m.getTeam1() != null ? m.getTeam1().getId() : null);
      resp.put("team2", m.getTeam2() != null ? m.getTeam2().getTeamName() : "TBD");
      resp.put("team2Id", m.getTeam2() != null ? m.getTeam2().getId() : null);
      return ResponseEntity.ok(resp);
    }).orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/{id}/scoreboard")
  public ResponseEntity<LiveScoreboardDTO> getLiveScoreboard(@PathVariable Long id) {
    return ResponseEntity.ok(ledgerService.getLiveScoreboard(id));
  }

  @PostMapping("/{id}/deliveries")
  public ResponseEntity<LiveScoreboardDTO> recordDelivery(@PathVariable Long id,
      @RequestBody DeliveryRequestDTO request) {
    ledgerService.recordDelivery(id, request);
    return ResponseEntity.ok(ledgerService.getLiveScoreboard(id));
  }

  @DeleteMapping("/{id}/deliveries/latest")
  public ResponseEntity<LiveScoreboardDTO> undoLastDelivery(@PathVariable Long id) {
    ledgerService.undoLastDelivery(id);
    return ResponseEntity.ok(ledgerService.getLiveScoreboard(id));
  }

  @GetMapping("/{id}/context")
  @Transactional(readOnly = true)
  public ResponseEntity<Map<String, Object>> getMatchContext(@PathVariable Long id) {
    MatchFixture match = matchFixtureRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Match not found"));

    List<TournamentSquad> team1Squads = tournamentSquadRepository.findByTeamId(match.getTeam1().getId());
    List<TournamentSquad> team2Squads = tournamentSquadRepository.findByTeamId(match.getTeam2().getId());

    Map<String, Object> context = new HashMap<>();
    context.put("matchId", match.getId());
    context.put("team1Id", match.getTeam1().getId());
    context.put("team2Id", match.getTeam2().getId());
    context.put("team1Name", match.getTeam1().getTeamName());
    context.put("team2Name", match.getTeam2().getTeamName());
    context.put("team1", formatSquad(team1Squads));
    context.put("team2", formatSquad(team2Squads));

    return ResponseEntity.ok(context);
  }

  @GetMapping("/{id}/details")
  @Transactional(readOnly = true)
  public ResponseEntity<Map<String, Object>> getMatchDetails(@PathVariable Long id) {
    MatchFixture match = matchFixtureRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Match not found"));

    List<TournamentSquad> team1Squads = tournamentSquadRepository.findByTeamId(match.getTeam1().getId());
    List<TournamentSquad> team2Squads = tournamentSquadRepository.findByTeamId(match.getTeam2().getId());

    Map<String, Object> result = new HashMap<>();
    result.put("id", match.getId());
    result.put("team1Name", match.getTeam1().getTeamName());
    result.put("team2Name", match.getTeam2().getTeamName());
    result.put("status", match.getMatchStatus() != null ? match.getMatchStatus().name() : "SCHEDULED");
    result.put("team1Squad", formatSquad(team1Squads));
    result.put("team2Squad", formatSquad(team2Squads));
    return ResponseEntity.ok(result);
  }

  private List<Map<String, Object>> formatSquad(List<TournamentSquad> squads) {
    List<Map<String, Object>> list = new ArrayList<>();
    squads.sort((a, b) -> {
      if (a.isCaptain())
        return -1;
      if (b.isCaptain())
        return 1;
      if (a.isViceCaptain())
        return -1;
      if (b.isViceCaptain())
        return 1;
      return 0;
    });
    for (TournamentSquad sq : squads) {
      Map<String, Object> p = new HashMap<>();
      p.put("id", sq.getPlayer().getId());
      p.put("name", sq.getPlayer().getName());
      p.put("role", sq.getPlayer().getPrimaryRole().name());
      p.put("battingRating", sq.getPlayer().getBattingRating());
      p.put("bowlingRating", sq.getPlayer().getBowlingRating());
      p.put("isCaptain", sq.isCaptain());
      p.put("isViceCaptain", sq.isViceCaptain());
      list.add(p);
    }
    return list;
  }

  @PostMapping("/setup-test-match")
  public ResponseEntity<String> setupTestMatch() {
    if (matchFixtureRepository.findById(1L).isPresent()) {
      return ResponseEntity.ok("Test match already exists!");
    }

    List<com.eidcricketfest.entity.Team> teams = teamRepository.findAll();
    if (teams.size() < 2) {
      return ResponseEntity.badRequest().body("Need at least 2 teams created in DB first.");
    }

    MatchFixture match = MatchFixture.builder()
        .tournament(teams.get(0).getTournament())
        .team1(teams.get(0))
        .team2(teams.get(1))
        .matchStatus(MatchFixture.MatchStatus.SCHEDULED)
        .build();

    matchFixtureRepository.save(match);
    return ResponseEntity.ok("Test Match 1 successfully created between " + match.getTeam1().getTeamName() + " and "
        + match.getTeam2().getTeamName());
  }

  /**
   * GET /api/matches/{id}/live-score
   * Comprehensive live score data for frontend display
   */
  @GetMapping("/{id}/live-score")
  @Transactional(readOnly = true)
  public ResponseEntity<Map<String, Object>> getLiveScore(@PathVariable Long id) {
    MatchFixture match = matchFixtureRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Match not found"));
    Tournament tournament = match.getTournament();

    LiveScoreboardDTO scoreboard = ledgerService.getLiveScoreboard(id);

    Map<String, Object> liveScore = new HashMap<>();

    // Match info
    liveScore.put("matchId", match.getId());
    liveScore.put("status", match.getMatchStatus().name());
    liveScore.put("team1Name", match.getTeam1().getTeamName());
    liveScore.put("team2Name", match.getTeam2().getTeamName());
    liveScore.put("format", "T20");
    liveScore.put("tournament", tournament.getName());
    liveScore.put("season", tournament.getSeasonYear());
    liveScore.put("maxOvers", tournament.getMaxOvers());
    liveScore.put("venue", "TBD"); // Future: add venue field to MatchFixture

    // Live score details
    liveScore.put("currentRuns", scoreboard.getTotalRuns());
    liveScore.put("currentWickets", scoreboard.getTotalWickets());
    liveScore.put("overs", scoreboard.getOvers());

    // Calculate rates
    String[] parts = scoreboard.getOvers().split("\\.");
    int overs = Integer.parseInt(parts[0]);
    int balls = Integer.parseInt(parts[1]);
    double totalBalls = overs * 6.0 + balls;
    double crr = totalBalls > 0 ? (scoreboard.getTotalRuns() / totalBalls) * 6.0 : 0.0;

    liveScore.put("currentRunRate", String.format("%.2f", crr));
    liveScore.put("requiredRunRate", "8.40"); // Future: calculate from target
    liveScore.put("target", 145); // Future: from innings 1
    liveScore.put("runsNeeded", 100); // Future: calculate
    liveScore.put("oversRemaining", tournament.getMaxOvers() - overs);

    // Toss info
    liveScore.put("tossWinner", match.getTeam1().getTeamName());
    liveScore.put("tossDecision", "BAT");
    liveScore.put("inning", "1st");

    // Squad data
    List<TournamentSquad> team1Squads = tournamentSquadRepository.findByTeamId(match.getTeam1().getId());
    List<TournamentSquad> team2Squads = tournamentSquadRepository.findByTeamId(match.getTeam2().getId());

    liveScore.put("team1Squad", formatSquad(team1Squads));
    liveScore.put("team2Squad", formatSquad(team2Squads));

    return ResponseEntity.ok(liveScore);
  }

  /**
   * GET /api/matches/{id}/scorecard
   * Batting and bowling statistics
   */
  @GetMapping("/{id}/scorecard")
  @Transactional(readOnly = true)
  public ResponseEntity<Map<String, Object>> getScorecard(@PathVariable Long id) {
    MatchFixture match = matchFixtureRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Match not found"));

    LiveScoreboardDTO scoreboard = ledgerService.getLiveScoreboard(id);
    List<TournamentSquad> team1Squads = tournamentSquadRepository.findByTeamId(match.getTeam1().getId());
    List<TournamentSquad> team2Squads = tournamentSquadRepository.findByTeamId(match.getTeam2().getId());

    Map<String, Object> scorecard = new HashMap<>();

    // Team 1 Batting
    scorecard.put("team1Name", match.getTeam1().getTeamName());
    scorecard.put("team1Runs", scoreboard.getTotalRuns());
    scorecard.put("team1Wickets", scoreboard.getTotalWickets());
    scorecard.put("team1Overs", scoreboard.getOvers());

    // Sample batting data - future: from deliveries table
    List<Map<String, Object>> batting = new ArrayList<>();
    for (int i = 0; i < team1Squads.size() && i < 3; i++) {
      Map<String, Object> bat = new HashMap<>();
      bat.put("name", team1Squads.get(i).getPlayer().getName());
      bat.put("runs", 15 + (i * 10));
      bat.put("balls", 12 + (i * 8));
      bat.put("fours", 1 + i);
      bat.put("sixes", i);
      bat.put("strikeRate", String.format("%.2f", (double) (15 + (i * 10)) / (12 + (i * 8)) * 100));
      batting.add(bat);
    }
    scorecard.put("batting", batting);

    // Team 2 Bowling
    scorecard.put("team2Name", match.getTeam2().getTeamName());
    scorecard.put("target", 145);
    scorecard.put("runsNeeded", 100);
    scorecard.put("oversRemaining", 13);

    // Sample bowling data - future: from deliveries table
    List<Map<String, Object>> bowling = new ArrayList<>();
    for (int i = 0; i < team2Squads.size() && i < 3; i++) {
      Map<String, Object> bowl = new HashMap<>();
      bowl.put("name", team2Squads.get(i).getPlayer().getName());
      bowl.put("overs", 1.2 + i);
      bowl.put("runs", 8 + (i * 4));
      bowl.put("wickets", i);
      bowl.put("maidens", 0);
      bowl.put("economy", String.format("%.2f", (double) (8 + (i * 4)) / (1.2 + i)));
      bowling.add(bowl);
    }
    scorecard.put("bowling", bowling);

    return ResponseEntity.ok(scorecard);
  }

  /**
   * GET /api/matches/{id}/commentary
   * Ball-by-ball commentary
   */
  @GetMapping("/{id}/commentary")
  @Transactional(readOnly = true)
  public ResponseEntity<List<Map<String, Object>>> getCommentary(@PathVariable Long id) {
    // Future: fetch from deliveries table
    List<Map<String, Object>> commentary = new ArrayList<>();

    String[] results = { "Dot", "1 Run", "2 Runs", "3 Runs", "4 Runs", "6 Runs", "Wicket" };
    String[] descriptions = {
        "Good length, left alone",
        "Pushed through covers",
        "Driven to mid-wicket",
        "Flick towards fine leg",
        "Boundary! Over mid-off",
        "Maximum! Over long-on",
        "Wicket! Caught at point"
    };

    for (int over = 1; over <= 6; over++) {
      for (int ball = 1; ball <= 6; ball++) {
        Map<String, Object> ball_data = new HashMap<>();
        ball_data.put("over", over);
        ball_data.put("ball", ball);
        ball_data.put("bowler", "Bowler " + (char) ('A' + (over % 3)));
        ball_data.put("batter", "Player " + (char) ('A' + (ball % 2)));
        ball_data.put("result", results[(over * ball) % results.length]);
        ball_data.put("description", descriptions[(over * ball) % descriptions.length]);
        commentary.add(ball_data);
      }
    }

    return ResponseEntity.ok(commentary);
  }

  /**
   * GET /api/matches/{id}/statistics
   * Match statistics and analysis
   */
  @GetMapping("/{id}/statistics")
  @Transactional(readOnly = true)
  public ResponseEntity<Map<String, Object>> getStatistics(@PathVariable Long id) {
    MatchFixture match = matchFixtureRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Match not found"));

    Map<String, Object> stats = new HashMap<>();

    stats.put("team1", match.getTeam1().getTeamName());
    stats.put("team2", match.getTeam2().getTeamName());

    // Run distribution
    Map<String, Object> runDistribution = new HashMap<>();
    runDistribution.put("singles", 15);
    runDistribution.put("doubles", 8);
    runDistribution.put("fours", 4);
    runDistribution.put("sixes", 3);
    stats.put("runDistribution", runDistribution);

    // Match stats
    Map<String, Object> matchStats = new HashMap<>();
    matchStats.put("totalWickets", 2);
    matchStats.put("totalDotBalls", 18);
    matchStats.put("totalBoundaries", 7);
    matchStats.put("totalSixes", 3);
    stats.put("matchStats", matchStats);

    // Partnerships (future: from data)
    List<Map<String, Object>> partnerships = new ArrayList<>();
    Map<String, Object> p1 = new HashMap<>();
    p1.put("player1", "Player A");
    p1.put("player2", "Player B");
    p1.put("runs", 32);
    p1.put("balls", 19);
    partnerships.add(p1);
    stats.put("partnerships", partnerships);

    return ResponseEntity.ok(stats);
  }
}
