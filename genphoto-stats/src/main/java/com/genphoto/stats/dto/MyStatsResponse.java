package com.genphoto.stats.dto;

import lombok.Data;

@Data
public class MyStatsResponse {
    private long totalImages;
    private long thisWeekImages;
    private String mostUsedModel;
    private String mostUsedStyle;
}
