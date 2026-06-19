package com.smartcampus.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smartcampus.common.PageRequest;
import com.smartcampus.common.PageResult;
import com.smartcampus.domain.Course;
import com.smartcampus.domain.Semester;
import com.smartcampus.dto.CourseRequest;
import com.smartcampus.dto.SemesterRequest;
import com.smartcampus.exception.BizException;
import com.smartcampus.mapper.CourseMapper;
import com.smartcampus.mapper.SemesterMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CatalogService {
    private final SemesterMapper semesterMapper;
    private final CourseMapper courseMapper;

    public PageResult<Semester> semesters(PageRequest request) {
        Page<Semester> page = semesterMapper.selectPage(new Page<>(request.page(), request.size()),
                new LambdaQueryWrapper<Semester>()
                        .like(StringUtils.hasText(request.keyword()), Semester::getName, request.keyword())
                        .orderByDesc(Semester::getCurrentFlag)
                        .orderByDesc(Semester::getStartDate));
        return new PageResult<>(page.getTotal(), page.getCurrent(), page.getSize(), page.getRecords());
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
        return semester;
    }

    public void deleteSemester(Long id) {
        requireSemester(id);
        semesterMapper.deleteById(id);
    }

    public Semester requireSemester(Long id) {
        Semester semester = semesterMapper.selectById(id);
        if (semester == null) {
            throw new BizException(404, "学期不存在");
        }
        return semester;
    }

    public PageResult<Course> courses(PageRequest request) {
        Page<Course> page = courseMapper.selectPage(new Page<>(request.page(), request.size()),
                new LambdaQueryWrapper<Course>()
                        .and(StringUtils.hasText(request.keyword()), w -> w
                                .like(Course::getName, request.keyword())
                                .or()
                                .like(Course::getCode, request.keyword()))
                        .orderByDesc(Course::getId));
        return new PageResult<>(page.getTotal(), page.getCurrent(), page.getSize(), page.getRecords());
    }

    public Course saveCourse(Long id, CourseRequest request) {
        Course course = id == null ? new Course() : requireCourse(id);
        course.setCode(request.code());
        course.setName(request.name());
        course.setCredit(request.credit());
        course.setHours(request.hours());
        if (id == null) {
            courseMapper.insert(course);
        } else {
            courseMapper.updateById(course);
        }
        return course;
    }

    public void deleteCourse(Long id) {
        requireCourse(id);
        courseMapper.deleteById(id);
    }

    public Course requireCourse(Long id) {
        Course course = courseMapper.selectById(id);
        if (course == null) {
            throw new BizException(404, "课程不存在");
        }
        return course;
    }
}
