package com.smartcampus.controller;

import com.smartcampus.common.ApiResponse;
import com.smartcampus.dto.EmailBindRequest;
import com.smartcampus.dto.PasswordChangeRequest;
import com.smartcampus.dto.WechatBindRequest;
import com.smartcampus.service.ProfileService;
import com.smartcampus.vo.ProfileSecurityVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping("/security")
    public ApiResponse<ProfileSecurityVO> security() {
        return ApiResponse.ok(profileService.security());
    }

    @PutMapping("/password")
    public ApiResponse<Void> password(@Valid @RequestBody PasswordChangeRequest request) {
        profileService.changePassword(request);
        return ApiResponse.ok(null);
    }

    @PutMapping("/email")
    public ApiResponse<ProfileSecurityVO> email(@Valid @RequestBody EmailBindRequest request) {
        return ApiResponse.ok(profileService.bindEmail(request));
    }

    @PutMapping("/wechat")
    public ApiResponse<ProfileSecurityVO> wechat(@Valid @RequestBody WechatBindRequest request) {
        return ApiResponse.ok(profileService.bindWechat(request));
    }
}
