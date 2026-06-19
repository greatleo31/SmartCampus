package com.smartcampus.security;

import java.util.List;

public record CurrentUser(
        Long id,
        String username,
        String realName,
        String userType,
        List<String> roles,
        List<String> permissions
) {
    public boolean isAdmin() {
        return roles.contains("ADMIN");
    }

    public boolean isTeacher() {
        return roles.contains("TEACHER");
    }

    public boolean isStudent() {
        return roles.contains("STUDENT");
    }
}
