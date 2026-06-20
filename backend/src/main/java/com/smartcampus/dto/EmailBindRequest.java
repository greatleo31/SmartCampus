package com.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailBindRequest(
        @NotBlank @Email String email
) {
}
