package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public record PasswordResetRequest(@NotBlank String password) {
}
