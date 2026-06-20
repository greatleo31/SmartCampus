package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AnnouncementRequest(
        @NotBlank String title,
        @NotBlank String category,
        @NotBlank String summary,
        @NotBlank String content,
        @NotBlank String status,
        @NotNull Boolean pinned
) {
}
