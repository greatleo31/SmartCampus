package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UserAdminRequest(
        @NotBlank String username,
        @NotBlank String realName,
        @NotBlank String userType,
        @NotNull Integer status,
        @NotEmpty List<Long> roleIds,
        String password
) {
}
