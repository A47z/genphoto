package com.genphoto.favorite.service;

import com.genphoto.common.exception.BusinessException;
import com.genphoto.favorite.model.Favorite;
import com.genphoto.favorite.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;

    /**
     * 收藏图片
     */
    public void addFavorite(Long userId, Long imageId) {
        if (favoriteRepository.existsByUserIdAndImageId(userId, imageId)) {
            throw new BusinessException("已经收藏过了");
        }
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setImageId(imageId);
        favoriteRepository.save(favorite);
    }

    /**
     * 取消收藏
     */
    public void removeFavorite(Long userId, Long imageId) {
        Favorite favorite = favoriteRepository.findByUserIdAndImageId(userId, imageId)
                .orElseThrow(() -> new BusinessException("未收藏此图片"));
        favoriteRepository.delete(favorite);
    }

    /**
     * 获取收藏列表
     */
    public Page<Favorite> getMyFavorites(Long userId, int page, int size) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    /**
     * 检查是否已收藏
     */
    public boolean isFavorited(Long userId, Long imageId) {
        return favoriteRepository.existsByUserIdAndImageId(userId, imageId);
    }
}
