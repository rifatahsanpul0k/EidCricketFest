package com.eidcricketfest.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.eidcricketfest.entity.AppUser;
import com.eidcricketfest.entity.Player;
import com.eidcricketfest.repository.AppUserRepository;
import com.eidcricketfest.repository.PlayerRepository;
import com.eidcricketfest.repository.TeamRepository;
import com.eidcricketfest.repository.TournamentRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

  private final TournamentRepository tournamentRepository;
  private final TeamRepository teamRepository;
  private final PlayerRepository playerRepository;
  private final AppUserRepository appUserRepository;
  private final BCryptPasswordEncoder passwordEncoder;

  @Override
  public void run(String... args) throws Exception {
    // Database seeding disabled - add data via admin panel
    System.out.println("Database seeding disabled. Use admin panel to add tournaments, teams, and players.");

    // Always ensure default admin users exist (idempotent)
    ensureUserExists("admin", "admin123", AppUser.Role.SUPER_ADMIN);
    ensureUserExists("scorer", "scorer123", AppUser.Role.SCORER);
  }

  private void ensureUserExists(String username, String plainPassword, AppUser.Role role) {
    if (appUserRepository.findByUsername(username).isEmpty()) {
      String hashedPassword = passwordEncoder.encode(plainPassword);
      appUserRepository.save(AppUser.builder()
          .username(username)
          .passwordHash(hashedPassword)
          .role(role)
          .build());
      System.out.println("Seeded user: " + username + " / " + plainPassword);
    }
  }

  private void createPlayers() {
    List<Player> players = Arrays.asList(
        // Batsmen (5)
        createPlayer("Babar Azam", Player.PrimaryRole.BATSMAN, 95, 20, 85),
        createPlayer("Virat Kohli", Player.PrimaryRole.BATSMAN, 96, 15, 88),
        createPlayer("Steve Smith", Player.PrimaryRole.BATSMAN, 93, 25, 82),
        createPlayer("Kane Williamson", Player.PrimaryRole.BATSMAN, 94, 22, 86),
        createPlayer("Joe Root", Player.PrimaryRole.BATSMAN, 92, 30, 84),

        // Bowlers (5)
        createPlayer("Shaheen Afridi", Player.PrimaryRole.BOWLER, 35, 95, 75),
        createPlayer("Jasprit Bumrah", Player.PrimaryRole.BOWLER, 25, 96, 78),
        createPlayer("Pat Cummins", Player.PrimaryRole.BOWLER, 45, 94, 85),
        createPlayer("Trent Boult", Player.PrimaryRole.BOWLER, 20, 93, 80),
        createPlayer("Kagiso Rabada", Player.PrimaryRole.BOWLER, 30, 92, 79),

        // All-Rounders (5)
        createPlayer("Ben Stokes", Player.PrimaryRole.ALL_ROUNDER, 85, 82, 90),
        createPlayer("Shakib Al Hasan", Player.PrimaryRole.ALL_ROUNDER, 88, 85, 80),
        createPlayer("Hardik Pandya", Player.PrimaryRole.ALL_ROUNDER, 82, 80, 88),
        createPlayer("Glenn Maxwell", Player.PrimaryRole.ALL_ROUNDER, 86, 75, 92),
        createPlayer("Ravindra Jadeja", Player.PrimaryRole.ALL_ROUNDER, 80, 88, 95),

        // Wicketkeepers (5)
        createPlayer("Mohammad Rizwan", Player.PrimaryRole.WICKETKEEPER, 88, 10, 95),
        createPlayer("Jos Buttler", Player.PrimaryRole.WICKETKEEPER, 90, 15, 92),
        createPlayer("Quinton de Kock", Player.PrimaryRole.WICKETKEEPER, 89, 12, 93),
        createPlayer("KL Rahul", Player.PrimaryRole.WICKETKEEPER, 87, 10, 88),
        createPlayer("Alex Carey", Player.PrimaryRole.WICKETKEEPER, 82, 11, 90),

        // Local players — ECF regulars
        createPlayer("Rafi Ahmed", Player.PrimaryRole.BATSMAN, 78, 22, 72),
        createPlayer("Tariq Hassan", Player.PrimaryRole.BATSMAN, 74, 18, 68),
        createPlayer("Imran Siddiqui", Player.PrimaryRole.BATSMAN, 71, 25, 70),
        createPlayer("Nabil Chowdhury", Player.PrimaryRole.BATSMAN, 76, 15, 65),
        createPlayer("Zubair Malik", Player.PrimaryRole.BATSMAN, 69, 30, 67),
        createPlayer("Arman Hossain", Player.PrimaryRole.BOWLER, 25, 80, 72),
        createPlayer("Farhan Akter", Player.PrimaryRole.BOWLER, 20, 78, 70),
        createPlayer("Sabir Rahman", Player.PrimaryRole.BOWLER, 18, 82, 68),
        createPlayer("Tuhin Ali", Player.PrimaryRole.BOWLER, 22, 76, 66),
        createPlayer("Rayhan Islam", Player.PrimaryRole.BOWLER, 28, 74, 65),
        createPlayer("Asif Karim", Player.PrimaryRole.ALL_ROUNDER, 68, 66, 75),
        createPlayer("Mamun Khan", Player.PrimaryRole.ALL_ROUNDER, 65, 70, 72),
        createPlayer("Shafiq Ullah", Player.PrimaryRole.ALL_ROUNDER, 70, 64, 74),
        createPlayer("Junaid Miah", Player.PrimaryRole.ALL_ROUNDER, 62, 68, 70),
        createPlayer("Riyadh Hasan", Player.PrimaryRole.WICKETKEEPER, 72, 12, 78),
        createPlayer("Bashir Ahmed", Player.PrimaryRole.WICKETKEEPER, 68, 10, 75),
        createPlayer("Nabeel Chaudry", Player.PrimaryRole.BATSMAN, 73, 20, 69),
        createPlayer("Osman Gani", Player.PrimaryRole.BOWLER, 24, 77, 71),
        createPlayer("Zawad Rahman", Player.PrimaryRole.ALL_ROUNDER, 66, 65, 73),
        createPlayer("Mobarok Hossain", Player.PrimaryRole.BATSMAN, 75, 16, 67));

    playerRepository.saveAll(players);
  }

  private Player createPlayer(String name, Player.PrimaryRole role, int bat, int bowl, int field) {
    return Player.builder()
        .name(name)
        .primaryRole(role)
        .battingRating(bat)
        .bowlingRating(bowl)
        .fieldingRating(field)
        .build();
  }
}
