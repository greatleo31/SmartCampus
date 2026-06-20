package com.smartcampus.vo;

public record EnrollmentVO(
        Long id,
        String teachingClassName,
        String studentName,
        String studentNo,
        String major,
        String className
) {
}
