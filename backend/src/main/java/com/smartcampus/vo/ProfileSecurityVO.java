package com.smartcampus.vo;

import java.time.LocalDateTime;

public record ProfileSecurityVO(
        Long userId,
        String username,
        String realName,
        String userType,
        String email,
        Boolean wechatBound,
        String collegeName,
        String majorName,
        String className,
        String studentNo,
        String teacherNo,
        String title,
        String department,
        LocalDateTime lastLoginTime
) {
}
