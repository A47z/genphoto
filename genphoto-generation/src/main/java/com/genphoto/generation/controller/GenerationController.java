package com.genphoto.generation.controller;

import com.genphoto.common.dto.Result;
import com.genphoto.generation.dto.GenerateRequest;
import com.genphoto.generation.dto.GenerateResponse;
import com.genphoto.generation.service.ImageGenerationService;
import com.genphoto.image.model.Image;
import com.genphoto.image.service.ImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/generation")
@RequiredArgsConstructor
public class GenerationController {

    private final ImageGenerationService imageGenerationService;
    private final ImageService imageService;

    /**
     * 生成图片并自动保存到MinIO
     */
    @PostMapping("/generate")
    public Result<GenerateResponse> generate(Authentication authentication,
                                             @Valid @RequestBody GenerateRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        int w = request.getWidth() != null ? request.getWidth() : 1024;
        int h = request.getHeight() != null ? request.getHeight() : 1024;

        ImageGenerationService.GenerateResult result = imageGenerationService.generate(request);

        Image saved;
        if (result.hasBytes()) {
            // 直接用byte[]保存（base64/media返回）
            saved = imageService.saveFromBytes(result.imageBytes(), userId,
                    request.getPrompt(), request.getModel(), request.getStyle(), w, h);
        } else {
            // 用URL下载保存（HTTP URL返回）
            saved = imageService.saveFromUrl(result.imageUrl(), userId,
                    request.getPrompt(), request.getModel(), request.getStyle(), w, h);
        }

        String persistentUrl = "/api/images/" + saved.getId() + "/file";
        GenerateResponse response = new GenerateResponse(
                persistentUrl, request.getPrompt(), request.getModel(), w, h);
        return Result.success(response);
    }

    @GetMapping("/models")
    public Result<List<Map<String, String>>> getModels() {
        List<Map<String, String>> models = List.of(
                Map.of("id", "gemini-2.5-flash-image", "name", "Gemini 2.5 Flash", "description", "Google Gemini 图片生成模型（推荐）"),
                Map.of("id", "gemini-3.1-flash-image-preview", "name", "Gemini 3.1 Flash", "description", "Gemini 3.1 图片生成预览版"),
                Map.of("id", "gemini-3-pro-image-preview", "name", "Gemini 3 Pro", "description", "Gemini 3 Pro 图片生成预览版")
        );
        return Result.success(models);
    }

    @GetMapping("/styles")
    public Result<List<Map<String, String>>> getStyles() {
        List<Map<String, String>> styles = List.of(
                Map.of("id", "natural", "name", "自然", "description", "自然写实风格"),
                Map.of("id", "vivid", "name", "生动", "description", "高饱和度艺术风格"),
                Map.of("id", "anime", "name", "动漫", "description", "日系动漫风格"),
                Map.of("id", "oil-painting", "name", "油画", "description", "古典油画风格"),
                Map.of("id", "watercolor", "name", "水彩", "description", "水彩画风格"),
                Map.of("id", "pixel-art", "name", "像素", "description", "像素艺术风格")
        );
        return Result.success(styles);
    }
}
