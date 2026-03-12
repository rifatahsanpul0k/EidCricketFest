package com.eidcricketfest.controller;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eidcricketfest.entity.MatchFixture;
import com.eidcricketfest.entity.Player;
import com.eidcricketfest.entity.Team;
import com.eidcricketfest.entity.TournamentSquad;
import com.eidcricketfest.repository.MatchFixtureRepository;
import com.eidcricketfest.repository.TeamRepository;
import com.eidcricketfest.repository.TournamentSquadRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

  private final TeamRepository teamRepository;
  private final TournamentSquadRepository tournamentSquadRepository;
  private final MatchFixtureRepository matchFixtureRepository;

  /**
   * GET /api/teams — list all teams with id, name, and hasFixtures flag
   */
  @GetMapping
  public ResponseEntity<List<Map<String, Object>>> getAllTeams() {
    List<MatchFixture> allFixtures = matchFixtureRepository.findAll();
    List<Map<String, Object>> result = teamRepository.findAll().stream()
        .map(t -> {
          Map<String, Object> m = new HashMap<>();
          m.put("id", t.getId());
          m.put("name", t.getTeamName());
          boolean hasFix = allFixtures.stream()
              .anyMatch(f -> (f.getTeam1() != null && f.getTeam1().getId().equals(t.getId())) ||
                  (f.getTeam2() != null && f.getTeam2().getId().equals(t.getId())));
          m.put("hasFixtures", hasFix);
          return m;
        })
        .sorted(Comparator.comparing(m -> (String) m.get("name")))
        .collect(Collectors.toList());
    return ResponseEntity.ok(result);
  }

  /**
   * GET /api/teams/{id}/squad — full squad for a team
   */
  @GetMapping("/{id}/squad")
  @Transactional(readOnly = true)
  public ResponseEntity<Map<String, Object>> getTeamSquad(@PathVariable Long id) {
    return teamRepository.findById(id).map(team -> {
      List<TournamentSquad> squads = tournamentSquadRepository.findByTeamId(id);
      squads.sort((a, b) -> {
        if (a.isCaptain())
          return -1;
        if (b.isCaptain())
          return 1;
        if (a.isViceCaptain())
          return -1;
        if (b.isViceCaptain())
          return 1;
        Player pa = a.getPlayer(), pb = b.getPlayer();
        return Integer.compare(
            pb.getBattingRating() + pb.getBowlingRating() + pb.getFieldingRating(),
            pa.getBattingRating() + pa.getBowlingRating() + pa.getFieldingRating());
      });

      List<Map<String, Object>> players = squads.stream().map(sq -> {
        Player p = sq.getPlayer();
        Map<String, Object> pm = new HashMap<>();
        pm.put("id", p.getId());
        pm.put("name", p.getName());
        pm.put("role", p.getPrimaryRole().name());
        pm.put("battingRating", p.getBattingRating());
        pm.put("bowlingRating", p.getBowlingRating());
        pm.put("fieldingRating", p.getFieldingRating());
        pm.put("isCaptain", sq.isCaptain());
        pm.put("isViceCaptain", sq.isViceCaptain());
        return pm;
      }).collect(Collectors.toList());

      Map<String, Object> response = new HashMap<>();
      response.put("id", team.getId());
      response.put("name", team.getTeamName());
      response.put("players", players);
      return ResponseEntity.ok(response);
    }).orElse(ResponseEntity.notFound().build());
  }

  /**
   * GET /api/teams/{id}/stats — Get comprehensive team statistics
   */
  @GetMapping("/{id}/stats")
  @Transactional(readOnly = true)
  public ResponseEntity<Map<String, Object>> getTeamStats(@PathVariable Long id) {

    if (!teamRepository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }

    Team team = teamRepository.findById(id).get();
    Map<String, Object> stats = new LinkedHashMap<>();

    // Basic info
    stats.put("id", team.getId());
    stats.put("name", team.getTeamName());

    // Get all squad entries for this team across all tournaments
    List<TournamentSquad> allSquads = tournamentSquadRepository.findByTeamId(id);

    // ── Matches Played & Won ──────────────────────────────────────────────────
    List<MatchFixture> matchesAsTeam1 = matchFixtureRepository.findByTeam1Id(id);
    List<MatchFixture> matchesAsTeam2 = matchFixtureRepository.findByTeam2Id(id);

    List<MatchFixture> allMatches = matchesAsTeam1;
    allMatches.addAll(matchesAsTeam2);
    allMatches = allMatches.stream()
        .filter(m -> m.getMatchStatus().toString().equals("COMPLETED"))
        .collect(Collectors.toList());

    long totalMatches = allMatches.size();
    long matchesWon = allMatches.stream()
        .filter(m -> m.getWinner() != null && m.getWinner().getId().equals(id))
        .count();

    stats.put("totalMatches", totalMatches);
    stats.put("matchesWon", matchesWon);
    stats.put("winRate", totalMatches > 0 ? String.format("%.1f%%", (matchesWon * 100.0) / totalMatches) : "0.0%");

    // ── Most Loyal Player (longest in team) ──────────────────────────────────
    Map<String, Object> mostLoyalPlayer = new LinkedHashMap<>();
    if (!allSquads.isEmpty()) {
      // Most loyal = player with earliest tournament season (first to join)
      var loyalPlayer = allSquads.stream()
          .min((a, b) -> a.getTournament().getSeasonYear() - b.getTournament().getSeasonYear())
          .orElse(null);

      if (loyalPlayer != null) {
        mostLoyalPlayer.put("playerId", loyalPlayer.getPlayer().getId());
        mostLoyalPlayer.put("playerName", loyalPlayer.getPlayer().getName());
        mostLoyalPlayer.put("sinceYear", loyalPlayer.getTournament().getSeasonYear());
        mostLoyalPlayer.put("seasons", LocalDateTime.now().getYear() - loyalPlayer.getTournament().getSeasonYear() + 1);
      }
    }
    stats.put("mostLoyalPlayer", mostLoyalPlayer);

    // ── Team First Appearance ─────────────────────────────────────────────────
    if (!allSquads.isEmpty()) {
      int firstYear = allSquads.stream()
          .mapToInt(s -> s.getTournament().getSeasonYear())
          .min()
          .orElse(LocalDateTime.now().getYear());
      stats.put("firstYearParticipated", firstYear);
      stats.put("yearsActive", LocalDateTime.now().getYear() - firstYear + 1);
    }

    // ── Current Squad Info ────────────────────────────────────────────────────
    List<Map<String, Object>> currentSquad = allSquads.stream()
        .map(squad -> {
          Map<String, Object> m = new LinkedHashMap<>();
          m.put("playerId", squad.getPlayer().getId());
          m.put("playerName", squad.getPlayer().getName());
          m.put("role", squad.getPlayer().getPrimaryRole().name());
          m.put("isCaptain", squad.isCaptain());
          m.put("isViceCaptain", squad.isViceCaptain());
          m.put("battingRating", squad.getPlayer().getBattingRating());
          m.put("bowlingRating", squad.getPlayer().getBowlingRating());
          m.put("fieldingRating", squad.getPlayer().getFieldingRating());
          return m;
        })
        .collect(Collectors.toList());

    stats.put("squadSize", currentSquad.size());
    stats.put("squad", currentSquad);

    // ── Average Team Rating ───────────────────────────────────────────────────
    double avgRating = currentSquad.isEmpty() ? 0
        : currentSquad.stream()
            .mapToDouble(p -> ((Number) p.get("battingRating")).doubleValue()
                + ((Number) p.get("bowlingRating")).doubleValue()
                + ((Number) p.get("fieldingRating")).doubleValue())
            .average()
            .orElse(0);

    stats.put("averageTeamRating", String.format("%.1f", avgRating / 3));

    return ResponseEntity.ok(stats);
  }

  /**
   * DELETE /api/teams/{id} — delete a team only if it has no fixtures.
   * If the team is part of any fixture, return 409 Conflict.
   */
  @DeleteMapping("/{id}")
  @Transactional
  public ResponseEntity<?> deleteTeam(@PathVariable Long id) {
    if (!teamRepository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }

    // Block deletion if the team is part of any fixture
    boolean hasFixtures = matchFixtureRepository.findAll().stream()
        .anyMatch(m -> (m.getTeam1() != null && m.getTeam1().getId().equals(id)) ||
            (m.getTeam2() != null && m.getTeam2().getId().equals(id)));

    if (hasFixtures) {
      return ResponseEntity.status(409)
          .body(Map.of("error",
              "This team has active fixtures. Delete all fixtures involving this team first, then delete the team."));
    }

    // No fixtures — safe to delete squad assignments and team
    tournamentSquadRepository.deleteByTeamId(id);
    teamRepository.deleteById(id);

    return ResponseEntity.ok("Team deleted successfully");
  }
}
