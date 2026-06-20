package com.smartcampus.controller;

import com.smartcampus.common.ApiResponse;
import com.smartcampus.service.WeatherService;
import com.smartcampus.vo.WeatherVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class WeatherController {
    private final WeatherService weatherService;

    @GetMapping("/api/weather/guangzhou")
    @PreAuthorize("hasAuthority('dashboard:view')")
    public ApiResponse<WeatherVO> guangzhou() {
        return ApiResponse.ok(weatherService.guangzhou());
    }
}
