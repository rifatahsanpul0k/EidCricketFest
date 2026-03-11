package com.eidcricketfest.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.eidcricketfest.config.CricketConstants;
import com.eidcricketfest.dto.DeliveryRequestDTO;
import com.eidcricketfest.dto.LiveScoreboardDTO;
import com.eidcricketfest.entity.Delivery;
import com.eidcricketfest.entity.MatchFixture;
import com.eidcricketfest.entity.Player;
import com.eidcricketfest.repository.DeliveryRepository;
import com.eidcricketfest.repository.MatchFixtureRepository;
import com.eidcricketfest.repository.PlayerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class LedgerService {

  private final DeliveryRepository deliveryRepository;
  private final MatchFixtureRepository matchFixtureRepository;
  private final PlayerRepository playerRepository;

  public void recordDelivery(Long matchId, DeliveryRequestDTO request) {
    MatchFixture match = matchFixtureRepository.findById(matchId).orElseThrow();
    Player striker = playerRepository.findById(request.getStrikerId()).orElseThrow();
    Player nonStriker = playerRepository.findById(request.getNonStrikerId()).orElseThrow();
    Player bowler = playerRepository.findById(request.getBowlerId()).orElseThrow();

    // Assume over logic is calculated later/elsewhere, or default to 0 for now.
    Delivery delivery = Delivery.builder()
        .match(match)
        .striker(striker)
        .nonStriker(nonStriker)
        .bowler(bowler)
        .runsOffBat(request.getRunsOffBat())
        .extras(request.getExtras())
        .extraType(request.getExtraType())
        .isWicket(request.isWicket())
        .wicketType(request.getWicketType() != null ? request.getWicketType() : Delivery.WicketType.NONE)
        .build();

    deliveryRepository.save(delivery);
  }

  @Transactional(isolation = Isolation.SERIALIZABLE)
  public void undoLastDelivery(Long matchId) {
    // Query the latest delivery for the given match (rollback using reverse order
    // sort on IDs)
    List<Delivery> matchDeliveries = deliveryRepository.findAll().stream()
        .filter(d -> d.getMatch().getId().equals(matchId))
        .sorted((d1, d2) -> Long.compare(d2.getId(), d1.getId()))
        .collect(Collectors.toList());

    if (!matchDeliveries.isEmpty()) {
      Delivery latestDelivery = matchDeliveries.get(0);
      deliveryRepository.delete(latestDelivery); // Instant rollback
    }
  }

  @Transactional(readOnly = true)
  public LiveScoreboardDTO getLiveScoreboard(Long matchId) {
    // Use database-level aggregation instead of loading all deliveries into memory
    int totalRuns = deliveryRepository.getTotalRunsByMatchId(matchId);
    long totalWickets = deliveryRepository.getTotalWicketsByMatchId(matchId);
    long validBalls = deliveryRepository.getValidBallsCountByMatchId(matchId);

    // Dynamically compute Overs
    int overs = (int) (validBalls / CricketConstants.BALLS_PER_OVER);
    int ballsInCurrentOver = (int) (validBalls % CricketConstants.BALLS_PER_OVER);
    String currentOvers = overs + "." + ballsInCurrentOver;

    return LiveScoreboardDTO.builder()
        .matchId(matchId)
        .totalRuns(totalRuns)
        .totalWickets((int) totalWickets)
        .overs(currentOvers)
        .build();
  }
}
