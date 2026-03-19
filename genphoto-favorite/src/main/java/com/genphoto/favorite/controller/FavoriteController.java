package com.genphoto.favorite.controller;

import com.genphoto.common.dto.PageResult;
import com.genphoto.common.dto.Result;
import com.genphoto.favorite.model.Favorite;
import com.genphoto.favorite.model.Tag;
import com.genphoto.favorite.service.FavoriteService;
import com.genphoto.favorite.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final TagService tagService;

    // ===== 收藏相关 =====

    @PostMapping("/api/favorites")
    public Result<Void> addFavorite(Authentication authentication,
                                    @RequestBody Map<String, Long> body) {
        Long userId = (Long) authentication.getPrincipal();
        favoriteService.addFavorite(userId, body.get("imageId"));
        return Result.success();
    }

    @DeleteMapping("/api/favorites/{imageId}")
    public Result<Void> removeFavorite(Authentication authentication,
                                       @PathVariable Long imageId) {
        Long userId = (Long) authentication.getPrincipal();
        favoriteService.removeFavorite(userId, imageId);
        return Result.success();
    }

    @GetMapping("/api/favorites")
    public Result<PageResult<Favorite>> getMyFavorites(Authentication authentication,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "12") int size) {
        Long userId = (Long) authentication.getPrincipal();
        Page<Favorite> favorites = favoriteService.getMyFavorites(userId, page, size);
        return Result.success(PageResult.of(favorites));
    }

    // ===== 标签相关 =====

    @PostMapping("/api/tags")
    public Result<Void> addTag(@RequestBody Map<String, Object> body) {
        Long imageId = Long.valueOf(body.get("imageId").toString());
        String tagName = body.get("tagName").toString();
        tagService.addTag(imageId, tagName);
        return Result.success();
    }

    @DeleteMapping("/api/tags/{imageId}/{tagName}")
    public Result<Void> removeTag(@PathVariable Long imageId, @PathVariable String tagName) {
        tagService.removeTag(imageId, tagName);
        return Result.success();
    }

    @GetMapping("/api/tags")
    public Result<List<Tag>> getAllTags() {
        return Result.success(tagService.getAllTags());
    }

    @GetMapping("/api/tags/image/{imageId}")
    public Result<List<Tag>> getImageTags(@PathVariable Long imageId) {
        return Result.success(tagService.getTagsByImageId(imageId));
    }

    @GetMapping("/api/images/by-tag")
    public Result<List<Long>> getImagesByTag(@RequestParam String tag) {
        return Result.success(tagService.getImageIdsByTag(tag));
    }
}
