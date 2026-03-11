package com.eidcricketfest.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.eidcricketfest.entity.MatchFixture;

@Repository
public interface MatchFixtureRepository extends JpaRepository<MatchFixture, Long> {

  List<MatchFixture> findByTournamentIdOrderByMatchStageAscMatchNumberAsc(Long tournamentId);

  List<MatchFixture> findByTeam1Id(Long teamId);

  List<MatchFixture> findByTeam2Id(Long teamId);

  @Modifying
  @Query("DELETE FROM MatchFixture m WHERE m.tournament.id = :tournamentId")
  void deleteAllByTournamentId(Long tournamentId);

  @Modifying
  @Query("DELETE FROM MatchFixture m WHERE m.team1.id = :teamId OR m.team2.id = :teamId")
  void deleteByTeamId(Long teamId);
}
