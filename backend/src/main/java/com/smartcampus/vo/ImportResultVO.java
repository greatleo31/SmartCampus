package com.smartcampus.vo;

import java.util.List;

public record ImportResultVO(
        int successCount,
        List<String> errors
) {
}
