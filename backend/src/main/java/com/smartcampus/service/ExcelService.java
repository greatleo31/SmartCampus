package com.smartcampus.service;

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
    private final TeachingService teachingService;
    private final TeachingClassMapper teachingClassMapper;
    private final StudentProfileMapper studentProfileMapper;
    private final SysUserMapper userMapper;

    public byte[] gradeTemplate() {
        return workbook("成绩导入模板", List.of("教学班", "学生", "平时分", "期末分"), List.of());
    }

    public byte[] attendanceTemplate() {
        return workbook("考勤导入模板", List.of("教学班", "学生", "考勤日期", "状态", "备注"), List.of());
    }

    public byte[] exportGrades() {
        List<List<Object>> rows = teachingService.grades(null, null).stream()
                .map(item -> List.<Object>of(teachingClassName(item.getTeachingClassId()), studentName(item.getStudentId()), item.getRegularScore(), item.getFinalScore(), item.getTotalScore()))
                .toList();
        return workbook("成绩数据", List.of("教学班", "学生", "平时分", "期末分", "总评"), rows);
    }

    public byte[] exportAttendance() {
        List<List<Object>> rows = teachingService.attendance(null, null).stream()
                .map(item -> List.<Object>of(
                        teachingClassName(item.getTeachingClassId()),
                        studentName(item.getStudentId()),
                        item.getAttendanceDate(),
                        attendanceStatusText(item.getStatus()),
                        item.getRemark() == null ? "" : item.getRemark()
                ))
                .toList();
        return workbook("考勤数据", List.of("教学班", "学生", "考勤日期", "状态", "备注"), rows);
    }

    public ImportResultVO importGrades(MultipartFile file) {
        Workbook workbook = read(file);
        Sheet sheet = workbook.getSheetAt(0);
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
        Sheet sheet = workbook.getSheetAt(0);
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
                .eq(TeachingClass::getClassName, className));
        if (matches.isEmpty()) {
            throw new BizException(400, "教学班不存在：" + className);
        }
        if (matches.size() > 1) {
            throw new BizException(400, "教学班名称不唯一：" + className);
        }
        return matches.get(0).getId();
    }

    private Long studentId(String realName) {
        List<SysUser> users = userMapper.selectList(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getRealName, realName)
                .eq(SysUser::getUserType, "STUDENT"));
        if (users.isEmpty()) {
            throw new BizException(400, "学生不存在：" + realName);
        }
        if (users.size() > 1) {
            throw new BizException(400, "学生姓名不唯一：" + realName);
        }
        StudentProfile profile = studentProfileMapper.selectOne(new LambdaQueryWrapper<StudentProfile>()
                .eq(StudentProfile::getUserId, users.get(0).getId()));
        if (profile == null) {
            throw new BizException(400, "学生档案不存在：" + realName);
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
}
