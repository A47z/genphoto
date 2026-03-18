package com.genphoto.image.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ImageResponse {
    private Long id;
    private Long userId;
    private String prompt;
    private String filePath;
    private String imageUrl;
    private Long fileSize;
    private Integer width;
    private Integer height;
    private String model;
    private String style;
    private Boolean isPublic;
    private LocalDateTime createdAt;
}
