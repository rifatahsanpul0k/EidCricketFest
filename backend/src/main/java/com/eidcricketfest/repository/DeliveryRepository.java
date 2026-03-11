package com.eidcricketfest.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eidcricketfest.entity.Delivery;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

  @Modifying
  @Query("DELETE FROM Delivery d WHERE d.match.id = :matchId")
  void deleteByMatchFixtureId(Long matchId);

  @Query("SELECT COUNT(d) FROM Delivery d WHERE d.match.id = :matchId")
  long countByMatchId(@Param("matchId") Long matchId);

  @Query("SELECT COALESCE(SUM(d.runsOffBat + d.extras), 0) FROM Delivery d WHERE d.match.id = :matchId")
  int getTotalRunsByMatchId(@Param("matchId") Long matchId);

  @Query("SELECT COALESCE(COUNT(d), 0) FROM Delivery d WHERE d.match.id = :matchId AND d.isWicket = true")
  long getTotalWicketsByMatchId(@Param("matchId") Long matchId);

  @Query("SELECT COALESCE(COUNT(d), 0) FROM Delivery d WHERE d.match.id = :matchId " +
      "AND (d.extraType = 'NONE' OR d.extraType = 'BYE' OR d.extraType = 'LEG_BYE')")
  long getValidBallsCountByMatchId(@Param("matchId") Long matchId);

  @Query("SELECT d FROM Delivery d WHERE d.match.tournament.id = :tournamentId")
  List<Delivery> findByMatchTournamentId(@Param("tournamentId") Long tournamentId);
}
