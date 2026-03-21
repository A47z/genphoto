package com.genphoto.generation.service;

import com.genphoto.common.exception.BusinessException;
import com.genphoto.generation.dto.GenerateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.model.Media;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;

/**
 * AI生图服务 - 通过ChatModel调用生图API（兼容OpenAI chat completions接口）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImageGenerationService {

    private final ChatModel chatModel;

    /**
     * 调用AI模型生成图片，返回图片byte[]
     */
    public GenerateResult generate(GenerateRequest request) {
        try {
            String promptText = buildImagePrompt(request);

            log.info("开始生成图片, prompt: {}, model: {}", request.getPrompt(), request.getModel());

            ChatResponse response = chatModel.call(new Prompt(promptText,
                    OpenAiChatOptions.builder()
                            .model(request.getModel())
                            .build()));

            var output = response.getResult().getOutput();

            // 优先从 media 附件提取图片（Gemini 生图模型的返回方式）
            List<Media> mediaList = output.getMedia();
            if (mediaList != null && !mediaList.isEmpty()) {
                Media media = mediaList.get(0);
                byte[] imageBytes = media.getDataAsByteArray();
                log.info("从media附件提取图片, 大小: {} bytes", imageBytes.length);
                return new GenerateResult(imageBytes, null);
            }

            // 从文本内容提取
            String content = output.getText();
            log.info("图片生成完成, 响应长度: {}", content != null ? content.length() : 0);

            if (content == null || content.isEmpty()) {
                throw new BusinessException("AI未返回图片内容");
            }

            // 尝试提取为 byte[]
            byte[] imageBytes = tryExtractBytes(content);
            if (imageBytes != null) {
                return new GenerateResult(imageBytes, null);
            }

            // 尝试提取为 URL
            String imageUrl = extractHttpUrl(content);
            if (imageUrl != null) {
                return new GenerateResult(null, imageUrl);
            }

            throw new BusinessException("无法从AI响应中提取图片");
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("图片生成失败", e);
            throw new BusinessException("图片生成失败: " + e.getMessage());
        }
    }

    /**
     * 生成结果：要么是byte[]，要么是URL
     */
    public record GenerateResult(byte[] imageBytes, String imageUrl) {
        public boolean hasBytes() {
            return imageBytes != null && imageBytes.length > 0;
        }
    }

    private String buildImagePrompt(GenerateRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Generate an image: ").append(request.getPrompt());
        if (request.getStyle() != null && !request.getStyle().isEmpty()) {
            sb.append(", style: ").append(request.getStyle());
        }
        if (request.getWidth() != null && request.getHeight() != null) {
            sb.append(", size: ").append(request.getWidth()).append("x").append(request.getHeight());
        }
        return sb.toString();
    }

    /**
     * 尝试将文本内容解析为图片字节（base64数据）
     */
    private byte[] tryExtractBytes(String content) {
        // 检查是否是 data URI
        if (content.contains("data:image")) {
            int commaIdx = content.indexOf(",", content.indexOf("data:image"));
            if (commaIdx != -1) {
                String base64Part = content.substring(commaIdx + 1).trim();
                // 去除可能的尾部非base64字符
                int endIdx = base64Part.indexOf("\"");
                if (endIdx == -1) endIdx = base64Part.indexOf(")");
                if (endIdx == -1) endIdx = base64Part.indexOf(" ");
                if (endIdx != -1) base64Part = base64Part.substring(0, endIdx);
                try {
                    return Base64.getDecoder().decode(base64Part);
                } catch (IllegalArgumentException e) {
                    log.warn("base64解码失败, 尝试其他方式");
                }
            }
        }

        // 检查是否是纯base64字符串（无空格，长度>100）
        String trimmed = content.trim();
        if (trimmed.length() > 100 && !trimmed.contains(" ") && !trimmed.contains("\n")) {
            try {
                return Base64.getDecoder().decode(trimmed);
            } catch (IllegalArgumentException e) {
                log.warn("纯文本base64解码失败");
            }
        }

        return null;
    }

    /**
     * 从文本内容中提取HTTP URL
     */
    private String extractHttpUrl(String content) {
        // markdown图片格式 ![...](url)
        if (content.contains("![")) {
            int start = content.indexOf("](");
            if (start != -1) {
                int end = content.indexOf(")", start + 2);
                if (end != -1) {
                    String url = content.substring(start + 2, end);
                    if (url.startsWith("http")) return url;
                }
            }
        }

        // 直接以URL开头
        if (content.startsWith("http://") || content.startsWith("https://")) {
            return content.trim();
        }

        // 内容中包含URL
        int httpIdx = content.indexOf("https://");
        if (httpIdx == -1) httpIdx = content.indexOf("http://");
        if (httpIdx != -1) {
            int end = content.indexOf(" ", httpIdx);
            if (end == -1) end = content.indexOf("\n", httpIdx);
            if (end == -1) end = content.length();
            return content.substring(httpIdx, end).trim();
        }

        return null;
    }
}
