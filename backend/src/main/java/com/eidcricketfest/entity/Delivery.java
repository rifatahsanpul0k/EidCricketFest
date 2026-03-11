package com.eidcricketfest.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "deliveries")
public class Delivery {

    public enum ExtraType {
        NONE, WIDE, NO_BALL, BYE, LEG_BYE
    }

    public enum WicketType {
        NONE, BOWLED, CAUGHT, RUN_OUT, LBW
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private MatchFixture match;

    private int overNumber;
    private int ballNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "striker_id", nullable = false)
    private Player striker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "non_striker_id", nullable = false)
    private Player nonStriker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bowler_id", nullable = false)
    private Player bowler;

    private int runsOffBat;
    private int extras;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExtraType extraType;

    private boolean isWicket;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WicketType wicketType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fielder_involved_id")
    private Player fielderInvolved;
}
