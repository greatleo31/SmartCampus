package com.smartcampus.vo;

public record CollegeVO(
        Long id,
        String code,
        String name,
        String shortName,
        String teacherCode,
        Integer foundedYear
) {
}
