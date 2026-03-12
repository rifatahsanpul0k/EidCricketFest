package com.eidcricketfest.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eidcricketfest.entity.Player;
import com.eidcricketfest.repository.PlayerRepository;
import com.eidcricketfest.repository.TournamentSquadRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

  private final PlayerRepository playerRepository;
  private final TournamentSquadRepository tournamentSquadRepository;

  /**
   * GET /api/players — returns paginated players sorted by composite score desc
   * Query params: page (0-indexed), size (default 20), sort (property,asc/desc)
   */
  @GetMapping
  public ResponseEntity<Map<String, Object>> getAllPlayers(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {

    if (size <= 0 || size > 100) {
      size = 20; // Enforce maximum page size
    }

    Pageable pageable = PageRequest.of(page, size,
        Sort.by(Sort.Direction.DESC, "battingRating", "bowlingRating", "fieldingRating"));

    Page<Player> playerPage = playerRepository.findAll(pageable);

    List<Map<String, Object>> content = playerPage.getContent().stream()
        .map(p -> {
          Map<String, Object> m = new LinkedHashMap<>();
          m.put("id", p.getId());
          m.put("name", p.getName());
          m.put("role", p.getPrimaryRole().name());
          m.put("battingRating", p.getBattingRating());
          m.put("bowlingRating", p.getBowlingRating());
          m.put("fieldingRating", p.getFieldingRating());
          m.put("imageUrl", p.getImageUrl());
          m.put("compositeScore", p.getBattingRating() + p.getBowlingRating() + p.getFieldingRating());
          return m;
        })
        .collect(Collectors.toList());

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("content", content);
    response.put("page", playerPage.getNumber());
    response.put("size", playerPage.getSize());
    response.put("totalElements", playerPage.getTotalElements());
    response.put("totalPages", playerPage.getTotalPages());
    response.put("isFirst", playerPage.isFirst());
    response.put("isLast", playerPage.isLast());

    return ResponseEntity.ok(response);
  }

  /**
   * GET /api/players/{id} — get detailed player info including team and stats
   */
  @GetMapping("/{id}")
  public ResponseEntity<Map<String, Object>> getPlayerDetail(@PathVariable Long id) {
    return playerRepository.findById(id).map(p -> {
      Map<String, Object> detail = new LinkedHashMap<>();

      // Basic info
      detail.put("id", p.getId());
      detail.put("fullName", p.getName());
      detail.put("name", p.getName());
      detail.put("email", ""); // Placeholder - not in current schema
      detail.put("phone", ""); // Placeholder - not in current schema
      detail.put("profileImageUrl", p.getImageUrl());
      detail.put("role", p.getPrimaryRole().name());
      detail.put("battingStyle", ""); // Placeholder - not in current schema
      detail.put("bowlingStyle", ""); // Placeholder - not in current schema
      detail.put("jerseyNumber", 0); // Placeholder - not in current schema
      detail.put("lotteryGrade", ""); // Placeholder - not in current schema

      // Team info (from tournament squad)
      Map<String, Object> teamInfo = new LinkedHashMap<>();
      var squadEntry = tournamentSquadRepository.findByTournamentId(1L).stream()
          .filter(sq -> sq.getPlayer().getId().equals(id))
          .findFirst();
      if (squadEntry.isPresent()) {
        var squad = squadEntry.get();
        var team = squad.getTeam();
        teamInfo.put("id", team.getId());
        teamInfo.put("name", team.getTeamName());
        teamInfo.put("logoUrl", ""); // Placeholder - not in current schema
      } else {
        teamInfo.put("id", null);
        teamInfo.put("name", "Unassigned");
        teamInfo.put("logoUrl", "");
      }
      detail.put("team", teamInfo);

      // Stats (placeholders for now - no delivery/match data yet)
      Map<String, Object> stats = new LinkedHashMap<>();
      stats.put("matchesPlayed", 0);
      stats.put("totalRuns", 0);
      stats.put("totalWickets", 0);
      stats.put("economyRate", 0.0);
      stats.put("battingStrikeRate", 0.0);
      detail.put("stats", stats);

      // Ratings
      detail.put("battingRating", p.getBattingRating());
      detail.put("bowlingRating", p.getBowlingRating());
      detail.put("fieldingRating", p.getFieldingRating());

      return ResponseEntity.ok(detail);
    }).orElse(ResponseEntity.notFound().build());
  }

  /**
   * POST /api/players — add a new player
   * Body: { name, role, battingRating, bowlingRating, fieldingRating }
   */
  @PostMapping
  public ResponseEntity<Map<String, Object>> addPlayer(@RequestBody Map<String, Object> body) {
    // Accept either "role" or "primaryRole" from the client
    String roleStr = body.containsKey("role")
        ? body.get("role").toString()
        : body.containsKey("primaryRole")
            ? body.get("primaryRole").toString()
            : null;

    if (roleStr == null || body.get("name") == null) {
      return ResponseEntity.badRequest().body(Map.of("error", "name and role are required"));
    }

    String playerName = body.get("name").toString().trim();
    if (playerName.isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of("error", "Player name cannot be empty"));
    }

    // Validate role
    try {
      Player.PrimaryRole.valueOf(roleStr);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest()
          .body(Map.of("error", "Invalid role. Valid roles: BATSMAN, BOWLER, ALL_ROUNDER, WICKETKEEPER"));
    }

    Player p = new Player();
    p.setName(playerName);
    p.setPrimaryRole(Player.PrimaryRole.valueOf(roleStr));

    try {
      p.setBattingRating(Integer.parseInt(body.getOrDefault("battingRating", "50").toString()));
      p.setBowlingRating(Integer.parseInt(body.getOrDefault("bowlingRating", "50").toString()));
      p.setFieldingRating(Integer.parseInt(body.getOrDefault("fieldingRating", "50").toString()));
    } catch (NumberFormatException e) {
      return ResponseEntity.badRequest().body(Map.of("error", "Ratings must be numeric values between 0 and 100"));
    }

    // Validate rating ranges
    if (p.getBattingRating() < 0 || p.getBattingRating() > 100 ||
        p.getBowlingRating() < 0 || p.getBowlingRating() > 100 ||
        p.getFieldingRating() < 0 || p.getFieldingRating() > 100) {
      return ResponseEntity.badRequest().body(Map.of("error", "All ratings must be between 0 and 100"));
    }

    // Handle image URL (external URL or base64 compressed image)
    if (body.containsKey("imageUrl") && body.get("imageUrl") != null) {
      String imageUrl = body.get("imageUrl").toString().trim();
      if (!imageUrl.isEmpty()) {
        // Limit base64 encoded images to 500KB to prevent database bloat
        if (imageUrl.startsWith("data:image") && imageUrl.length() > 524288) {
          return ResponseEntity.badRequest()
              .body(Map.of("error", "Image too large. Please compress before uploading (max 500KB)"));
        }
        p.setImageUrl(imageUrl);
      }
    }

    Player saved = playerRepository.save(p);

    Map<String, Object> res = new LinkedHashMap<>();
    res.put("id", saved.getId());
    res.put("name", saved.getName());
    res.put("role", saved.getPrimaryRole().name());
    res.put("primaryRole", saved.getPrimaryRole().name());
    res.put("battingRating", saved.getBattingRating());
    res.put("bowlingRating", saved.getBowlingRating());
    res.put("fieldingRating", saved.getFieldingRating());
    res.put("imageUrl", saved.getImageUrl());
    res.put("compositeScore", saved.getBattingRating() + saved.getBowlingRating() + saved.getFieldingRating());
    return ResponseEntity.ok(res);
  }

  /**
   * DELETE /api/players/{id} — delete a single player by ID
   */
  @DeleteMapping("/{id}")
  @Transactional
  public ResponseEntity<Map<String, String>> deletePlayer(@PathVariable Long id) {
    if (!playerRepository.existsById(id)) {
      return ResponseEntity.badRequest().body(Map.of("error", "Player not found"));
    }
    // Delete player from all tournament squads first (foreign key constraint)
    tournamentSquadRepository.deleteByPlayerId(id);
    // Then delete the player
    playerRepository.deleteById(id);
    return ResponseEntity.ok(Map.of("message", "Player deleted successfully"));
  }

  /**
   * DELETE /api/players — delete all players
   */
  @DeleteMapping
  @Transactional
  public ResponseEntity<Map<String, String>> deleteAllPlayers() {
    long count = playerRepository.count();
    // Delete all tournament squad entries first (foreign key constraint)
    // This will cascade delete all player references in tournament squads
    tournamentSquadRepository.deleteAll();
    // Then delete all players
    playerRepository.deleteAll();
    return ResponseEntity.ok(Map.of("message", count + " players deleted successfully"));
  }
}
