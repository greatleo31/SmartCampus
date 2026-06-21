package com.smartcampus.vo;

import java.time.LocalDateTime;

public record AcademicWarningVO(
        Long id,
        String teachingClassName,
        String courseName,
        String studentNo,
        String studentName,
        String warningLevel,
        String warningLevelText,
        long absentCount,
        long lateOrEarlyCount,
        String reason,
        LocalDateTime generatedTime
) {
}
