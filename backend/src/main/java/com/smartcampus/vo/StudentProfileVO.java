package com.smartcampus.vo;

public record StudentProfileVO(
        Long id,
        String studentNo,
        String realName,
        String collegeName,
        String major,
        String className,
        Integer gradeYear
) {
}
