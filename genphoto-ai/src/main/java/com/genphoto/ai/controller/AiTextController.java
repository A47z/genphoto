package com.genphoto.ai.controller;

import com.genphoto.ai.service.AiTextService;
import com.genphoto.common.dto.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiTextController {

    private final AiTextService aiTextService;

    /**
     * 生成随机灵感提示词
     */
    @PostMapping("/prompt/inspire")
    public Result<String> inspire(Authentication authentication) {
        String inspiration = aiTextService.generateInspiration();
        return Result.success(inspiration);
    }

    /**
     * 优化用户提示词
     */
    @PostMapping("/prompt/optimize")
    public Result<String> optimize(Authentication authentication,
                                   @RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        if (prompt == null || prompt.isBlank()) {
            return Result.error("提示词不能为空");
        }
        String optimized = aiTextService.optimizePrompt(prompt);
        return Result.success(optimized);
    }
}
