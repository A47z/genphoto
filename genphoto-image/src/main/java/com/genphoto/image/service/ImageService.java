package com.genphoto.image.service;

import com.genphoto.common.exception.BusinessException;
import com.genphoto.image.dto.ImageResponse;
import com.genphoto.image.model.Image;
import com.genphoto.image.repository.ImageRepository;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.Base64;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageService {

    private final ImageRepository imageRepository;
    private final MinioClient minioClient;

    @Value("${genphoto.minio.bucket}")
    private String bucket;

    /**
     * 保存AI生成的图片（从URL下载后上传到MinIO，支持data URI）
     */
    public Image saveFromUrl(String imageUrl, Long userId, String prompt,
                             String model, String style, int width, int height) {
        try {
            byte[] imageBytes;
            if (imageUrl.startsWith("data:")) {
                // 处理 base64 data URI: data:image/png;base64,iVBOR...
                String base64Data = imageUrl.substring(imageUrl.indexOf(",") + 1);
                imageBytes = Base64.getDecoder().decode(base64Data);
            } else {
                // 处理普通 HTTP URL
                try (InputStream in = new URL(imageUrl).openStream()) {
                    imageBytes = in.readAllBytes();
                }
            }
            return saveFromBytes(imageBytes, userId, prompt, model, style, width, height);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("保存图片失败", e);
            throw new BusinessException("保存图片失败: " + e.getMessage());
        }
    }

    /**
     * 直接从byte[]保存图片到MinIO（生成服务首选方式）
     */
    public Image saveFromBytes(byte[] imageBytes, Long userId, String prompt,
                               String model, String style, int width, int height) {
        try {
            String objectKey = userId + "/" + UUID.randomUUID() + ".png";

            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .stream(new ByteArrayInputStream(imageBytes), imageBytes.length, -1)
                    .contentType("image/png")
                    .build());

            Image image = new Image();
            image.setUserId(userId);
            image.setPrompt(prompt);
            image.setFilePath(objectKey);
            image.setFileSize((long) imageBytes.length);
            image.setWidth(width);
            image.setHeight(height);
            image.setModel(model);
            image.setStyle(style);
            return imageRepository.save(image);
        } catch (Exception e) {
            log.error("保存图片到MinIO失败", e);
            throw new BusinessException("保存图片失败: " + e.getMessage());
        }
    }

    /**
     * 上传自定义图片到MinIO
     */
    public Image upload(MultipartFile file, Long userId) {
        try {
            String objectKey = userId + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());

            Image image = new Image();
            image.setUserId(userId);
            image.setFilePath(objectKey);
            image.setFileSize(file.getSize());
            return imageRepository.save(image);
        } catch (Exception e) {
            log.error("上传图片失败", e);
            throw new BusinessException("上传图片失败: " + e.getMessage());
        }
    }

    /**
     * 查询用户的图片列表（分页）
     */
    public Page<ImageResponse> getMyImages(Long userId, int page, int size) {
        Page<Image> images = imageRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
        return images.map(this::toResponse);
    }

    /**
     * 获取图片详情
     */
    public ImageResponse getImageDetail(Long imageId) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new BusinessException("图片不存在"));
        return toResponse(image);
    }

    /**
     * 获取图片文件（从MinIO读取）
     */
    public Resource getImageFile(Long imageId) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new BusinessException("图片不存在"));
        try {
            InputStream stream = minioClient.getObject(GetObjectArgs.builder()
                    .bucket(bucket)
                    .object(image.getFilePath())
                    .build());
            return new InputStreamResource(stream);
        } catch (Exception e) {
            log.error("读取图片文件失败: {}", image.getFilePath(), e);
            throw new BusinessException("图片文件不存在");
        }
    }

    /**
     * 删除图片
     */
    public void deleteImage(Long imageId, Long userId) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new BusinessException("图片不存在"));
        if (!image.getUserId().equals(userId)) {
            throw new BusinessException("无权删除此图片");
        }
        // 从MinIO删除文件
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(image.getFilePath())
                    .build());
        } catch (Exception e) {
            log.warn("删除MinIO对象失败: {}", image.getFilePath());
        }
        imageRepository.delete(image);
    }

    private ImageResponse toResponse(Image image) {
        ImageResponse response = new ImageResponse();
        response.setId(image.getId());
        response.setUserId(image.getUserId());
        response.setPrompt(image.getPrompt());
        response.setFilePath(image.getFilePath());
        response.setImageUrl("/api/images/" + image.getId() + "/file");
        response.setFileSize(image.getFileSize());
        response.setWidth(image.getWidth());
        response.setHeight(image.getHeight());
        response.setModel(image.getModel());
        response.setStyle(image.getStyle());
        response.setIsPublic(image.getIsPublic());
        response.setCreatedAt(image.getCreatedAt());
        return response;
    }
}
