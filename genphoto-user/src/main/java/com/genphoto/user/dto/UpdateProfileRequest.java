package com.genphoto.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 100, message = "昵称最长100字")
    private String nickname;

    @Size(max = 500, message = "头像URL过长")
    private String avatarUrl;
}
