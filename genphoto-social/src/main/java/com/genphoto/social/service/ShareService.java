package com.genphoto.social.service;

import com.genphoto.common.exception.BusinessException;
import com.genphoto.common.event.ImagePublishedEvent;
import com.genphoto.image.model.Image;
import com.genphoto.image.repository.ImageRepository;
import com.genphoto.social.dto.PublicImageResponse;
import com.genphoto.user.model.User;
import com.genphoto.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShareService {

    private final ImageRepository imageRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 切换图片公开/私有状态
     */
    public void toggleVisibility(Long imageId, Long userId, boolean isPublic) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new BusinessException("图片不存在"));
        if (!image.getUserId().equals(userId)) {
            throw new BusinessException("无权操作此图片");
        }

        boolean wasPrivate = !Boolean.TRUE.equals(image.getIsPublic());
        image.setIsPublic(isPublic);
        imageRepository.save(image);

        // 从私有变公开时，发布事件触发 AI 自动评价
        if (wasPrivate && isPublic) {
            eventPublisher.publishEvent(new ImagePublishedEvent(
                    imageId, image.getPrompt(), image.getModel(), image.getStyle()));
        }
    }

    public Page<PublicImageResponse> getPublicImages(int page, int size) {
        Page<Image> imagePage = imageRepository.findByIsPublicTrueOrderByCreatedAtDesc(PageRequest.of(page, size));
        List<PublicImageResponse> responses = enrichWithUserInfo(imagePage.getContent());
        return new PageImpl<>(responses, imagePage.getPageable(), imagePage.getTotalElements());
    }

    public PublicImageResponse getPublicImageDetail(Long imageId) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new BusinessException("图片不存在"));
        if (!image.getIsPublic()) {
            throw new BusinessException("该图片未公开");
        }
        return enrichWithUserInfo(List.of(image)).get(0);
    }

    private List<PublicImageResponse> enrichWithUserInfo(List<Image> images) {
        List<Long> userIds = images.stream().map(Image::getUserId).distinct().collect(Collectors.toList());
        Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        return images.stream().map(img -> {
            User user = userMap.get(img.getUserId());
            String nickname = user != null ? user.getNickname() : "用户";
            String avatarUrl = user != null ? user.getAvatarUrl() : null;
            return PublicImageResponse.from(img, nickname, avatarUrl);
        }).collect(Collectors.toList());
    }
}
