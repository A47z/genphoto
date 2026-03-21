package com.genphoto.social.service;

import com.genphoto.common.exception.BusinessException;
import com.genphoto.social.model.Comment;
import com.genphoto.social.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    /**
     * 发表评论
     */
    public Comment addComment(Long userId, Long imageId, String content, String nickname) {
        Comment comment = new Comment();
        comment.setUserId(userId);
        comment.setImageId(imageId);
        comment.setContent(content);
        comment.setNickname(nickname);
        comment.setIsAiReview(false);
        return commentRepository.save(comment);
    }

    /**
     * AI 自动评论
     */
    public Comment addAiComment(Long imageId, String content) {
        Comment comment = new Comment();
        comment.setUserId(0L);
        comment.setImageId(imageId);
        comment.setContent(content);
        comment.setNickname("AI 助手");
        comment.setIsAiReview(true);
        return commentRepository.save(comment);
    }

    /**
     * 获取某张图片的评论列表
     */
    public Page<Comment> getComments(Long imageId, int page, int size) {
        return commentRepository.findByImageIdOrderByCreatedAtDesc(imageId, PageRequest.of(page, size));
    }

    /**
     * 删除评论（只能删自己的）
     */
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException("评论不存在"));
        if (!comment.getUserId().equals(userId)) {
            throw new BusinessException("只能删除自己的评论");
        }
        commentRepository.delete(comment);
    }
}
