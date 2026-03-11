package com.eidcricketfest.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tournaments")
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private int seasonYear;
    private int maxOvers;
    private boolean isActive;

    // Rules
    @Builder.Default
    private int rounds = 1; // number of times each team plays each other

    @Builder.Default
    private int powerplayOvers = 6; // powerplay length

    @Builder.Default
    private int maxBowlerOvers = 4; // max overs per bowler

    @Builder.Default
    private int maxTeamSize = 11; // squad size

    @Column(length = 1000)
    private String rulesText; // freeform tournament rules
}
