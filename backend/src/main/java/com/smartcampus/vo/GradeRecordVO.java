package com.smartcampus.vo;

import java.math.BigDecimal;

public record GradeRecordVO(
        Long id,
        String teachingClassName,
        String courseName,
        String studentName,
        BigDecimal regularScore,
        BigDecimal finalScore,
        BigDecimal totalScore
) {
}
