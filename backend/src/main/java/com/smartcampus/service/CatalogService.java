package com.smartcampus.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smartcampus.common.PageRequest;
import com.smartcampus.common.PageResult;
import com.smartcampus.domain.*;
import com.smartcampus.dto.CourseRequest;
import com.smartcampus.dto.SemesterRequest;
import com.smartcampus.exception.BizException;
import com.smartcampus.mapper.*;
import com.smartcampus.vo.AdminClassVO;
import com.smartcampus.vo.CollegeVO;
import com.smartcampus.vo.CourseVO;
import com.smartcampus.vo.MajorVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogService {
    private final SemesterMapper semesterMapper;
    private final CourseMapper courseMapper;
    private final CollegeMapper collegeMapper;
    private final MajorMapper majorMapper;
    private final AdminClassMapper adminClassMapper;
    private final LocalCacheService localCacheService;

    public PageResult<Semester> semesters(PageRequest request) {
        return localCacheService.normalTtl(localCacheService.key("catalog:semesters", request), () -> {
            Page<Semester> page = semesterMapper.selectPage(new Page<>(request.page(), request.size()),
                    new LambdaQueryWrapper<Semester>()
                            .like(StringUtils.hasText(request.keyword()), Semester::getName, request.keyword())
                            .orderByDesc(Semester::getCurrentFlag)
                            .orderByDesc(Semester::getStartDate));
            return new PageResult<>(page.getTotal(), page.getCurrent(), page.getSize(), page.getRecords());
        });
    }

    @Transactional
    public Semester saveSemester(Long id, SemesterRequest request) {
        if (!request.endDate().isAfter(request.startDate())) {
            throw new BizException(400, "学期结束日期必须晚于开始日期");
        }
        Semester semester = id == null ? new Semester() : requireSemester(id);
        semester.setName(request.name());
        semester.setStartDate(request.startDate());
        semester.setEndDate(request.endDate());
        semester.setCurrentFlag(Boolean.TRUE.equals(request.currentFlag()) ? 1 : 0);
        if (semester.getCurrentFlag() == 1) {
            semesterMapper.selectList(new LambdaQueryWrapper<Semester>().eq(Semester::getCurrentFlag, 1))
                    .forEach(s -> {
                        if (!s.getId().equals(id)) {
                            s.setCurrentFlag(0);
                            semesterMapper.updateById(s);
                        }
                    });
        }
        if (id == null) {
            semesterMapper.insert(semester);
        } else {
            semesterMapper.updateById(semester);
        }
        invalidateCatalogCaches();
        return semester;
    }

    public void deleteSemester(Long id) {
        requireSemester(id);
        semesterMapper.deleteById(id);
        invalidateCatalogCaches();
    }

    public Semester requireSemester(Long id) {
        Semester semester = semesterMapper.selectById(id);
        if (semester == null) {
            throw new BizException(404, "学期不存在");
        }
        return semester;
    }

    public PageResult<CourseVO> courses(PageRequest request) {
        return localCacheService.normalTtl(localCacheService.key("catalog:courses", request), () -> {
            Page<Course> page = courseMapper.selectPage(new Page<>(request.page(), request.size()),
                    new LambdaQueryWrapper<Course>()
                            .and(StringUtils.hasText(request.keyword()), w -> w
                                    .like(Course::getName, request.keyword())
                                    .or()
                                    .like(Course::getAliasName, request.keyword())
                                    .or()
                                    .like(Course::getCode, request.keyword()))
                            .orderByDesc(Course::getId));
            return new PageResult<>(page.getTotal(), page.getCurrent(), page.getSize(),
                    page.getRecords().stream().map(this::toCourseVO).toList());
        });
    }

    public List<CollegeVO> colleges() {
        return localCacheService.longTtl(localCacheService.key("catalog:colleges"), () ->
                collegeMapper.selectList(new LambdaQueryWrapper<College>()
                                .orderByAsc(College::getDisplayOrder)
                                .orderByAsc(College::getId))
                        .stream()
                        .map(college -> new CollegeVO(
                                college.getId(),
                                college.getCode(),
                                college.getName(),
                                college.getShortName(),
                                college.getTeacherCode(),
                                college.getFoundedYear()))
                        .toList());
    }

    public List<MajorVO> majors(Long collegeId) {
        return localCacheService.longTtl(localCacheService.key("catalog:majors", collegeId), () ->
                majorMapper.selectList(new LambdaQueryWrapper<Major>()
                                .eq(collegeId != null, Major::getCollegeId, collegeId)
                                .orderByAsc(Major::getCode))
                        .stream()
                        .map(major -> {
                            College college = collegeMapper.selectById(major.getCollegeId());
                            return new MajorVO(
                                    major.getId(),
                                    major.getCollegeId(),
                                    college == null ? "-" : college.getName(),
                                    major.getCode(),
                                    major.getName());
                        })
                        .toList());
    }

    public List<AdminClassVO> adminClasses(Long majorId) {
        return localCacheService.longTtl(localCacheService.key("catalog:admin-classes", majorId), () ->
                adminClassMapper.selectList(new LambdaQueryWrapper<AdminClass>()
                                .eq(majorId != null, AdminClass::getMajorId, majorId)
                                .orderByAsc(AdminClass::getGradeYear)
                                .orderByAsc(AdminClass::getClassName))
                        .stream()
                        .map(adminClass -> {
                            Major major = majorMapper.selectById(adminClass.getMajorId());
                            College college = major == null ? null : collegeMapper.selectById(major.getCollegeId());
                            return new AdminClassVO(
                                    adminClass.getId(),
                                    adminClass.getMajorId(),
                                    college == null ? "-" : college.getName(),
                                    major == null ? "-" : major.getName(),
                                    adminClass.getClassName(),
                                    adminClass.getGradeYear(),
                                    adminClass.getClassNo());
                        })
                        .toList());
    }

    public Course saveCourse(Long id, CourseRequest request) {
        Course course = id == null ? new Course() : requireCourse(id);
        course.setCode(request.code());
        course.setName(request.name());
        course.setAliasName(request.aliasName());
        course.setCollegeId(request.collegeId());
        course.setCredit(request.credit());
        course.setHours(request.hours());
        if (id == null) {
            courseMapper.insert(course);
        } else {
            courseMapper.updateById(course);
        }
        invalidateCatalogCaches();
        return course;
    }

    public void deleteCourse(Long id) {
        requireCourse(id);
        courseMapper.deleteById(id);
        invalidateCatalogCaches();
    }

    public Course requireCourse(Long id) {
        Course course = courseMapper.selectById(id);
        if (course == null) {
            throw new BizException(404, "课程不存在");
        }
        return course;
    }

    private CourseVO toCourseVO(Course course) {
        College college = course.getCollegeId() == null ? null : collegeMapper.selectById(course.getCollegeId());
        return new CourseVO(
                course.getId(),
                course.getCode(),
                course.getName(),
                course.getAliasName(),
                course.getCollegeId(),
                college == null ? "-" : college.getName(),
                course.getCredit(),
                course.getHours());
    }

    private void invalidateCatalogCaches() {
        localCacheService.invalidatePrefix("catalog");
        localCacheService.invalidatePrefix("dashboard:overview");
    }
}
