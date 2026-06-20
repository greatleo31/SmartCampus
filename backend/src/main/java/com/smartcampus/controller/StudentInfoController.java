package com.smartcampus.controller;

import com.smartcampus.common.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class StudentInfoController {
    @GetMapping("/api/calendar")
    @PreAuthorize("hasAuthority('student:calendar:view') or hasAuthority('dashboard:view')")
    public ApiResponse<List<Map<String, Object>>> calendar() {
        return ApiResponse.ok(List.of(
                Map.of("事项", "第1周开学", "日期", "2026-02-23", "说明", "春季学期正式上课"),
                Map.of("事项", "期中教学检查", "日期", "2026-04-20", "说明", "课程质量与学习状态检查"),
                Map.of("事项", "期末考试周", "日期", "2026-06-22", "说明", "以教务安排为准")
        ));
    }

    @GetMapping("/api/gpa-ranking")
    @PreAuthorize("hasAuthority('student:gpa:view') or hasAuthority('dashboard:view')")
    public ApiResponse<List<Map<String, Object>>> gpaRanking() {
        return ApiResponse.ok(List.of(
                Map.of("学期", "2025-2026-2", "绩点", "3.62", "专业排名", "12/86", "班级排名", "3/30"),
                Map.of("学期", "2025-2026-1", "绩点", "3.48", "专业排名", "18/86", "班级排名", "5/30")
        ));
    }

    @GetMapping("/api/exams")
    @PreAuthorize("hasAuthority('student:exam:view') or hasAuthority('dashboard:view')")
    public ApiResponse<List<Map<String, Object>>> exams() {
        return ApiResponse.ok(List.of(
                Map.of("课程", "数据库系统", "考试时间", "2026-06-24 09:00", "地点", "教三-204", "座位", "12"),
                Map.of("课程", "软件工程基础", "考试时间", "2026-06-27 14:30", "地点", "教二-305", "座位", "08")
        ));
    }

    @GetMapping("/api/makeup-exams")
    @PreAuthorize("hasAuthority('student:makeup:view') or hasAuthority('dashboard:view')")
    public ApiResponse<List<Map<String, Object>>> makeupExams() {
        return ApiResponse.ok(List.of(
                Map.of("课程", "高等数学A", "报名状态", "未开放", "开放时间", "2026-07-10", "说明", "补考报名以最终成绩发布后为准")
        ));
    }
}
