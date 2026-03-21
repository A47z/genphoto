package com.genphoto.prompt.repository;

import com.genphoto.prompt.model.PromptHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromptHistoryRepository extends JpaRepository<PromptHistory, Long> {

    Page<PromptHistory> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
