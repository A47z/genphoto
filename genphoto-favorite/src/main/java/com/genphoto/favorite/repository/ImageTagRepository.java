package com.genphoto.favorite.repository;

import com.genphoto.favorite.model.ImageTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ImageTagRepository extends JpaRepository<ImageTag, Long> {

    List<ImageTag> findByImageId(Long imageId);

    Optional<ImageTag> findByImageIdAndTagId(Long imageId, Long tagId);

    @Query("SELECT it.imageId FROM ImageTag it WHERE it.tagId = :tagId")
    List<Long> findImageIdsByTagId(@Param("tagId") Long tagId);
}
