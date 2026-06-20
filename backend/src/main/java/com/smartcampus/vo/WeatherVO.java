package com.smartcampus.vo;

import java.time.LocalDateTime;

public record WeatherVO(
        String city,
        String weather,
        Double temperature,
        Double precipitation,
        Double windSpeed,
        LocalDateTime observedAt,
        boolean stale
) {
}
