package com.genphoto.social.repository;

import com.genphoto.social.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    Page<Comment> findByImageIdOrderByCreatedAtDesc(Long imageId, Pageable pageable);
}
