package com.genphoto.stats.service;

import com.genphoto.image.model.Image;
import com.genphoto.image.repository.ImageRepository;
import com.genphoto.stats.dto.MyStatsResponse;
import com.genphoto.stats.dto.OverviewResponse;
import com.genphoto.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ImageRepository imageRepository;
    private final UserRepository userRepository;

    /**
     * 我的统计概览
     */
    public MyStatsResponse getMyStats(Long userId) {
        MyStatsResponse stats = new MyStatsResponse();
        stats.setTotalImages(imageRepository.countByUserId(userId));

        // 本周生成数
        LocalDateTime weekStart = LocalDate.now().minusDays(7).atStartOfDay();
        stats.setThisWeekImages(imageRepository.countByUserIdAndCreatedAtAfter(userId, weekStart));

        // 最常用模型
        List<Object[]> modelCounts = imageRepository.countByUserIdGroupByModel(userId);
        if (!modelCounts.isEmpty()) {
            stats.setMostUsedModel((String) modelCounts.get(0)[0]);
        }

        // 最常用风格
        List<Object[]> styleCounts = imageRepository.countByUserIdGroupByStyle(userId);
        if (!styleCounts.isEmpty()) {
            stats.setMostUsedStyle((String) styleCounts.get(0)[0]);
        }

        return stats;
    }

    /**
     * 按天统计生成数量
     */
    public Map<String, Long> getDailyStats(Long userId, LocalDate start, LocalDate end) {
        LocalDateTime startTime = start.atStartOfDay();
        LocalDateTime endTime = end.atTime(LocalTime.MAX);
        List<Object[]> results = imageRepository.countByDay(userId, startTime, endTime);

        Map<String, Long> dailyStats = new LinkedHashMap<>();
        for (Object[] row : results) {
            dailyStats.put(row[0].toString(), (Long) row[1]);
        }
        return dailyStats;
    }

    /**
     * 按模型统计使用次数
     */
    public Map<String, Long> getModelStats(Long userId) {
        List<Object[]> results = imageRepository.countByUserIdGroupByModel(userId);
        Map<String, Long> modelStats = new LinkedHashMap<>();
        for (Object[] row : results) {
            modelStats.put((String) row[0], (Long) row[1]);
        }
        return modelStats;
    }

    /**
     * 全站统计概览（管理员）
     */
    public OverviewResponse getOverview() {
        OverviewResponse overview = new OverviewResponse();
        overview.setTotalUsers(userRepository.count());
        overview.setTotalImages(imageRepository.count());
        return overview;
    }

    /**
     * 导出生成记录为CSV
     */
    public void exportCsv(Long userId, HttpServletResponse response) throws IOException {
        List<Image> images = imageRepository.findByUserIdOrderByCreatedAtDesc(userId);

        response.setContentType("text/csv;charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=my_images.csv");

        PrintWriter writer = response.getWriter();
        // 写入CSV头
        writer.println("ID,提示词,模型,风格,宽度,高度,文件大小,创建时间");
        // 写入数据行
        for (Image image : images) {
            writer.printf("%d,\"%s\",%s,%s,%d,%d,%d,%s%n",
                    image.getId(),
                    image.getPrompt() != null ? image.getPrompt().replace("\"", "\"\"") : "",
                    image.getModel() != null ? image.getModel() : "",
                    image.getStyle() != null ? image.getStyle() : "",
                    image.getWidth() != null ? image.getWidth() : 0,
                    image.getHeight() != null ? image.getHeight() : 0,
                    image.getFileSize() != null ? image.getFileSize() : 0,
                    image.getCreatedAt() != null ? image.getCreatedAt().toString() : "");
        }
        writer.flush();
    }
}
