package com.genphoto.favorite.repository;

import com.genphoto.favorite.model.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Page<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Favorite> findByUserIdAndImageId(Long userId, Long imageId);

    boolean existsByUserIdAndImageId(Long userId, Long imageId);
}
