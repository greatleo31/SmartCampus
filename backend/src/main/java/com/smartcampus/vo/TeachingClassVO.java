package com.smartcampus.vo;

public record TeachingClassVO(
        Long id,
        String className,
        String semesterName,
        String courseName,
        String teacherName,
        Integer capacity
) {
}
