package com.genphoto.social.dto;

import com.genphoto.image.model.Image;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicImageResponse {
    private Long id;
    private Long userId;
    private String prompt;
    private String filePath;
    private Long fileSize;
    private Integer width;
    private Integer height;
    private String model;
    private String style;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private String nickname;
    private String avatarUrl;

    public static PublicImageResponse from(Image image, String nickname, String avatarUrl) {
        return PublicImageResponse.builder()
                .id(image.getId())
                .userId(image.getUserId())
                .prompt(image.getPrompt())
                .filePath(image.getFilePath())
                .fileSize(image.getFileSize())
                .width(image.getWidth())
                .height(image.getHeight())
                .model(image.getModel())
                .style(image.getStyle())
                .isPublic(image.getIsPublic())
                .createdAt(image.getCreatedAt())
                .nickname(nickname)
                .avatarUrl(avatarUrl)
                .build();
    }
}
