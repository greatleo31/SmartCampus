package com.smartcampus.vo;

public record TeacherProfileVO(
        Long id,
        String teacherNo,
        String realName,
        String collegeName,
        String department,
        String title
) {
}
