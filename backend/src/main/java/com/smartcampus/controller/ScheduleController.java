package com.smartcampus.controller;

import com.smartcampus.common.ApiResponse;
import com.smartcampus.domain.ClassSchedule;
import com.smartcampus.dto.ClassScheduleRequest;
import com.smartcampus.service.ScheduleService;
import com.smartcampus.vo.ScheduleItemVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ScheduleController {
    private final ScheduleService scheduleService;

    @GetMapping("/api/schedules/my")
    @PreAuthorize("hasAuthority('dashboard:view') or hasAuthority('schedule:view') or hasAuthority('student:course:view') or hasAuthority('student:schedule:view') or hasAuthority('student:class-schedule:view')")
    public ApiResponse<List<ScheduleItemVO>> mySchedules() {
        return ApiResponse.ok(scheduleService.mySchedules());
    }

    @GetMapping("/api/admin/schedules")
    @PreAuthorize("hasAuthority('schedule:manage')")
    public ApiResponse<List<ScheduleItemVO>> allSchedules() {
        return ApiResponse.ok(scheduleService.all());
    }

    @PostMapping("/api/admin/schedules")
    @PreAuthorize("hasAuthority('schedule:manage')")
    public ApiResponse<ClassSchedule> create(@Valid @RequestBody ClassScheduleRequest request) {
        return ApiResponse.ok(scheduleService.save(null, request));
    }

    @PutMapping("/api/admin/schedules/{id}")
    @PreAuthorize("hasAuthority('schedule:manage')")
    public ApiResponse<ClassSchedule> update(@PathVariable Long id, @Valid @RequestBody ClassScheduleRequest request) {
        return ApiResponse.ok(scheduleService.save(id, request));
    }

    @DeleteMapping("/api/admin/schedules/{id}")
    @PreAuthorize("hasAuthority('schedule:manage')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        scheduleService.delete(id);
        return ApiResponse.ok(null);
    }
}
