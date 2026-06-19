package com.smartcampus.vo;

import java.util.List;

public record UserVO(
        Long id,
        String username,
        String realName,
        String userType,
        List<String> roles,
        List<String> permissions
) {
}
