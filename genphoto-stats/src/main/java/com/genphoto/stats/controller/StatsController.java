package com.genphoto.stats.controller;

import com.genphoto.common.dto.Result;
import com.genphoto.stats.dto.MyStatsResponse;
import com.genphoto.stats.dto.OverviewResponse;
import com.genphoto.stats.service.StatsService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    /**
     * 我的统计概览
     */
    @GetMapping("/my")
    public Result<MyStatsResponse> getMyStats(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(statsService.getMyStats(userId));
    }

    /**
     * 按天统计我的生成数量
     */
    @GetMapping("/my/daily")
    public Result<Map<String, Long>> getDailyStats(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(statsService.getDailyStats(userId, start, end));
    }

    /**
     * 按模型统计使用次数
     */
    @GetMapping("/my/models")
    public Result<Map<String, Long>> getModelStats(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(statsService.getModelStats(userId));
    }

    /**
     * 全站统计概览（管理员）
     */
    @GetMapping("/overview")
    public Result<OverviewResponse> getOverview() {
        return Result.success(statsService.getOverview());
    }

    /**
     * 导出我的生成记录为CSV
     */
    @GetMapping("/export")
    public void exportCsv(Authentication authentication, HttpServletResponse response) throws IOException {
        Long userId = (Long) authentication.getPrincipal();
        statsService.exportCsv(userId, response);
    }
}
