package com.eidcricketfest.service;

import com.eidcricketfest.entity.Player;
import com.eidcricketfest.entity.Team;
import com.eidcricketfest.entity.Tournament;
import com.eidcricketfest.entity.TournamentSquad;
import com.eidcricketfest.repository.PlayerRepository;
import com.eidcricketfest.repository.TeamRepository;
import com.eidcricketfest.repository.TournamentRepository;
import com.eidcricketfest.repository.TournamentSquadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DraftService {

    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final TournamentRepository tournamentRepository;
    private final TournamentSquadRepository tournamentSquadRepository;

    public void executeDraft(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        // Step 1: Always wipe existing draft for this tournament (idempotent reset)
        List<TournamentSquad> existingSquads = tournamentSquadRepository.findByTournamentId(tournamentId);
        if (!existingSquads.isEmpty()) {
            tournamentSquadRepository.deleteAll(existingSquads);
        }

        // Step 2: Fetch teams and all players
        List<Team> teams = teamRepository.findAll().stream()
                .filter(t -> t.getTournament().getId().equals(tournamentId))
                .collect(Collectors.toList());

        if (teams.isEmpty()) {
            throw new RuntimeException("No teams found for tournament " + tournamentId);
        }

        // Step 3: Sort all players by composite score descending for fair distribution
        List<Player> allPlayers = playerRepository.findAll();
        allPlayers.sort((p1, p2) -> Integer.compare(getCompositeScore(p2), getCompositeScore(p1)));

        // Step 4: Calculate equal distribution
        int numTeams = teams.size();
        int playersPerTeam = allPlayers.size() / numTeams;
        int totalDraftedPlayers = playersPerTeam * numTeams;

        // Only the first (playersPerTeam * numTeams) players are drafted into teams.
        // The rest are extras, computed dynamically by the controller.
        List<Player> draftedPlayers = allPlayers.subList(0, totalDraftedPlayers);

        // Step 5: Snake draft the equal pool into teams
        Map<Team, List<Player>> teamSquads = new LinkedHashMap<>();
        for (Team team : teams) {
            teamSquads.put(team, new ArrayList<>());
        }

        int currentTeamIndex = 0;
        boolean forward = true;

        for (Player player : draftedPlayers) {
            Team selectedTeam = teams.get(currentTeamIndex);
            teamSquads.get(selectedTeam).add(player);

            if (forward) {
                if (currentTeamIndex == numTeams - 1) {
                    forward = false;
                } else {
                    currentTeamIndex++;
                }
            } else {
                if (currentTeamIndex == 0) {
                    forward = true;
                } else {
                    currentTeamIndex--;
                }
            }
        }

        // Step 6: Build and save only team-assigned squad records
        List<TournamentSquad> squadsToSave = new ArrayList<>();

        for (Team team : teams) {
            List<Player> roster = teamSquads.get(team);
            roster.sort((p1, p2) -> Integer.compare(getCompositeScore(p2), getCompositeScore(p1)));

            for (int i = 0; i < roster.size(); i++) {
                squadsToSave.add(TournamentSquad.builder()
                        .tournament(tournament)
                        .team(team)
                        .player(roster.get(i))
                        .isCaptain(i == 0)
                        .isViceCaptain(i == 1)
                        .build());
            }
        }

        // Extras (allPlayers beyond totalDraftedPlayers) are NOT stored in DB.
        // They are returned dynamically by the controller via set-difference.
        tournamentSquadRepository.saveAll(squadsToSave);
    }

    private int getCompositeScore(Player player) {
        return player.getBattingRating() + player.getBowlingRating() + player.getFieldingRating();
    }
}
