package com.genphoto.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImagePublishedEvent {
    private Long imageId;
    private String prompt;
    private String model;
    private String style;
}
