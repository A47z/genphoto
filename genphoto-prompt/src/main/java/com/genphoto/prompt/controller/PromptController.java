package com.genphoto.prompt.controller;

import com.genphoto.common.dto.PageResult;
import com.genphoto.common.dto.Result;
import com.genphoto.prompt.dto.RenderRequest;
import com.genphoto.prompt.dto.TemplateRequest;
import com.genphoto.prompt.model.PromptHistory;
import com.genphoto.prompt.model.PromptTemplate;
import com.genphoto.prompt.service.PromptHistoryService;
import com.genphoto.prompt.service.PromptTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prompts")
@RequiredArgsConstructor
public class PromptController {

    private final PromptTemplateService templateService;
    private final PromptHistoryService historyService;

    /**
     * 获取模板列表
     */
    @GetMapping("/templates")
    public Result<PageResult<PromptTemplate>> getTemplates(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PromptTemplate> templates = templateService.getTemplates(category, page, size);
        return Result.success(PageResult.of(templates));
    }

    /**
     * 获取模板详情
     */
    @GetMapping("/templates/{id}")
    public Result<PromptTemplate> getTemplate(@PathVariable Long id) {
        return Result.success(templateService.getTemplate(id));
    }

    /**
     * 创建模板
     */
    @PostMapping("/templates")
    public Result<PromptTemplate> createTemplate(Authentication authentication,
                                                  @Valid @RequestBody TemplateRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        PromptTemplate template = templateService.createTemplate(
                userId, request.getName(), request.getTemplateText(), request.getCategory());
        return Result.success(template);
    }

    /**
     * 渲染模板（填入变量生成最终提示词）
     */
    @PostMapping("/templates/{id}/render")
    public Result<String> renderTemplate(@PathVariable Long id,
                                         @Valid @RequestBody RenderRequest request) {
        String result = templateService.renderTemplate(id, request.getVariables());
        return Result.success(result);
    }

    /**
     * 删除模板
     */
    @DeleteMapping("/templates/{id}")
    public Result<Void> deleteTemplate(Authentication authentication, @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        templateService.deleteTemplate(id, userId);
        return Result.success();
    }

    /**
     * 获取提示词历史
     */
    @GetMapping("/history")
    public Result<PageResult<PromptHistory>> getHistory(Authentication authentication,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "10") int size) {
        Long userId = (Long) authentication.getPrincipal();
        Page<PromptHistory> history = historyService.getHistory(userId, page, size);
        return Result.success(PageResult.of(history));
    }

    /**
     * 删除某条历史
     */
    @DeleteMapping("/history/{id}")
    public Result<Void> deleteHistory(Authentication authentication, @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        historyService.deleteHistory(id, userId);
        return Result.success();
    }
}
