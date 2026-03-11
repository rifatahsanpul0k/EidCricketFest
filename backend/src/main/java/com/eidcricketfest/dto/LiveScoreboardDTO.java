package com.eidcricketfest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveScoreboardDTO {
    private Long matchId;
    private int totalRuns;
    private int totalWickets;
    private String overs;
}
