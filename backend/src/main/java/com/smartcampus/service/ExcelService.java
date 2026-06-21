package com.smartcampus.service;

import com.smartcampus.common.PageRequest;
import com.smartcampus.domain.AttendanceRecord;
import com.smartcampus.domain.GradeRecord;
import com.smartcampus.domain.StudentProfile;
import com.smartcampus.domain.SysUser;
import com.smartcampus.domain.TeachingClass;
import com.smartcampus.dto.AttendanceRequest;
import com.smartcampus.dto.GradeRequest;
import com.smartcampus.exception.BizException;
import com.smartcampus.mapper.StudentProfileMapper;
import com.smartcampus.mapper.SysUserMapper;
import com.smartcampus.mapper.TeachingClassMapper;
import com.smartcampus.vo.ImportResultVO;
import com.smartcampus.vo.AttendanceRecordVO;
import com.smartcampus.vo.GradeRecordVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelService {
    private static final List<String> GRADE_IMPORT_HEADERS = List.of("教学班", "学生", "平时分", "期末分");
    private static final List<String> ATTENDANCE_IMPORT_HEADERS = List.of("教学班", "学生", "考勤日期", "状态", "备注");

    private final TeachingService teachingService;
    private final TeachingClassMapper teachingClassMapper;
    private final StudentProfileMapper studentProfileMapper;
    private final SysUserMapper userMapper;

    public byte[] gradeTemplate() {
        return workbook("成绩导入模板", GRADE_IMPORT_HEADERS, List.of());
    }

    public byte[] attendanceTemplate() {
        return workbook("考勤导入模板", ATTENDANCE_IMPORT_HEADERS, List.of());
    }

    public byte[] exportGrades() {
        List<List<Object>> rows = teachingService.gradeViews(allRequest(), null, null).records().stream()
                .map(item -> List.<Object>of(
                        item.teachingClassName(),
                        item.courseName(),
                        item.semesterName(),
                        item.studentNo(),
                        item.studentName(),
                        item.regularScore(),
                        item.finalScore(),
                        item.totalScore()))
                .toList();
        return workbook("成绩数据", List.of("教学班", "课程", "学期", "学号", "姓名", "平时分", "期末分", "总评"), rows);
    }

    public byte[] exportAttendance() {
        List<List<Object>> rows = teachingService.attendanceViews(allRequest(), null, null).records().stream()
                .map(item -> List.<Object>of(
                        item.teachingClassName(),
                        item.courseName(),
                        item.adminClassName(),
                        item.studentNo(),
                        item.studentName(),
                        item.attendanceDate(),
                        item.weekLabel(),
                        item.teacherName(),
                        item.sectionLabel(),
                        item.classroom(),
                        item.statusText(),
                        item.remark() == null ? "" : item.remark()
                ))
                .toList();
        return workbook("考勤数据", List.of("教学班", "课程", "班级", "学号", "姓名", "考勤日期", "周次", "任课老师", "节次", "教室", "状态", "备注"), rows);
    }

    public ImportResultVO importGrades(MultipartFile file) {
        Workbook workbook = read(file);
        Sheet sheet = firstSheet(workbook);
        validateHeaders(sheet, GRADE_IMPORT_HEADERS);
        List<String> errors = new ArrayList<>();
        int success = 0;
        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null || empty(row)) {
                continue;
            }
            try {
                teachingService.saveGrade(null, new GradeRequest(
                        teachingClassId(stringValue(row, 0)),
                        studentId(stringValue(row, 1)),
                        decimalValue(row, 2),
                        decimalValue(row, 3)
                ));
                success++;
            } catch (Exception ex) {
                errors.add("第" + (rowIndex + 1) + "行：" + ex.getMessage());
            }
        }
        return new ImportResultVO(success, errors);
    }

    public ImportResultVO importAttendance(MultipartFile file) {
        Workbook workbook = read(file);
        Sheet sheet = firstSheet(workbook);
        validateHeaders(sheet, ATTENDANCE_IMPORT_HEADERS);
        List<String> errors = new ArrayList<>();
        int success = 0;
        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null || empty(row)) {
                continue;
            }
            try {
                teachingService.saveAttendance(null, new AttendanceRequest(
                        teachingClassId(stringValue(row, 0)),
                        studentId(stringValue(row, 1)),
                        dateValue(row, 2),
                        attendanceStatusCode(stringValue(row, 3)),
                        stringValue(row, 4)
                ));
                success++;
            } catch (Exception ex) {
                errors.add("第" + (rowIndex + 1) + "行：" + ex.getMessage());
            }
        }
        return new ImportResultVO(success, errors);
    }

    private byte[] workbook(String sheetName, List<String> headers, List<List<Object>> rows) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(sheetName);
            Row header = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                header.createCell(i).setCellValue(headers.get(i));
            }
            for (int i = 0; i < rows.size(); i++) {
                Row row = sheet.createRow(i + 1);
                List<Object> values = rows.get(i);
                for (int j = 0; j < values.size(); j++) {
                    Cell cell = row.createCell(j);
                    Object value = values.get(j);
                    if (value instanceof Number number) {
                        cell.setCellValue(number.doubleValue());
                    } else if (value instanceof LocalDate date) {
                        cell.setCellValue(date.toString());
                    } else {
                        cell.setCellValue(value == null ? "" : value.toString());
                    }
                }
            }
            for (int i = 0; i < headers.size(); i++) {
                sheet.autoSizeColumn(i);
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException ex) {
            throw new BizException(500, "生成 XLSX 失败");
        }
    }

    private Workbook read(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BizException(400, "请上传 XLSX 文件");
        }
        if (file.getOriginalFilename() == null || !file.getOriginalFilename().toLowerCase().endsWith(".xlsx")) {
            throw new BizException(400, "仅支持 .xlsx 文件");
        }
        try {
            return new XSSFWorkbook(file.getInputStream());
        } catch (IOException ex) {
            throw new BizException(400, "读取 XLSX 失败");
        }
    }

    private Sheet firstSheet(Workbook workbook) {
        if (workbook.getNumberOfSheets() == 0) {
            throw templateMismatch("模板表头缺失");
        }
        return workbook.getSheetAt(0);
    }

    private void validateHeaders(Sheet sheet, List<String> expectedHeaders) {
        Row header = sheet.getRow(0);
        if (header == null) {
            throw templateMismatch("模板表头缺失");
        }
        int actualColumns = effectiveColumnCount(header);
        if (actualColumns != expectedHeaders.size()) {
            throw templateMismatch("应为" + expectedHeaders.size() + "列，实际" + actualColumns + "列");
        }
        for (int i = 0; i < expectedHeaders.size(); i++) {
            String expected = expectedHeaders.get(i);
            String actual = stringValue(header, i);
            if (!expected.equals(actual)) {
                throw templateMismatch("第" + (i + 1) + "列应为" + expected + "，实际为" + (actual.isBlank() ? "空" : actual));
            }
        }
    }

    private int effectiveColumnCount(Row row) {
        int lastCellNum = Math.max(row.getLastCellNum(), 0);
        for (int i = lastCellNum - 1; i >= 0; i--) {
            if (!stringValue(row, i).isBlank()) {
                return i + 1;
            }
        }
        return 0;
    }

    private BizException templateMismatch(String detail) {
        return new BizException(400, "导入模板不匹配：" + detail + "，请下载最新模板后再导入");
    }

    private boolean empty(Row row) {
        for (int i = 0; i < row.getLastCellNum(); i++) {
            if (!stringValue(row, i).isBlank()) {
                return false;
            }
        }
        return true;
    }

    private Long longValue(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) {
            throw new BizException(400, "缺少第" + (index + 1) + "列");
        }
        return switch (cell.getCellType()) {
            case NUMERIC -> (long) cell.getNumericCellValue();
            case STRING -> Long.parseLong(cell.getStringCellValue().trim());
            default -> throw new BizException(400, "第" + (index + 1) + "列格式错误");
        };
    }

    private Long teachingClassId(String className) {
        List<TeachingClass> matches = teachingClassMapper.selectList(new LambdaQueryWrapper<TeachingClass>()
                .and(wrapper -> wrapper
                        .eq(TeachingClass::getClassName, className)
                        .or()
                        .eq(TeachingClass::getClassCode, className)
                        .or()
                        .like(TeachingClass::getClassName, className)
                        .or()
                        .like(TeachingClass::getClassCode, className)));
        if (matches.isEmpty()) {
            throw new BizException(400, "教学班不存在：" + className);
        }
        if (matches.size() > 1) {
            throw new BizException(400, "教学班名称不唯一：" + className);
        }
        return matches.get(0).getId();
    }

    private Long studentId(String value) {
        StudentProfile matchedProfile = studentProfileMapper.selectOne(new LambdaQueryWrapper<StudentProfile>()
                .eq(StudentProfile::getStudentNo, value)
                .last("limit 1"));
        if (matchedProfile != null) {
            return matchedProfile.getId();
        }
        List<SysUser> users = userMapper.selectList(new LambdaQueryWrapper<SysUser>()
                .and(wrapper -> wrapper
                        .eq(SysUser::getRealName, value)
                        .or()
                        .like(SysUser::getRealName, value))
                .eq(SysUser::getUserType, "STUDENT"));
        if (users.isEmpty()) {
            throw new BizException(400, "学生不存在：" + value);
        }
        if (users.size() > 1) {
            throw new BizException(400, "学生匹配结果不唯一：" + value);
        }
        StudentProfile profile = studentProfileMapper.selectOne(new LambdaQueryWrapper<StudentProfile>()
                .eq(StudentProfile::getUserId, users.get(0).getId()));
        if (profile == null) {
            throw new BizException(400, "学生档案不存在：" + value);
        }
        return profile.getId();
    }

    private String teachingClassName(Long id) {
        TeachingClass teachingClass = teachingClassMapper.selectById(id);
        return teachingClass == null ? "-" : teachingClass.getClassName();
    }

    private String studentName(Long id) {
        StudentProfile profile = studentProfileMapper.selectById(id);
        SysUser user = profile == null ? null : userMapper.selectById(profile.getUserId());
        return user == null ? "-" : user.getRealName();
    }

    private BigDecimal decimalValue(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) {
            throw new BizException(400, "缺少第" + (index + 1) + "列");
        }
        return switch (cell.getCellType()) {
            case NUMERIC -> BigDecimal.valueOf(cell.getNumericCellValue());
            case STRING -> new BigDecimal(cell.getStringCellValue().trim());
            default -> throw new BizException(400, "第" + (index + 1) + "列格式错误");
        };
    }

    private LocalDate dateValue(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) {
            throw new BizException(400, "缺少日期列");
        }
        return switch (cell.getCellType()) {
            case NUMERIC -> cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            case STRING -> LocalDate.parse(cell.getStringCellValue().trim());
            default -> throw new BizException(400, "日期格式错误");
        };
    }

    private String stringValue(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) {
            return "";
        }
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> BigDecimal.valueOf(cell.getNumericCellValue()).stripTrailingZeros().toPlainString();
            case BOOLEAN -> Boolean.toString(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private String attendanceStatusCode(String value) {
        return switch (value) {
            case "正常", "NORMAL" -> "NORMAL";
            case "迟到", "LATE" -> "LATE";
            case "早退", "EARLY_LEAVE" -> "EARLY_LEAVE";
            case "请假", "LEAVE" -> "LEAVE";
            case "旷课", "ABSENT" -> "ABSENT";
            default -> value;
        };
    }

    private String attendanceStatusText(String status) {
        return switch (status) {
            case "NORMAL" -> "正常";
            case "LATE" -> "迟到";
            case "EARLY_LEAVE" -> "早退";
            case "LEAVE" -> "请假";
            case "ABSENT" -> "旷课";
            default -> status;
        };
    }

    private PageRequest allRequest() {
        return new PageRequest(1, Integer.MAX_VALUE, null, null, null);
    }
}
