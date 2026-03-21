package com.genphoto.ai.listener;

import com.genphoto.ai.service.AiTextService;
import com.genphoto.common.event.ImagePublishedEvent;
import com.genphoto.social.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ImagePublishedListener {

    private final AiTextService aiTextService;
    private final CommentService commentService;

    @Async
    @EventListener
    public void onImagePublished(ImagePublishedEvent event) {
        log.info("收到图片公开事件, imageId: {}", event.getImageId());
        try {
            String review = aiTextService.generateImageReview(
                    event.getPrompt(), event.getModel(), event.getStyle());
            if (review != null && !review.isBlank()) {
                commentService.addAiComment(event.getImageId(), review.trim());
                log.info("AI 评价已自动添加, imageId: {}", event.getImageId());
            }
        } catch (Exception e) {
            log.error("AI 自动评价失败, imageId: {}", event.getImageId(), e);
        }
    }
}
