package com.smartcampus.controller;

import com.smartcampus.common.ApiResponse;
import com.smartcampus.domain.Announcement;
import com.smartcampus.dto.AnnouncementRequest;
import com.smartcampus.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AnnouncementController {
    private final AnnouncementService announcementService;

    @GetMapping("/api/announcements")
    @PreAuthorize("hasAuthority('dashboard:view')")
    public ApiResponse<List<Announcement>> published(@RequestParam(required = false) String category) {
        return ApiResponse.ok(announcementService.published(category));
    }

    @GetMapping("/api/admin/announcements")
    @PreAuthorize("hasAuthority('announcement:manage')")
    public ApiResponse<List<Announcement>> all() {
        return ApiResponse.ok(announcementService.all());
    }

    @PostMapping("/api/admin/announcements")
    @PreAuthorize("hasAuthority('announcement:manage')")
    public ApiResponse<Announcement> create(@Valid @RequestBody AnnouncementRequest request) {
        return ApiResponse.ok(announcementService.save(null, request));
    }

    @PutMapping("/api/admin/announcements/{id}")
    @PreAuthorize("hasAuthority('announcement:manage')")
    public ApiResponse<Announcement> update(@PathVariable Long id, @Valid @RequestBody AnnouncementRequest request) {
        return ApiResponse.ok(announcementService.save(id, request));
    }

    @DeleteMapping("/api/admin/announcements/{id}")
    @PreAuthorize("hasAuthority('announcement:manage')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return ApiResponse.ok(null);
    }
}
