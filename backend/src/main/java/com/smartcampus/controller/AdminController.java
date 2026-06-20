package com.smartcampus.controller;

import com.smartcampus.common.ApiResponse;
import com.smartcampus.domain.SysPermission;
import com.smartcampus.domain.SysRole;
import com.smartcampus.domain.SysUser;
import com.smartcampus.domain.SystemConfig;
import com.smartcampus.dto.*;
import com.smartcampus.service.AdminService;
import com.smartcampus.vo.AdminUserVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('admin:access')")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('user:manage')")
    public ApiResponse<List<AdminUserVO>> users() {
        return ApiResponse.ok(adminService.users());
    }

    @PostMapping("/users")
    @PreAuthorize("hasAuthority('user:manage')")
    public ApiResponse<SysUser> createUser(@Valid @RequestBody UserAdminRequest request) {
        return ApiResponse.ok(adminService.saveUser(null, request));
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasAuthority('user:manage')")
    public ApiResponse<SysUser> updateUser(@PathVariable Long id, @Valid @RequestBody UserAdminRequest request) {
        return ApiResponse.ok(adminService.saveUser(id, request));
    }

    @PutMapping("/users/{id}/status/{status}")
    @PreAuthorize("hasAuthority('user:manage')")
    public ApiResponse<Void> status(@PathVariable Long id, @PathVariable Integer status) {
        adminService.setUserStatus(id, status);
        return ApiResponse.ok(null);
    }

    @PutMapping("/users/{id}/password")
    @PreAuthorize("hasAuthority('user:manage')")
    public ApiResponse<Void> resetPassword(@PathVariable Long id, @Valid @RequestBody PasswordResetRequest request) {
        adminService.resetPassword(id, request);
        return ApiResponse.ok(null);
    }

    @GetMapping("/roles")
    @PreAuthorize("hasAuthority('role:manage')")
    public ApiResponse<List<SysRole>> roles() {
        return ApiResponse.ok(adminService.roles());
    }

    @PostMapping("/roles")
    @PreAuthorize("hasAuthority('role:manage')")
    public ApiResponse<SysRole> createRole(@Valid @RequestBody RoleRequest request) {
        return ApiResponse.ok(adminService.saveRole(null, request));
    }

    @PutMapping("/roles/{id}")
    @PreAuthorize("hasAuthority('role:manage')")
    public ApiResponse<SysRole> updateRole(@PathVariable Long id, @Valid @RequestBody RoleRequest request) {
        return ApiResponse.ok(adminService.saveRole(id, request));
    }

    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('role:manage')")
    public ApiResponse<List<SysPermission>> permissions() {
        return ApiResponse.ok(adminService.permissions());
    }

    @PostMapping("/permissions")
    @PreAuthorize("hasAuthority('role:manage')")
    public ApiResponse<SysPermission> createPermission(@Valid @RequestBody PermissionRequest request) {
        return ApiResponse.ok(adminService.savePermission(null, request));
    }

    @PutMapping("/permissions/{id}")
    @PreAuthorize("hasAuthority('role:manage')")
    public ApiResponse<SysPermission> updatePermission(@PathVariable Long id, @Valid @RequestBody PermissionRequest request) {
        return ApiResponse.ok(adminService.savePermission(id, request));
    }

    @GetMapping("/configs")
    @PreAuthorize("hasAuthority('config:manage')")
    public ApiResponse<List<SystemConfig>> configs() {
        return ApiResponse.ok(adminService.configs());
    }

    @PutMapping("/configs/{id}")
    @PreAuthorize("hasAuthority('config:manage')")
    public ApiResponse<SystemConfig> updateConfig(@PathVariable Long id, @Valid @RequestBody SystemConfigRequest request) {
        return ApiResponse.ok(adminService.updateConfig(id, request));
    }
}
