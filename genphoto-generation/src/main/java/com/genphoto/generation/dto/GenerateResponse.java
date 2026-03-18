package com.genphoto.generation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GenerateResponse {
    private String imageUrl;
    private String prompt;
    private String model;
    private Integer width;
    private Integer height;
}
