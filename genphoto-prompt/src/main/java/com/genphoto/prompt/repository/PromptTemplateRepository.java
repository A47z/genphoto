package com.genphoto.prompt.repository;

import com.genphoto.prompt.model.PromptTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PromptTemplateRepository extends JpaRepository<PromptTemplate, Long> {

    Page<PromptTemplate> findByCategoryOrderByCreatedAtDesc(String category, Pageable pageable);

    Page<PromptTemplate> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<PromptTemplate> findByUserId(Long userId);
}
