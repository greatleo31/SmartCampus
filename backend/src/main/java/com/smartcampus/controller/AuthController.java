package com.smartcampus.controller;

import com.smartcampus.common.ApiResponse;
import com.smartcampus.dto.LoginRequest;
import com.smartcampus.service.AuthService;
import com.smartcampus.vo.AuthTokenVO;
import com.smartcampus.vo.MenuVO;
import com.smartcampus.vo.UserVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthTokenVO> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.ok(null);
    }

    @GetMapping("/me")
    public ApiResponse<UserVO> me() {
        return ApiResponse.ok(authService.me());
    }

    @GetMapping("/menus")
    public ApiResponse<List<MenuVO>> menus() {
        return ApiResponse.ok(authService.menus());
    }
}
