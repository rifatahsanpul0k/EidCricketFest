package com.eidcricketfest.dto;

import com.eidcricketfest.entity.Delivery.ExtraType;
import com.eidcricketfest.entity.Delivery.WicketType;
import lombok.Data;

@Data
public class DeliveryRequestDTO {
    private int runsOffBat;
    private int extras;
    private ExtraType extraType;
    private boolean isWicket;
    private WicketType wicketType;

    private Long strikerId;
    private Long nonStrikerId;
    private Long bowlerId;
}
