package com.genphoto.user.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserProfileResponse {
    private Long id;
    private String email;
    private String nickname;
    private String avatarUrl;
    private String role;
    private LocalDateTime createdAt;
}
