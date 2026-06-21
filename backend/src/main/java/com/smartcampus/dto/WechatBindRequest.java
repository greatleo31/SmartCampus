package com.smartcampus.dto;

import jakarta.validation.constraints.NotNull;

public record WechatBindRequest(
        @NotNull Boolean bound
) {
}
