package com.smartcampus.service;

import com.smartcampus.exception.BizException;
import com.smartcampus.vo.ImportResultVO;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ExcelServiceTest {
    private final ExcelService service = new ExcelService(null, null, null, null);

    @Test
    void importGradesShouldRejectHeaderMismatch() throws IOException {
        MockMultipartFile file = xlsx("grades.xlsx", List.of("教学班", "学生", "平时分", "期末成绩"));

        assertThatThrownBy(() -> service.importGrades(file))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("导入模板不匹配")
                .hasMessageContaining("第4列应为期末分");
    }

    @Test
    void importAttendanceShouldRejectExtraHeaderColumn() throws IOException {
        MockMultipartFile file = xlsx("attendance.xlsx", List.of("教学班", "学生", "考勤日期", "状态", "备注", "多余列"));

        assertThatThrownBy(() -> service.importAttendance(file))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("导入模板不匹配")
                .hasMessageContaining("应为5列，实际6列");
    }

    @Test
    void importGradesShouldAcceptMatchingHeaderWithNoDataRows() throws IOException {
        MockMultipartFile file = xlsx("grades.xlsx", List.of("教学班", "学生", "平时分", "期末分"));

        ImportResultVO result = service.importGrades(file);

        assertThat(result.successCount()).isZero();
        assertThat(result.errors()).isEmpty();
    }

    private MockMultipartFile xlsx(String filename, List<String> headers) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("导入模板");
            Row header = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                header.createCell(i).setCellValue(headers.get(i));
            }
            workbook.write(out);
            return new MockMultipartFile(
                    "file",
                    filename,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    out.toByteArray()
            );
        }
    }
}
