package com.genphoto.image.controller;

import com.genphoto.common.dto.PageResult;
import com.genphoto.common.dto.Result;
import com.genphoto.image.dto.ImageResponse;
import com.genphoto.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @GetMapping
    public Result<PageResult<ImageResponse>> getMyImages(Authentication authentication,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "12") int size) {
        Long userId = (Long) authentication.getPrincipal();
        Page<ImageResponse> images = imageService.getMyImages(userId, page, size);
        return Result.success(PageResult.of(images));
    }

    @GetMapping("/{id}")
    public Result<ImageResponse> getImageDetail(@PathVariable Long id) {
        return Result.success(imageService.getImageDetail(id));
    }

    /**
     * 下载/显示图片文件（带缓存）
     */
    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> getImageFile(@PathVariable Long id,
                                                  @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch) {
        String etag = "\"img-" + id + "\"";

        // 如果 ETag 匹配，返回 304
        if (etag.equals(ifNoneMatch)) {
            return ResponseEntity.status(304).build();
        }

        Resource resource = imageService.getImageFile(id);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic().immutable())
                .eTag(etag)
                .body(resource);
    }

    @PostMapping("/upload")
    public Result<ImageResponse> upload(Authentication authentication,
                                        @RequestParam("file") MultipartFile file) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(imageService.getImageDetail(imageService.upload(file, userId).getId()));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteImage(Authentication authentication, @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        imageService.deleteImage(id, userId);
        return Result.success();
    }
}
