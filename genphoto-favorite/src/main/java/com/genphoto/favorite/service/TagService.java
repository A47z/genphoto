package com.genphoto.favorite.service;

import com.genphoto.common.exception.BusinessException;
import com.genphoto.favorite.model.ImageTag;
import com.genphoto.favorite.model.Tag;
import com.genphoto.favorite.repository.ImageTagRepository;
import com.genphoto.favorite.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final ImageTagRepository imageTagRepository;

    /**
     * 给图片打标签（标签不存在则自动创建）
     */
    public void addTag(Long imageId, String tagName) {
        Tag tag = tagRepository.findByName(tagName)
                .orElseGet(() -> {
                    Tag newTag = new Tag();
                    newTag.setName(tagName);
                    return tagRepository.save(newTag);
                });

        if (imageTagRepository.findByImageIdAndTagId(imageId, tag.getId()).isPresent()) {
            throw new BusinessException("该标签已存在");
        }

        ImageTag imageTag = new ImageTag();
        imageTag.setImageId(imageId);
        imageTag.setTagId(tag.getId());
        imageTagRepository.save(imageTag);
    }

    /**
     * 移除标签
     */
    public void removeTag(Long imageId, String tagName) {
        Tag tag = tagRepository.findByName(tagName)
                .orElseThrow(() -> new BusinessException("标签不存在"));
        ImageTag imageTag = imageTagRepository.findByImageIdAndTagId(imageId, tag.getId())
                .orElseThrow(() -> new BusinessException("该图片没有此标签"));
        imageTagRepository.delete(imageTag);
    }

    /**
     * 获取所有标签
     */
    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    /**
     * 获取图片的标签
     */
    public List<Tag> getTagsByImageId(Long imageId) {
        List<ImageTag> imageTags = imageTagRepository.findByImageId(imageId);
        List<Long> tagIds = imageTags.stream().map(ImageTag::getTagId).collect(Collectors.toList());
        return tagRepository.findAllById(tagIds);
    }

    /**
     * 按标签筛选图片ID
     */
    public List<Long> getImageIdsByTag(String tagName) {
        Tag tag = tagRepository.findByName(tagName)
                .orElseThrow(() -> new BusinessException("标签不存在"));
        return imageTagRepository.findImageIdsByTagId(tag.getId());
    }
}
