package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public record SystemConfigRequest(
        @NotBlank String configName,
        @NotBlank String configValue,
        String description
) {
}
