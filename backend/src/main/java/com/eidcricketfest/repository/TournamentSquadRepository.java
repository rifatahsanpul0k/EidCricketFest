package com.eidcricketfest.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.eidcricketfest.entity.TournamentSquad;

@Repository
public interface TournamentSquadRepository extends JpaRepository<TournamentSquad, Long> {
  List<TournamentSquad> findByTournamentId(Long tournamentId);

  List<TournamentSquad> findByTeamId(Long teamId);

  @Modifying
  @Query("DELETE FROM TournamentSquad ts WHERE ts.team.id = :teamId")
  void deleteByTeamId(Long teamId);

  @Modifying
  @Query("DELETE FROM TournamentSquad ts WHERE ts.player.id = :playerId")
  void deleteByPlayerId(Long playerId);
}
