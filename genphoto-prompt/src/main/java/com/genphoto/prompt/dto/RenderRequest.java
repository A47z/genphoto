package com.genphoto.prompt.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;

@Data
public class RenderRequest {

    @NotNull(message = "变量不能为空")
    private Map<String, String> variables;
}
