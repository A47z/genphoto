package com.genphoto.ai.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiTextService {

    private final ChatLanguageModel chatLanguageModel;

    /**
     * 为公开图片生成 AI 评价
     */
    public String generateImageReview(String prompt, String model, String style) {
        String systemPrompt = """
                你是一位专业的 AI 艺术评论家。请用简洁优美的中文对以下 AI 生成图片进行评价（100-200字）。
                图片信息：
                - 创作提示词：%s
                - 使用模型：%s
                - 风格：%s
                请从构图、色彩、创意等角度给出有洞察力的评价。不要重复提示词内容，直接给出你的专业评论。
                """.formatted(prompt, model, style != null ? style : "默认");

        try {
            String review = chatLanguageModel.chat(systemPrompt);
            log.info("AI 评价生成成功, imagePrompt: {}", prompt);
            return review;
        } catch (Exception e) {
            log.error("AI 评价生成失败", e);
            return null;
        }
    }

    /**
     * 生成随机创意灵感提示词
     */
    public String generateInspiration() {
        String systemPrompt = """
                你是一位富有创意的 AI 艺术灵感大师。请生成一段用于 AI 图片生成的创意提示词（中文，50-100字）。
                要求：
                - 包含具体的画面描述（场景、主体、氛围）
                - 有艺术感和想象力
                - 适合用于 AI 图片生成
                - 每次生成不同风格和主题的创意
                只输出提示词本身，不要添加任何解释或前缀。
                """;

        try {
            String inspiration = chatLanguageModel.chat(systemPrompt);
            log.info("灵感提示词生成成功");
            return inspiration.trim();
        } catch (Exception e) {
            log.error("灵感生成失败", e);
            throw new com.genphoto.common.exception.BusinessException("AI 灵感生成失败: " + e.getMessage());
        }
    }

    /**
     * 优化用户的提示词
     */
    public String optimizePrompt(String userPrompt) {
        String systemPrompt = """
                你是一位专业的 AI 图片生成提示词优化专家。请优化以下用户提示词，使其更适合 AI 图片生成。
                用户原始提示词：%s

                要求：
                - 保留用户的核心意图
                - 补充画面细节（光影、材质、氛围、构图等）
                - 使描述更加具体和生动
                - 输出中文，80-150字
                - 只输出优化后的提示词，不要添加解释
                """.formatted(userPrompt);

        try {
            String optimized = chatLanguageModel.chat(systemPrompt);
            log.info("提示词优化成功, 原始: {}", userPrompt);
            return optimized.trim();
        } catch (Exception e) {
            log.error("提示词优化失败", e);
            throw new com.genphoto.common.exception.BusinessException("AI 提示词优化失败: " + e.getMessage());
        }
    }
}
