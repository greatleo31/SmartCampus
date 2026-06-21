package com.smartcampus.controller;

import com.smartcampus.common.ApiResponse;
import com.smartcampus.common.PageRequest;
import com.smartcampus.common.PageResult;
import com.smartcampus.service.CalendarService;
import com.smartcampus.vo.CalendarVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class StudentInfoController {
    private final CalendarService calendarService;

    @GetMapping("/api/calendar")
    @PreAuthorize("hasAuthority('student:calendar:view') or hasAuthority('dashboard:view')")
    public ApiResponse<CalendarVO> calendar(@RequestParam(required = false) String academicYear,
                                            @RequestParam(required = false) Integer term) {
        return ApiResponse.ok(calendarService.calendar(academicYear, term));
    }

    @GetMapping("/api/gpa-ranking")
    @PreAuthorize("hasAuthority('student:gpa:view') or hasAuthority('dashboard:view')")
    public ApiResponse<PageResult<Map<String, Object>>> gpaRanking(@Valid PageRequest request) {
        return ApiResponse.ok(page(request, List.of(
                Map.of("学期", "2025-2026-2", "绩点", "3.62", "专业排名", "12/86", "班级排名", "3/30"),
                Map.of("学期", "2025-2026-1", "绩点", "3.48", "专业排名", "18/86", "班级排名", "5/30")
        )));
    }

    @GetMapping("/api/exams")
    @PreAuthorize("hasAuthority('student:exam:view') or hasAuthority('dashboard:view')")
    public ApiResponse<PageResult<Map<String, Object>>> exams(@Valid PageRequest request) {
        return ApiResponse.ok(page(request, List.of(
                Map.of("学期", "2025-2026-2", "课程", "数据库系统", "考试时间", "2026-06-24 09:00", "地点", "教三-204", "座位", "12"),
                Map.of("学期", "2025-2026-2", "课程", "软件工程基础", "考试时间", "2026-06-27 14:30", "地点", "教二-305", "座位", "08")
        )));
    }

    @GetMapping("/api/makeup-exams")
    @PreAuthorize("hasAuthority('student:makeup:view') or hasAuthority('dashboard:view')")
    public ApiResponse<PageResult<Map<String, Object>>> makeupExams(@Valid PageRequest request) {
        return ApiResponse.ok(page(request, List.of(
                Map.of("学期", "2025-2026-2", "课程", "高等数学A", "报名状态", "未开放", "开放时间", "2026-07-10", "说明", "补考报名以最终成绩发布后为准")
        )));
    }

    private PageResult<Map<String, Object>> page(PageRequest request, List<Map<String, Object>> source) {
        List<Map<String, Object>> filtered = source.stream()
                .filter(item -> matchSemester(item, request.academicYear(), request.term()))
                .filter(item -> matchKeyword(item, request.keyword()))
                .toList();
        long size = request.size() <= 0 ? 10 : request.size();
        long page = request.page() <= 0 ? 1 : request.page();
        int from = (int) Math.min(filtered.size(), (page - 1) * size);
        int to = (int) Math.min(filtered.size(), from + size);
        return new PageResult<>(filtered.size(), page, size, filtered.subList(from, to));
    }

    private boolean matchSemester(Map<String, Object> item, String academicYear, Integer term) {
        if (academicYear == null || academicYear.isBlank() || term == null) {
            return true;
        }
        String semester = String.valueOf(item.getOrDefault("学期", ""));
        return semester.equals(academicYear + "-" + term);
    }

    private boolean matchKeyword(Map<String, Object> item, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String normalized = keyword.trim().toLowerCase();
        return item.values().stream()
                .filter(value -> value != null)
                .map(Object::toString)
                .map(String::toLowerCase)
                .anyMatch(value -> value.contains(normalized));
    }
}
