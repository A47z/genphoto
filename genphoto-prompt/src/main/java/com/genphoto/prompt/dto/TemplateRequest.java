package com.genphoto.prompt.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TemplateRequest {

    @NotBlank(message = "模板名称不能为空")
    private String name;

    @NotBlank(message = "模板内容不能为空")
    private String templateText;

    private String category;
}
