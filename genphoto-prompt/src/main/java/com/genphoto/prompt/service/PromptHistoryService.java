package com.genphoto.prompt.service;

import com.genphoto.common.exception.BusinessException;
import com.genphoto.prompt.model.PromptHistory;
import com.genphoto.prompt.repository.PromptHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PromptHistoryService {

    private final PromptHistoryRepository historyRepository;

    /**
     * 记录提示词使用历史
     */
    public PromptHistory saveHistory(Long userId, String promptText, Long imageId) {
        PromptHistory history = new PromptHistory();
        history.setUserId(userId);
        history.setPromptText(promptText);
        history.setImageId(imageId);
        return historyRepository.save(history);
    }

    /**
     * 获取用户的提示词历史（分页）
     */
    public Page<PromptHistory> getHistory(Long userId, int page, int size) {
        return historyRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    /**
     * 删除某条历史记录
     */
    public void deleteHistory(Long historyId, Long userId) {
        PromptHistory history = historyRepository.findById(historyId)
                .orElseThrow(() -> new BusinessException("记录不存在"));
        if (!history.getUserId().equals(userId)) {
            throw new BusinessException("无权删除此记录");
        }
        historyRepository.delete(history);
    }
}
