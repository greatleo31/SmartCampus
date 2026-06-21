package com.smartcampus.vo;

public record AdminClassVO(
        Long id,
        Long majorId,
        String collegeName,
        String majorName,
        String className,
        Integer gradeYear,
        Integer classNo
) {
}
