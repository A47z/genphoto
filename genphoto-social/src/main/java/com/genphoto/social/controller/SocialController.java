package com.genphoto.social.controller;

import com.genphoto.common.dto.PageResult;
import com.genphoto.common.dto.Result;
import com.genphoto.social.dto.CommentRequest;
import com.genphoto.social.dto.PublicImageResponse;
import com.genphoto.social.model.Comment;
import com.genphoto.social.service.CommentService;
import com.genphoto.social.service.ShareService;
import com.genphoto.user.model.User;
import com.genphoto.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SocialController {

    private final ShareService shareService;
    private final CommentService commentService;
    private final UserRepository userRepository;

    // ===== 分享相关 =====

    @PutMapping("/api/share/{imageId}")
    public Result<Void> toggleVisibility(Authentication authentication,
                                          @PathVariable Long imageId,
                                          @RequestBody Map<String, Boolean> body) {
        Long userId = (Long) authentication.getPrincipal();
        shareService.toggleVisibility(imageId, userId, body.get("isPublic"));
        return Result.success();
    }

    @GetMapping("/api/share/public")
    public Result<PageResult<PublicImageResponse>> getPublicImages(@RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "12") int size) {
        Page<PublicImageResponse> images = shareService.getPublicImages(page, size);
        return Result.success(PageResult.of(images));
    }

    @GetMapping("/api/share/public/{imageId}")
    public Result<PublicImageResponse> getPublicImageDetail(@PathVariable Long imageId) {
        return Result.success(shareService.getPublicImageDetail(imageId));
    }

    // ===== 评论相关 =====

    @PostMapping("/api/comments/{imageId}")
    public Result<Comment> addComment(Authentication authentication,
                                       @PathVariable Long imageId,
                                       @Valid @RequestBody CommentRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        String nickname = userRepository.findById(userId)
                .map(User::getNickname)
                .orElse("用户");
        Comment comment = commentService.addComment(userId, imageId, request.getContent(), nickname);
        return Result.success(comment);
    }

    @GetMapping("/api/comments/{imageId}")
    public Result<PageResult<Comment>> getComments(@PathVariable Long imageId,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        Page<Comment> comments = commentService.getComments(imageId, page, size);
        return Result.success(PageResult.of(comments));
    }

    @DeleteMapping("/api/comments/{commentId}")
    public Result<Void> deleteComment(Authentication authentication,
                                       @PathVariable Long commentId) {
        Long userId = (Long) authentication.getPrincipal();
        commentService.deleteComment(commentId, userId);
        return Result.success();
    }
}
