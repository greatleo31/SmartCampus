package com.smartcampus.vo;

import java.time.LocalDateTime;

public record ProfileSecurityVO(
        Long userId,
        String username,
        String realName,
        String userType,
        String email,
        Boolean wechatBound,
        String campusIdentity,
        LocalDateTime lastLoginTime
) {
}
