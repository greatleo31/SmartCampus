package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AnnouncementRequest(
        @NotBlank String title,
        @NotBlank String category,
        String summary,
        String content,
        @NotBlank String status,
        @NotNull Boolean pinned,
        @NotBlank String sourceUrl,
        LocalDateTime publishTime
) {
}
