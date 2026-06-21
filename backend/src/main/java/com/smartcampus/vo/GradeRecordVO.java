package com.smartcampus.vo;

import java.math.BigDecimal;

public record GradeRecordVO(
        Long id,
        String semesterName,
        String teachingClassName,
        String courseName,
        String studentNo,
        String studentName,
        BigDecimal regularScore,
        BigDecimal finalScore,
        BigDecimal totalScore
) {
}
