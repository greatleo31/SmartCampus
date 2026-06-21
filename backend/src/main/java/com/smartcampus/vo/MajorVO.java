package com.smartcampus.vo;

public record MajorVO(
        Long id,
        Long collegeId,
        String collegeName,
        String code,
        String name
) {
}
