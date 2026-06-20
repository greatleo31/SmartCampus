package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public record RoleRequest(
        @NotBlank String code,
        @NotBlank String name,
        @NotBlank String dataScope
) {
}
