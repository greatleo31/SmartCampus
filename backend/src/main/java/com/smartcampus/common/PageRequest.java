package com.smartcampus.common;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record PageRequest(
        @Min(1) long page,
        @Min(1) @Max(200) long size,
        String keyword
) {
    public PageRequest {
        if (page == 0) {
            page = 1;
        }
        if (size == 0) {
            size = 10;
        }
    }
}
