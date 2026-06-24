package com.smartcampus.vo;

public record TeachingClassVO(
        Long id,
        String classCode,
        Long semesterId,
        Long courseId,
        Long teacherId,
        String className,
        String semesterName,
        String courseName,
        String teacherName,
        Integer capacity
) {
}
