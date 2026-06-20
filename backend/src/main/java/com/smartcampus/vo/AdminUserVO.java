package com.smartcampus.vo;

import java.util.List;

public record AdminUserVO(
        Long id,
        String username,
        String realName,
        String userType,
        Integer status,
        List<String> roles
) {
}
