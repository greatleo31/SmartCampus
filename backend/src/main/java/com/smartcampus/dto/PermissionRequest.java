package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public record PermissionRequest(
        @NotBlank String code,
        @NotBlank String name,
        String menuPath,
        @NotBlank String roleCode
) {
}
