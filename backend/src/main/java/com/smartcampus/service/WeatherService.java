package com.smartcampus.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.vo.WeatherVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class WeatherService {
    private static final String GUANGZHOU_URL = "https://api.open-meteo.com/v1/forecast?latitude=23.1291&longitude=113.2644&current=temperature_2m,precipitation,rain,showers,weather_code,wind_speed_10m&timezone=Asia%2FShanghai";
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(4)).build();
    private WeatherVO cached;
    private LocalDateTime cachedAt;

    public synchronized WeatherVO guangzhou() {
        if (cached != null && cachedAt != null && cachedAt.plusMinutes(10).isAfter(LocalDateTime.now())) {
            return cached;
        }
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(GUANGZHOU_URL))
                    .timeout(Duration.ofSeconds(6))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode current = objectMapper.readTree(response.body()).path("current");
            WeatherVO next = new WeatherVO(
                    "广州",
                    weatherName(current.path("weather_code").asInt()),
                    current.path("temperature_2m").asDouble(),
                    current.path("precipitation").asDouble(),
                    current.path("wind_speed_10m").asDouble(),
                    LocalDateTime.parse(current.path("time").asText(), DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                    false
            );
            cached = next;
            cachedAt = LocalDateTime.now();
            return next;
        } catch (Exception ex) {
            if (cached != null) {
                return new WeatherVO(cached.city(), cached.weather(), cached.temperature(), cached.precipitation(), cached.windSpeed(), cached.observedAt(), true);
            }
            return new WeatherVO("广州", "天气暂不可用", null, null, null, LocalDateTime.now(), true);
        }
    }

    private String weatherName(int code) {
        if (code == 0) return "晴";
        if (code <= 3) return "多云";
        if (code <= 48) return "雾";
        if (code <= 67) return "雨";
        if (code <= 77) return "雪";
        if (code <= 82) return "阵雨";
        if (code <= 99) return "雷雨";
        return "未知";
    }
}
