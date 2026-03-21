package com.genphoto.generation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GenerateRequest {

    @NotBlank(message = "提示词不能为空")
    private String prompt;

    private String model = "gemini-2.5-flash-image";

    private Integer width = 1024;

    private Integer height = 1024;

    private String style = "natural"; // natural, vivid
}
