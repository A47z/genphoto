package com.genphoto.image.repository;

import com.genphoto.image.model.Image;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ImageRepository extends JpaRepository<Image, Long> {

    Page<Image> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Image> findByIsPublicTrueOrderByCreatedAtDesc(Pageable pageable);

    List<Image> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndCreatedAtAfter(Long userId, LocalDateTime after);

    @Query("SELECT i.model AS model, COUNT(i) AS count FROM Image i WHERE i.userId = :userId GROUP BY i.model ORDER BY count DESC")
    List<Object[]> countByUserIdGroupByModel(@Param("userId") Long userId);

    @Query("SELECT i.style AS style, COUNT(i) AS count FROM Image i WHERE i.userId = :userId GROUP BY i.style ORDER BY count DESC")
    List<Object[]> countByUserIdGroupByStyle(@Param("userId") Long userId);

    @Query("SELECT FUNCTION('DATE', i.createdAt) AS date, COUNT(i) AS count FROM Image i WHERE i.userId = :userId AND i.createdAt BETWEEN :start AND :end GROUP BY FUNCTION('DATE', i.createdAt) ORDER BY date")
    List<Object[]> countByDay(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
