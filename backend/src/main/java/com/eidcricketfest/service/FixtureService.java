package com.eidcricketfest.service;

import com.eidcricketfest.entity.MatchFixture;
import com.eidcricketfest.entity.MatchFixture.MatchStage;
import com.eidcricketfest.entity.MatchFixture.MatchStatus;
import com.eidcricketfest.entity.Team;
import com.eidcricketfest.entity.Tournament;
import com.eidcricketfest.repository.DeliveryRepository;
import com.eidcricketfest.repository.MatchFixtureRepository;
import com.eidcricketfest.repository.TeamRepository;
import com.eidcricketfest.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * FixtureService — Two-Phase Tournament Map
 *
 * Phase 1 : League (Circle / Round-Robin) — every team plays each other once.
 * With 5 teams we inject a BYE to make 6, giving exactly 5 rounds × 2 pairs
 * minus the BYE pairings = 10 real matches.
 *
 * Phase 2 : Knockout — 2 Semis + 1 Grand Final (team slots = null/placeholder,
 * filled in later from the Points Table standings).
 */
@Service
@RequiredArgsConstructor
public class FixtureService {

    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final MatchFixtureRepository matchFixtureRepository;
    private final DeliveryRepository deliveryRepository;

    @Transactional
    public List<MatchFixture> generateFixtures(Long tournamentId) {

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found: " + tournamentId));

        List<Team> teams = teamRepository.findAll().stream()
                .filter(t -> t.getTournament().getId().equals(tournamentId))
                .collect(Collectors.toList());

        if (teams.size() < 2) {
            throw new IllegalStateException("Need at least 2 teams to generate fixtures.");
        }

        // ── Hard-wipe existing fixtures (deliveries first for FK safety) ─────
        List<MatchFixture> existing = matchFixtureRepository
                .findByTournamentIdOrderByMatchStageAscMatchNumberAsc(tournamentId);
        for (MatchFixture mf : existing) {
            if (mf.getId() != null)
                deliveryRepository.deleteByMatchFixtureId(mf.getId());
        }
        matchFixtureRepository.deleteAllByTournamentId(tournamentId);
        matchFixtureRepository.flush();

        // ────────────────────────────────────────────────────────────────────
        // PHASE 1 — Circle-Method Round-Robin
        //
        // With N teams (may be odd), add one BYE slot to make the count even.
        // Split into two rows of N/2 slots. Pair row[i] vs row[N-1-i].
        // Pin slot[0]=fixed; rotate the remaining 2N-2 slots clockwise each round.
        // Discard pairings where either slot is BYE (null).
        // Total real matches = N*(N-1)/2 (e.g. 5 teams → 10 matches).
        // ────────────────────────────────────────────────────────────────────
        List<Team> slots = new ArrayList<>(teams);
        if (slots.size() % 2 != 0)
            slots.add(null); // null == BYE
        int n = slots.size(); // must be even

        List<MatchFixture> fixtures = new ArrayList<>();
        int leagueMatchNum = 0;

        for (int round = 0; round < n - 1; round++) {
            // Pair slots[0..n/2-1] vs slots[n-1..n/2] (reversed right half)
            for (int i = 0; i < n / 2; i++) {
                Team home = slots.get(i);
                Team away = slots.get(n - 1 - i);
                if (home != null && away != null) { // skip BYE pairings
                    leagueMatchNum++;
                    fixtures.add(MatchFixture.builder()
                            .tournament(tournament)
                            .team1(home)
                            .team2(away)
                            .matchStatus(MatchStatus.SCHEDULED)
                            .matchStage(MatchStage.LEAGUE)
                            .matchNumber(leagueMatchNum)
                            .roundNumber(round + 1)
                            .matchLabel("Match " + leagueMatchNum)
                            .isBye(false)
                            .build());
                }
            }

            // Rotate all slots except slot[0] — clockwise (shift right by 1)
            Team last = slots.get(n - 1);
            for (int i = n - 1; i > 1; i--)
                slots.set(i, slots.get(i - 1));
            slots.set(1, last);
        }

        // ────────────────────────────────────────────────────────────────────
        // PHASE 2 — Knockout Placeholders
        //
        // 3 matches: SF1 (Rank1 vs Rank4), SF2 (Rank2 vs Rank3), Grand Final
        // team1 / team2 are null — will be resolved from Points Table later.
        // ────────────────────────────────────────────────────────────────────
        fixtures.add(MatchFixture.builder()
                .tournament(tournament)
                .team1(null).team2(null)
                .matchStatus(MatchStatus.SCHEDULED)
                .matchStage(MatchStage.SEMIFINAL)
                .matchNumber(1)
                .roundNumber(round(n - 1) + 1)
                .matchLabel("Semi-Final 1  (Rank 1 vs Rank 4)")
                .isBye(false)
                .build());

        fixtures.add(MatchFixture.builder()
                .tournament(tournament)
                .team1(null).team2(null)
                .matchStatus(MatchStatus.SCHEDULED)
                .matchStage(MatchStage.SEMIFINAL)
                .matchNumber(2)
                .roundNumber(round(n - 1) + 1)
                .matchLabel("Semi-Final 2  (Rank 2 vs Rank 3)")
                .isBye(false)
                .build());

        fixtures.add(MatchFixture.builder()
                .tournament(tournament)
                .team1(null).team2(null)
                .matchStatus(MatchStatus.SCHEDULED)
                .matchStage(MatchStage.FINAL)
                .matchNumber(1)
                .roundNumber(round(n - 1) + 2)
                .matchLabel("Grand Final  (Winner SF1 vs Winner SF2)")
                .isBye(false)
                .build());

        return matchFixtureRepository.saveAll(fixtures);
    }

    /** tiny helper to avoid the variable-name clash with Java's `round()` */
    private static int round(int r) {
        return r;
    }
}
