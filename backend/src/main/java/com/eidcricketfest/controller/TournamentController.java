package com.eidcricketfest.controller;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eidcricketfest.entity.MatchFixture;
import com.eidcricketfest.entity.Player;
import com.eidcricketfest.entity.Team;
import com.eidcricketfest.entity.Tournament;
import com.eidcricketfest.entity.TournamentSquad;
import com.eidcricketfest.repository.PlayerRepository;
import com.eidcricketfest.repository.TeamRepository;
import com.eidcricketfest.repository.TournamentRepository;
import com.eidcricketfest.repository.TournamentSquadRepository;
import com.eidcricketfest.service.DraftService;
import com.eidcricketfest.service.FixtureService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
public class TournamentController {

  private final DraftService draftService;
  private final FixtureService fixtureService;
  private final TournamentSquadRepository tournamentSquadRepository;
  private final PlayerRepository playerRepository;
  private final TeamRepository teamRepository;
  private final TournamentRepository tournamentRepository;

  @GetMapping
  public ResponseEntity<List<Map<String, Object>>> getAllTournaments() {
    List<Tournament> tournaments = tournamentRepository.findAll();
    List<Map<String, Object>> result = tournaments.stream().map(t -> {
      Map<String, Object> map = new HashMap<>();
      map.put("id", t.getId());
      map.put("name", t.getName());
      map.put("seasonYear", t.getSeasonYear());
      map.put("maxOvers", t.getMaxOvers());
      map.put("rounds", t.getRounds());
      map.put("powerplayOvers", t.getPowerplayOvers());
      map.put("maxBowlerOvers", t.getMaxBowlerOvers());
      map.put("maxTeamSize", t.getMaxTeamSize());
      map.put("isActive", t.isActive());
      return map;
    }).collect(Collectors.toList());
    return ResponseEntity.ok(result);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Map<String, Object>> getTournament(@PathVariable Long id) {
    return tournamentRepository.findById(id).map(t -> {
      Map<String, Object> map = new HashMap<>();
      map.put("id", t.getId());
      map.put("name", t.getName());
      map.put("seasonYear", t.getSeasonYear());
      map.put("maxOvers", t.getMaxOvers());
      map.put("rounds", t.getRounds());
      map.put("powerplayOvers", t.getPowerplayOvers());
      map.put("maxBowlerOvers", t.getMaxBowlerOvers());
      map.put("maxTeamSize", t.getMaxTeamSize());
      map.put("rulesText", t.getRulesText());
      map.put("isActive", t.isActive());
      return ResponseEntity.ok(map);
    }).orElse(ResponseEntity.notFound().build());
  }

  @PatchMapping("/{id}")
  @org.springframework.transaction.annotation.Transactional
  public ResponseEntity<Map<String, Object>> updateTournament(
      @PathVariable Long id, @RequestBody Map<String, Object> body) {
    return tournamentRepository.findById(id).map(t -> {
      if (body.containsKey("name"))
        t.setName(body.get("name").toString());
      if (body.containsKey("maxOvers"))
        t.setMaxOvers(Integer.parseInt(body.get("maxOvers").toString()));
      if (body.containsKey("rounds"))
        t.setRounds(Integer.parseInt(body.get("rounds").toString()));
      if (body.containsKey("powerplayOvers"))
        t.setPowerplayOvers(Integer.parseInt(body.get("powerplayOvers").toString()));
      if (body.containsKey("maxBowlerOvers"))
        t.setMaxBowlerOvers(Integer.parseInt(body.get("maxBowlerOvers").toString()));
      if (body.containsKey("maxTeamSize"))
        t.setMaxTeamSize(Integer.parseInt(body.get("maxTeamSize").toString()));
      if (body.containsKey("seasonYear"))
        t.setSeasonYear(Integer.parseInt(body.get("seasonYear").toString()));
      if (body.containsKey("rulesText"))
        t.setRulesText(body.get("rulesText").toString());
      tournamentRepository.save(t);
      Map<String, Object> resp = new HashMap<>();
      resp.put("id", t.getId());
      resp.put("name", t.getName());
      resp.put("maxOvers", t.getMaxOvers());
      resp.put("rounds", t.getRounds());
      resp.put("powerplayOvers", t.getPowerplayOvers());
      resp.put("maxBowlerOvers", t.getMaxBowlerOvers());
      resp.put("maxTeamSize", t.getMaxTeamSize());
      resp.put("rulesText", t.getRulesText());
      return ResponseEntity.ok(resp);
    }).orElse(ResponseEntity.notFound().build());
  }

  /** POST /api/tournaments/{id}/teams — add a new team to the tournament */
  @PostMapping("/{id}/teams")
  @org.springframework.transaction.annotation.Transactional
  public ResponseEntity<Map<String, Object>> addTeam(
      @PathVariable Long id, @RequestBody Map<String, Object> body) {
    Tournament tournament = tournamentRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Tournament not found"));

    if (body.get("teamName") == null) {
      return ResponseEntity.badRequest().body(Map.of("error", "Team name is required"));
    }

    String teamName = body.get("teamName").toString().trim();
    if (teamName.isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of("error", "Team name cannot be empty"));
    }

    // Check for duplicate team name within the tournament
    List<Team> existingTeams = teamRepository.findAll().stream()
        .filter(t -> t.getTournament().getId().equals(id) &&
            t.getTeamName().equalsIgnoreCase(teamName))
        .collect(Collectors.toList());

    if (!existingTeams.isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of("error", "Team with this name already exists in this tournament"));
    }

    try {
      Team team = Team.builder().tournament(tournament).teamName(teamName).build();
      teamRepository.save(team);
      return ResponseEntity.ok(Map.of("id", team.getId(), "name", team.getTeamName()));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", "Failed to create team: " + e.getMessage()));
    }
  }

  @PostMapping("/{id}/draft")
  public ResponseEntity<String> triggerDraft(@PathVariable Long id) {
    draftService.executeDraft(id);
    return ResponseEntity.ok("Draft execution for tournament ID " + id + " completed successfully.");
  }

  /**
   * POST /api/tournaments/{id}/fixtures
   * Generates the full two-phase fixture map:
   * - 10 League matches (Circle Method round-robin)
   * - 2 Semi-Final placeholders
   * - 1 Grand Final placeholder
   * Wipes all existing fixtures for this tournament first (idempotent).
   */
  @PostMapping("/{id}/fixtures")
  @org.springframework.transaction.annotation.Transactional
  public ResponseEntity<List<Map<String, Object>>> generateFixtures(@PathVariable Long id) {
    try {
      List<MatchFixture> fixtures = fixtureService.generateFixtures(id);
      List<Map<String, Object>> result = fixtures.stream().map(m -> {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getId());
        map.put("stage", m.getMatchStage() != null ? m.getMatchStage().name() : "LEAGUE");
        map.put("matchLabel", m.getMatchLabel());
        map.put("matchNumber", m.getMatchNumber());
        map.put("round", m.getRoundNumber());
        map.put("team1", m.getTeam1() != null ? m.getTeam1().getTeamName() : "TBD");
        map.put("team1Id", m.getTeam1() != null ? m.getTeam1().getId() : null);
        map.put("team2", m.getTeam2() != null ? m.getTeam2().getTeamName() : "TBD");
        map.put("team2Id", m.getTeam2() != null ? m.getTeam2().getId() : null);
        map.put("status", m.getMatchStatus().name());
        return map;
      }).collect(Collectors.toList());
      return ResponseEntity.ok(result);
    } catch (IllegalStateException e) {
      return ResponseEntity.badRequest().body(List.of(Map.of("error", e.getMessage())));
    }
  }

  @GetMapping("/{id}/squads")
  public ResponseEntity<Map<String, Object>> getTournamentSquads(@PathVariable Long id) {
    List<TournamentSquad> allSquads = tournamentSquadRepository.findByTournamentId(id);

    // Group assigned squads by team
    Map<Team, List<TournamentSquad>> byTeam = allSquads.stream()
        .collect(Collectors.groupingBy(TournamentSquad::getTeam));

    // Build teams list and track drafted player IDs
    List<Map<String, Object>> teamsResult = new ArrayList<>();
    Set<Long> draftedPlayerIds = new HashSet<>();

    for (Map.Entry<Team, List<TournamentSquad>> entry : byTeam.entrySet()) {
      Map<String, Object> teamMap = new HashMap<>();
      teamMap.put("name", entry.getKey().getTeamName());

      List<TournamentSquad> sorted = entry.getValue();
      sorted.sort((s1, s2) -> {
        if (s1.isCaptain())
          return -1;
        if (s2.isCaptain())
          return 1;
        if (s1.isViceCaptain())
          return -1;
        if (s2.isViceCaptain())
          return 1;
        Player p1 = s1.getPlayer(), p2 = s2.getPlayer();
        return Integer.compare(
            p2.getBattingRating() + p2.getBowlingRating() + p2.getFieldingRating(),
            p1.getBattingRating() + p1.getBowlingRating() + p1.getFieldingRating());
      });

      teamMap.put("players", sorted.stream().map(this::buildPlayerMap).collect(Collectors.toList()));
      teamsResult.add(teamMap);
      sorted.forEach(sq -> draftedPlayerIds.add(sq.getPlayer().getId()));
    }

    // Extras = all players NOT assigned to any team (set-difference, no DB null
    // needed)
    List<Map<String, Object>> extrasResult = playerRepository.findAll().stream()
        .filter(p -> !draftedPlayerIds.contains(p.getId()))
        .sorted(Comparator.comparingInt(
            p -> -(p.getBattingRating() + p.getBowlingRating() + p.getFieldingRating())))
        .map(p -> {
          Map<String, Object> pMap = new HashMap<>();
          pMap.put("id", p.getId());
          pMap.put("name", p.getName());
          pMap.put("role", p.getPrimaryRole().name());
          pMap.put("score", p.getBattingRating() + p.getBowlingRating() + p.getFieldingRating());
          pMap.put("isCaptain", false);
          pMap.put("isViceCaptain", false);
          return pMap;
        })
        .collect(Collectors.toList());

    Map<String, Object> response = new HashMap<>();
    response.put("teams", teamsResult);
    response.put("extras", extrasResult);

    return ResponseEntity.ok(response);
  }

  /**
   * POST /api/tournaments/{id}/roster
   * Body: { playerId, teamId, isCaptain, isViceCaptain }
   * Manually assigns a single player to a team.
   * Clears any existing assignment for that player in this tournament first.
   */
  @PostMapping("/{id}/roster")
  @org.springframework.transaction.annotation.Transactional
  public ResponseEntity<String> assignPlayerToTeam(
      @PathVariable Long id,
      @RequestBody Map<String, Object> body) {

    Long playerId = Long.valueOf(body.get("playerId").toString());
    Long teamId = Long.valueOf(body.get("teamId").toString());
    boolean isCaptain = Boolean.parseBoolean(body.getOrDefault("isCaptain", false).toString());
    boolean isViceCaptain = Boolean.parseBoolean(body.getOrDefault("isViceCaptain", false).toString());

    Tournament tournament = tournamentRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Tournament not found"));
    Player player = playerRepository.findById(playerId)
        .orElseThrow(() -> new RuntimeException("Player not found"));
    Team team = teamRepository.findById(teamId)
        .orElseThrow(() -> new RuntimeException("Team not found"));

    // Remove existing assignment for this player in this tournament
    List<TournamentSquad> existing = tournamentSquadRepository
        .findByTournamentId(id).stream()
        .filter(sq -> sq.getPlayer().getId().equals(playerId))
        .collect(java.util.stream.Collectors.toList());
    tournamentSquadRepository.deleteAll(existing);

    // If isCaptain, clear previous captain from this team
    if (isCaptain) {
      tournamentSquadRepository.findByTeamId(teamId).stream()
          .filter(TournamentSquad::isCaptain)
          .forEach(sq -> {
            sq.setCaptain(false);
            tournamentSquadRepository.save(sq);
          });
    }
    if (isViceCaptain) {
      tournamentSquadRepository.findByTeamId(teamId).stream()
          .filter(TournamentSquad::isViceCaptain)
          .forEach(sq -> {
            sq.setViceCaptain(false);
            tournamentSquadRepository.save(sq);
          });
    }

    tournamentSquadRepository.save(TournamentSquad.builder()
        .tournament(tournament)
        .team(team)
        .player(player)
        .isCaptain(isCaptain)
        .isViceCaptain(isViceCaptain)
        .build());

    return ResponseEntity.ok("Player assigned successfully");
  }

  /**
   * DELETE /api/tournaments/{id}/roster/{playerId}
   * Removes a player from all team assignments in this tournament.
   */
  @DeleteMapping("/{id}/roster/{playerId}")
  @org.springframework.transaction.annotation.Transactional
  public ResponseEntity<String> removePlayerFromRoster(
      @PathVariable Long id, @PathVariable Long playerId) {
    List<TournamentSquad> toRemove = tournamentSquadRepository
        .findByTournamentId(id).stream()
        .filter(sq -> sq.getPlayer().getId().equals(playerId))
        .collect(java.util.stream.Collectors.toList());
    tournamentSquadRepository.deleteAll(toRemove);
    return ResponseEntity.ok("Removed");
  }

  private Map<String, Object> buildPlayerMap(TournamentSquad sq) {
    Player p = sq.getPlayer();
    Map<String, Object> pMap = new HashMap<>();
    pMap.put("id", p.getId());
    pMap.put("name", p.getName());
    pMap.put("role", p.getPrimaryRole().name());
    pMap.put("score", p.getBattingRating() + p.getBowlingRating() + p.getFieldingRating());
    pMap.put("isCaptain", sq.isCaptain());
    pMap.put("isViceCaptain", sq.isViceCaptain());
    return pMap;
  }
}
