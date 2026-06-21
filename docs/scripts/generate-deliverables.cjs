const fs = require('fs');
const path = require('path');
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} = require('docx');

const root = path.resolve(__dirname, '..', '..');
const outDir = path.join(root, 'docs', 'deliverables');
const htmlTemplatePath = 'C:\\Users\\胡衍科\\projectSet\\tlias\\TLIAS-defense-presentation.html';
const htmlTemplateAssetsDir = path.join(path.dirname(htmlTemplatePath), 'html-ppt-assets');

fs.mkdirSync(outDir, { recursive: true });

function copyDirectory(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) return;
  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const source = path.join(sourceDir, entry.name);
    const target = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(source, target);
    } else if (entry.isFile()) {
      fs.copyFileSync(source, target);
    }
  }
}

const members = [
  ['202425220304', '陈志杰', '前端页面开发、答辩材料整理', '25%'],
  ['202425220306', '段瑞', '后端业务实现、接口联调', '25%'],
  ['202425220307', '贺宇轩', '前端功能完善、测试文档', '20%'],
  ['202425220308', '胡衍科', '后端开发、数据库设计', '30%'],
];

const roles = [
  ['管理员', '维护公告、用户、角色、权限、系统配置、学期、课程、教学班、学生名单、成绩、考勤和课表，查看全量统计数据。', '每日或每周', '关注全局配置、异常预警、数据导入导出和权限边界。'],
  ['教师', '查看本人教学课表，维护本人负责教学班的成绩、考勤和学业预警。', '每日', '关注授课班级、考勤异常、成绩录入效率和风险学生。'],
  ['学生', '查看个人课表、班级课表、校历、选课、成绩、绩点、考试、补考、考勤和预警。', '高频', '关注个人数据准确性、查询入口清晰和移动端可读。'],
];

const modules = [
  ['M01', '登录认证与菜单', '用户名密码登录、BCrypt 校验、JWT 签发、当前用户、退出登录、角色菜单返回。'],
  ['M02', '首页仪表盘', '按角色展示公告、天气、课表、统计卡片、趋势和最近预警。'],
  ['M03', '公告管理', '管理员维护通知公告，师生在首页查看已发布公告。'],
  ['M04', '校历与课表', '学生查看校历、个人课表和班级课表；管理员维护教学课表。'],
  ['M05', '学期与课程', '维护学期、学院、专业、行政班、课程编码、课程名称、学分和学时。'],
  ['M06', '教学班管理', '按学期、课程和教师建立教学班，维护容量、班级编码和学生名单。'],
  ['M07', '成绩管理', '教师或管理员录入平时分、期末分，总评按 40% + 60% 自动计算，支持 Excel 导入导出。'],
  ['M08', '考勤管理', '维护正常、迟到、早退、请假、旷课五类状态，支持批量删除、模板下载和导入导出。'],
  ['M09', '学业预警', '根据低成绩、挂科、旷课、迟到早退生成 LOW、MEDIUM、HIGH 风险。'],
  ['M10', '学生查询服务', '学生只读查看本人课程、成绩、考勤、预警、绩点、考试和补考信息。'],
  ['M11', '后台系统管理', '维护用户、角色、权限、系统配置和账号状态，支持管理员重置密码。'],
  ['M12', '个人安全设置', '用户修改密码、绑定邮箱、设置微信绑定状态并查看登录安全信息。'],
];

const dbTables = [
  ['sys_user', '系统账号表', 'id', 'uk_sys_user_username；idx_sys_user_type_status', '保存用户名、BCrypt 密码哈希、真实姓名、用户类型、邮箱、微信绑定和登录时间。'],
  ['sys_role', '角色表', 'id', 'uk_sys_role_code', '保存 ADMIN、TEACHER、STUDENT 及数据范围。'],
  ['sys_permission', '权限表', 'id', 'uk_sys_permission_code_role；idx_sys_permission_role', '保存权限码、菜单路径和角色绑定，用于前端菜单与后端鉴权。'],
  ['sys_user_role', '用户角色表', 'id', 'uk_sys_user_role；idx_user_id；idx_role_id', '保存账号与角色的多对多关系。'],
  ['semester', '学期表', 'id', 'uk_semester_name；idx_semester_current', '保存学期名称、学年、学期序号、起止日期和当前学期标记。'],
  ['college', '学院表', 'id', 'uk_college_code；uk_college_name', '保存学院编码、学院名称和排序。'],
  ['major', '专业表', 'id', 'uk_major_code；idx_major_college', '保存专业编码、专业名称、所属学院和学制。'],
  ['admin_class', '行政班表', 'id', 'uk_admin_class_name；idx_admin_class_major', '保存行政班名称、年级、班号和所属专业。'],
  ['course', '课程表', 'id', 'uk_course_code；idx_course_college', '保存课程编码、名称、别名、学院、学分、学时和课程性质。'],
  ['teacher_profile', '教师档案表', 'id', 'uk_teacher_user；uk_teacher_no；idx_teacher_college', '保存教师工号、学院、院系和职称。'],
  ['student_profile', '学生档案表', 'id', 'uk_student_user；uk_student_no；idx_student_class', '保存学号、专业、行政班、班级名称和入学年级。'],
  ['teaching_class', '教学班表', 'id', 'uk_teaching_class_code；idx_semester_course_teacher', '保存教学班编码、名称、学期、课程、教师和容量。'],
  ['teaching_class_student', '教学班学生表', 'id', 'uk_class_student；idx_class；idx_student', '保存教学班与学生名单关系。'],
  ['class_schedule', '课表表', 'id', 'idx_schedule_class_day；idx_schedule_week', '保存星期、节次、起止周、教室和上课地点。'],
  ['grade_record', '成绩记录表', 'id', 'uk_grade_class_student；idx_grade_total', '保存平时分、期末分、总评和成绩备注。'],
  ['attendance_record', '考勤记录表', 'id', 'uk_attendance_once；idx_attendance_status_date', '按教学班、学生、日期记录考勤状态。'],
  ['academic_warning', '学业预警表', 'id', 'idx_warning_student；idx_warning_level_status', '保存预警等级、原因、状态和生成时间。'],
  ['announcement', '公告表', 'id', 'idx_announcement_status_time', '保存标题、分类、摘要、来源地址、置顶状态和发布时间。'],
  ['system_config', '系统配置表', 'id', 'uk_config_key', '保存系统参数键值和说明。'],
  ['academic_calendar', '校历表', 'id', 'uk_calendar_year_term', '保存学年、学期、周数和起止日期。'],
  ['academic_calendar_day', '校历日期表', 'id', 'idx_calendar_day', '保存节假日、考试周、开学周等校历日期。'],
];

const views = [
  ['v_student_learning_summary', 'student_profile、sys_user、teaching_class_student、grade_record、attendance_record', '学生学习概览，统计平均分、挂科数和异常考勤数。'],
  ['v_teaching_class_grade_stat', 'teaching_class、course、grade_record', '教学班成绩统计，包含平均分、最高分、最低分和挂科数。'],
  ['v_academic_warning_source', 'teaching_class_student、grade_record、attendance_record', '预警规则计算来源数据。'],
];

const dictGroups = [
  {
    title: '账号、角色与权限数据',
    rows: [
      ['用户名', '登录账号和后台用户列表展示字段。', '字符型，最长 64 位', '不可重复；演示账号包含 admin、teacher01、student01。', '登录页、用户管理'],
      ['密码', '用户登录凭据。', '输入明文，数据库保存哈希', '数据库不得保存明文密码，统一使用 BCrypt 哈希。', '登录、修改密码、重置密码'],
      ['用户类型', '区分管理员、教师、学生。', '枚举', 'ADMIN、TEACHER、STUDENT。', '菜单、权限、数据范围'],
      ['权限码', '控制菜单入口和后台操作能力。', '字符型', '如 dashboard:view、grade:manage、admin:access。', '角色权限、菜单渲染'],
      ['数据范围', '限定用户可访问的数据集合。', '枚举', '管理员全量，教师本人教学班，学生本人数据。', '接口鉴权、查询过滤'],
    ],
  },
  {
    title: '组织、学期与课程数据',
    rows: [
      ['学期名称', '用于筛选课表、教学班、成绩和考勤。', '字符型', '同名学期不可重复，可标记当前学期。', '学期管理、筛选器'],
      ['学院编码/名称', '标识课程、专业和教师所属学院。', '字符型', '学院编码、名称唯一。', '课程、专业、教师档案'],
      ['专业名称', '学生培养方向。', '字符型', '关联学院和学制。', '学生档案、行政班'],
      ['行政班名称', '学生自然班级。', '字符型', '同名行政班唯一，保存年级和班号。', '学生档案、班级课表'],
      ['课程编码/名称', '课程基础资料。', '字符型', '课程编码唯一，名称支持查询。', '课程管理、教学班'],
      ['学分/学时', '课程教学量化信息。', '数字', '学分保留 1 位或 2 位小数，学时为正整数。', '课程表单、成绩查询'],
    ],
  },
  {
    title: '教学班与名单数据',
    rows: [
      ['教学班编码', '教学运行的唯一班级标识。', '字符型', '不可重复，通常由课程、学期、班号组合。', '教学班管理'],
      ['教学班名称', '页面展示和筛选使用。', '字符型', '应体现课程和班级序号。', '教学班列表、成绩考勤'],
      ['任课教师', '教学班负责人。', '数字关联', '必须关联有效教师档案。', '教学班表单、教师课表'],
      ['学生名单', '教学班中实际学习学生。', '数字关联', '同一教学班内同一学生不可重复。', '学生名单、成绩考勤'],
      ['容量', '教学班最大容纳人数。', '整数', '新增名单时不应超过容量。', '教学班管理'],
    ],
  },
  {
    title: '课表、校历与公告数据',
    rows: [
      ['星期与节次', '课表中课程发生的时间位置。', '整数', '星期 1-7，节次需成对保存开始节和结束节。', '个人课表、班级课表'],
      ['起止周', '课程在学期中的周次范围。', '整数', '开始周不得大于结束周。', '课表维护、学生查询'],
      ['教室/地点', '上课空间信息。', '字符型', '可为空，但建议填写教学楼和教室。', '课表列表'],
      ['校历日期类型', '标识开学、考试、假期等日期。', '枚举/字符型', '按学年和学期组织。', '校历页面'],
      ['公告状态', '公告是否发布。', '枚举', '仅发布状态在师生首页可见。', '公告管理、首页'],
      ['置顶标记', '重要公告优先展示。', '布尔值', '置顶公告排序靠前。', '公告列表'],
    ],
  },
  {
    title: '成绩、考勤与预警数据',
    rows: [
      ['平时分', '课程过程成绩。', '0-100 数值', '录入后参与总评计算。', '成绩管理、导入模板'],
      ['期末分', '课程期末成绩。', '0-100 数值', '录入后参与总评计算。', '成绩管理、成绩查询'],
      ['总评', '系统计算课程最终成绩。', '数值，保留 2 位小数', '总评 = 平时分 * 40% + 期末分 * 60%。', '成绩列表、预警'],
      ['考勤日期', '一次考勤发生日期。', '日期', '同一教学班、学生、日期不能重复。', '考勤管理'],
      ['考勤状态', '学生课堂出勤状态。', '枚举', 'NORMAL、LATE、EARLY_LEAVE、LEAVE、ABSENT。', '考勤列表、导入模板'],
      ['预警等级', '学习风险程度。', '枚举', 'LOW、MEDIUM、HIGH，由成绩和考勤规则生成。', '学业预警'],
      ['预警原因', '风险解释文字。', '文本', '说明低分、挂科、旷课或迟到早退原因。', '预警详情'],
    ],
  },
  {
    title: '导入导出与个人安全数据',
    rows: [
      ['Excel 模板', '成绩和考勤批量导入格式。', 'xlsx 文件', '由后端接口生成，字段与导入校验一致。', '模板下载'],
      ['导入结果', '批量导入处理反馈。', '数字/文本', '返回成功数、失败数和错误明细。', '导入弹窗'],
      ['邮箱', '个人安全信息。', '邮箱格式', '用户可在个人主页绑定或修改。', '个人主页'],
      ['微信绑定状态', '个人账号关联状态。', '布尔值', '演示系统只维护绑定状态，不接入真实微信开放平台。', '个人主页'],
      ['系统配置值', '后台参数配置。', '字符型', '由管理员维护，普通用户不可修改。', '系统配置'],
    ],
  },
];

function tr(text, opts = {}) {
  return new TextRun({
    text: String(text),
    font: opts.font || '宋体',
    size: opts.size || 22,
    bold: opts.bold,
    color: opts.color,
    italics: opts.italics,
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    heading: opts.heading,
    alignment: opts.align,
    numbering: opts.numbering,
    spacing: { before: opts.before ?? 70, after: opts.after ?? 70, line: opts.line ?? 320 },
    children: [tr(text, opts)],
  });
}

function h1(text) {
  return para(text, { heading: HeadingLevel.HEADING_1, size: 30, bold: true, font: '黑体', before: 240, after: 140 });
}

function h2(text) {
  return para(text, { heading: HeadingLevel.HEADING_2, size: 26, bold: true, font: '黑体', before: 180, after: 100 });
}

function bullet(text) {
  return para(text, { numbering: { reference: 'bullet', level: 0 }, before: 30, after: 30 });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function placeholder(text) {
  return para(`【${text}占位，后续由项目组替换为截图或图形】`, {
    align: AlignmentType.CENTER,
    italics: true,
    color: '666666',
    before: 120,
    after: 120,
  });
}

function cell(text, width, shaded = false) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 110, right: 110 },
    shading: shaded ? { fill: 'E8F3F0', type: ShadingType.CLEAR } : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    },
    children: [para(String(text), { before: 0, after: 0, line: 280 })],
  });
}

function table(headers, rows, widths) {
  return new Table({
    width: { size: widths.reduce((sum, width) => sum + width, 0), type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ children: headers.map((header, index) => cell(header, widths[index], true)) }),
      ...rows.map((row) => new TableRow({ children: row.map((value, index) => cell(value, widths[index])) })),
    ],
  });
}

function baseDoc(children) {
  return new Document({
    styles: {
      default: { document: { run: { font: '宋体', size: 22 } } },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { font: '黑体', size: 30, bold: true },
          paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 0 },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { font: '黑体', size: 26, bold: true },
          paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: 'bullet',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 480, hanging: 240 } } },
          }],
        },
      ],
    },
    sections: [{
      properties: { page: { margin: { top: 1200, right: 1000, bottom: 1000, left: 1000 } } },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              tr('第 ', { size: 18 }),
              new TextRun({ children: [PageNumber.CURRENT], font: '宋体', size: 18 }),
              tr(' 页', { size: 18 }),
            ],
          })],
        }),
      },
      children,
    }],
  });
}

function cover(title, subtitle) {
  return [
    para('【SmartCampus】设计方案之需求分析', { align: AlignmentType.CENTER, size: 34, bold: true, font: '黑体', before: 1100 }),
    para(title, { align: AlignmentType.CENTER, size: 38, bold: true, font: '黑体', color: '0F766E', before: 380 }),
    para(subtitle, { align: AlignmentType.CENTER, size: 26, before: 160 }),
    para('SmartCampus 项目组', { align: AlignmentType.CENTER, size: 24, before: 460 }),
    para('2026年6月', { align: AlignmentType.CENTER, size: 24 }),
    pageBreak(),
  ];
}

function docInfoRows(title, docNo) {
  return [
    ['项目名称', 'SmartCampus 通用高校教务系统', '项目经理', '陈志杰'],
    ['文档编号', docNo, '密级', '内部交流'],
    ['文档标题', title, '版本', 'V1.0.0'],
    ['项目成员', '陈志杰、段瑞、贺宇轩、胡衍科', '课程名称', '数据库系统'],
  ];
}

function controlTables() {
  return [
    h1('文档信息'),
    table(['项目', '内容', '项目', '内容'], docInfoRows('SmartCampus 设计方案之需求分析', 'SMARTCAMPUS-REQ-001'), [1500, 3300, 1500, 2700]),
    h1('文件控制'),
    h2('版本记录'),
    table(['日期', '作者', '版本', '变更说明'], [
      ['2026-06-20', '陈志杰、段瑞、贺宇轩、胡衍科', 'V1.0.0', '依据当前源码、SQL 脚本和交付模板重写需求分析内容。'],
      ['2026-06-21', '胡衍科', 'V1.0.1', '补充公告、课表、校历、后台系统管理、Excel 导入导出和个人安全设置。'],
    ], [1700, 3000, 1300, 3000]),
    h2('审阅记录'),
    table(['日期', '审阅者', '意见'], [
      ['2026-06-21', '项目组', '内容与 SmartCampus 当前代码、数据库脚本和运行说明保持一致，图形部分留占位。'],
    ], [1800, 2500, 4700]),
    h2('分发记录'),
    table(['日期', '接受人', '地点'], [
      ['2026-06-21', '项目组成员、指导教师', '课程设计答辩与文档提交目录'],
    ], [1800, 3900, 3300]),
  ];
}

function requirementUseCases() {
  const cases = [
    ['2.4.1 登录认证与角色菜单 (F-AUTH-01)', 'F-AUTH-01', '系统应支持管理员、教师、学生通过统一登录入口认证，并根据角色返回不同菜单和数据范围。', '用户输入账号密码后，后端使用 BCrypt 校验密码，认证成功后签发 JWT；前端保存 Token 并调用 /api/auth/me 与 /api/auth/menus 获取用户信息和菜单。', 'UC-AUTH-01', '登录并加载角色菜单', '管理员、教师、学生', '登录页输入账号密码并进入对应工作台。', '用户账号存在且状态为启用。', '返回 JWT、用户信息、权限码和菜单路径。', '登录页、侧边栏菜单、个人信息下拉菜单'],
    ['2.4.2 教务基础数据管理 (F-CATALOG-01)', 'F-CATALOG-01', '系统应支持学期、学院、专业、行政班、课程、教师和学生档案等基础数据查询与维护。', '管理员维护教务运行所需基础资料，课程和学期作为教学班、课表、成绩、考勤的上游数据，学院、专业和行政班用于组织学生档案。', 'UC-CATALOG-01', '维护课程与学期基础资料', '管理员', '新增或编辑课程、学期并供教学班选择。', '管理员已登录并具有基础数据管理权限。', '课程和学期数据可被教学班、课表、成绩和考勤模块复用。', '学期管理页、课程管理页、课程表单'],
    ['2.4.3 教学班与学生名单管理 (F-CLASS-01)', 'F-CLASS-01', '系统应支持按学期、课程、教师创建教学班，并维护教学班学生名单。', '管理员创建教学班后，将学生加入对应教学班名单，形成后续成绩、考勤、课表和预警的业务范围。', 'UC-CLASS-01', '创建教学班并维护名单', '管理员', '选择学期、课程、教师和容量创建教学班，再添加学生名单。', '课程、学期、教师档案和学生档案已存在。', 'teaching_class 与 teaching_class_student 数据形成完整教学组织。', '教学班管理页、学生名单页'],
    ['2.4.4 课表、校历与公告服务 (F-SERVICE-01)', 'F-SERVICE-01', '系统应提供个人课表、班级课表、校历和公告查看能力，管理员可维护课表和公告。', '课表通过教学班关联学生和教师，学生可查看个人课表和班级课表；公告按发布状态和置顶状态展示在首页。', 'UC-SERVICE-01', '查看个人课表和公告', '学生、教师、管理员', '用户进入首页或课表页面查看本角色范围内的课程安排和公告。', '用户已登录，课表、校历或公告数据已维护。', '页面展示对应范围内的课表、校历日期和公告列表。', '首页、个人课表、班级课表、校历页、公告管理'],
    ['2.4.5 成绩与考勤管理 (F-TEACH-01)', 'F-TEACH-01', '系统应支持成绩和考勤的录入、查询、批量删除、模板下载、Excel 导入和导出。', '教师在本人教学班范围内维护成绩和考勤；管理员可维护全量数据。成绩总评由平时分和期末分计算，考勤按日期和状态记录。', 'UC-TEACH-01', '维护成绩和考勤', '教师、管理员', '教师筛选教学班后录入成绩或考勤，也可下载模板批量导入。', '教师负责该教学班，学生已在名单中。', 'grade_record 或 attendance_record 写入成功，总评和唯一性规则生效。', '成绩管理页、考勤管理页、导入导出弹窗'],
    ['2.4.6 学业预警与学生查询 (F-STUDENT-01)', 'F-STUDENT-01', '系统应根据成绩和考勤生成学业预警，并向学生提供本人数据查询入口。', '系统按规则识别低分、挂科、旷课、迟到早退等风险，生成 LOW、MEDIUM、HIGH 预警；学生端只读查看本人课程、成绩、考勤、预警、绩点、考试和补考。', 'UC-STUDENT-01', '生成预警并查看本人数据', '管理员、教师、学生', '管理员或教师触发预警重新计算，学生进入查询页面查看本人学习情况。', '成绩或考勤数据已存在。', 'academic_warning 更新；学生接口仅返回当前登录学生数据。', '学业预警页、我的选课、成绩查询、绩点查询、考试、补考'],
    ['2.4.7 后台系统管理与个人安全 (F-ADMIN-01)', 'F-ADMIN-01', '系统应支持用户、角色、权限、系统配置和个人安全设置。', '管理员可维护账号、角色、权限和系统参数，启停账号、重置密码；普通用户可修改密码、绑定邮箱和微信状态。', 'UC-ADMIN-01', '维护账号权限和个人安全信息', '管理员、教师、学生', '管理员进入后台维护用户和权限；普通用户在个人主页修改安全信息。', '管理员已登录或用户已登录。', '权限变更影响菜单和接口访问；个人安全信息更新成功。', '管理员后台、用户管理、角色权限、系统配置、个人主页'],
  ];
  const children = [];
  cases.forEach((item) => {
    const [title, code, req, desc, uc, ucTitle, actors, flow, pre, post, ui] = item;
    children.push(h2(title));
    children.push(para(`功能编号：${code}`));
    children.push(para(`功能需求：${req}`));
    children.push(para(`功能描述：${desc}`));
    children.push(para('业务建模：'));
    children.push(placeholder(`${title} 用例图`));
    children.push(para(`用例描述：${ucTitle}`));
    children.push(table(['描述对象', '描述内容'], [
      ['标识符', uc],
      ['说明', flow],
      ['参与者', actors],
      ['频度', code === 'F-AUTH-01' ? '高，每次进入系统时触发' : '中高，随日常教学管理触发'],
      ['状态', '通过审查'],
      ['前置条件', pre],
      ['后置条件', post],
      ['基本流程', '用户进入页面 -> 前端提交查询或保存请求 -> 后端执行 JWT 鉴权和权限码校验 -> Service 校验业务规则和数据范围 -> Mapper 访问 MySQL -> 返回统一响应 -> 前端刷新列表或提示结果。'],
      ['备选流程', '筛选条件为空时返回默认分页；导入文件存在错误时返回成功数、失败数和错误明细；无数据时展示空状态。'],
      ['异常流程', '未登录返回 401；无权限返回 403；参数为空、重复或越界返回业务错误；文件格式错误时拒绝导入。'],
      ['输入', '账号密码、筛选条件、表单字段、Excel 文件或用户操作按钮。'],
      ['输出', '列表、详情、统计卡片、导出文件、操作结果提示。'],
      ['用户界面', ui],
      ['数据约束', '以后端权限、唯一索引、逻辑外键校验和统一响应结构为准。'],
    ], [1800, 7200]));
    children.push(placeholder(`${title} 页面原型图`));
  });
  return children;
}

function requirementDoc() {
  const children = [
    ...cover('SmartCampus 通用高校教务系统', '需求分析文档'),
    ...controlTables(),
    h1('引言'),
    h2('编写目的'),
    para('本文档从用户业务场景出发，说明 SmartCampus 通用高校教务系统需要支持的业务范围、用户角色、界面数据、功能需求、非功能需求和运行环境，为数据库设计、后端实现、前端页面开发、测试验收和答辩汇报提供统一依据。'),
    bullet('多角色协同需求：系统面向管理员、教师和学生，根据岗位或身份提供不同菜单、数据范围和操作能力。'),
    bullet('教务业务闭环需求：系统覆盖基础数据、教学班、学生名单、课表、成绩、考勤、学业预警、公告和后台配置。'),
    bullet('数据支撑需求：系统通过关系型数据库沉淀教务数据，减少人工表格维护成本，使数据可查询、可统计、可导入导出和可追踪。'),
    h2('背景'),
    para('A. 待开发软件系统名称：SmartCampus 通用高校教务系统。'),
    para('B. 系统基本概念：本系统面向高校教务运行场景，采用 B/S 架构，以浏览器作为统一入口，以 MySQL 保存用户、权限、课程、课表、成绩、考勤、预警和公告等结构化数据。'),
    para('C. 任务提出者、开发者、用户及运行网络：任务提出者为课程设计要求和项目组；开发者为 SmartCampus 项目组；用户为管理员、教师、学生；研发与演示阶段运行于本地计算环境和校园局域网。'),
    para('D. 项目代号：SMARTCAMPUS-2026。'),
    h2('用户特点'),
    table(['用户类型', '典型职责', '使用频度', '界面与数据关注点'], roles, [1400, 3300, 1200, 3100]),
    para('基于上述用户特点，本系统在设计时遵循以下约束：'),
    bullet('界面与交互设计约束：管理员页面以表格、筛选和表单为主；教师页面强调录入效率；学生页面强调只读查询和移动端可读。'),
    bullet('容错与提示设计约束：关键字段为空、重复、越界或文件格式错误时，前后端均应给出明确提示。'),
    bullet('性能与稳定性约束：首页、课表、成绩和考勤属于高频入口，应保证常规查询秒级响应。'),
    h2('假定与约束'),
    bullet('首期建设以单校区教务演示闭环为主，暂不纳入在线选课退课、请假审批流、排课冲突检测、真实消息推送和微服务拆分。'),
    bullet('系统必须使用数据库保存业务数据，提供增删改查、分页查询、导入导出和角色菜单控制。'),
    bullet('数据库不建立强外键，采用唯一索引、普通索引、逻辑删除字段和 Service 层逻辑外键校验。'),
    bullet('Redis 默认作为缓存和会话依赖存在，业务缓存已设计降级能力；认证主流程使用 JWT。'),
    h2('参考资料'),
    bullet('《数据库系统课程设计任务书》'),
    bullet('课程设计需求分析文档模板结构'),
    bullet('SmartCampus 当前源码、SQL 脚本和 docs/README.md 启动说明'),
    bullet('Spring Boot、Spring Security、MyBatis-Plus、MySQL、React、Vite、TanStack Query 官方文档'),
    h2('术语定义及说明'),
    table(['术语', '说明'], [
      ['RBAC', '基于角色的访问控制模型，系统通过用户、角色、权限码控制菜单和操作能力。'],
      ['数据范围', '角色对应的数据访问边界：管理员全量，教师本人教学班，学生本人数据。'],
      ['教学班', '某一学期中由课程、任课教师和一组学生组成的教学组织。'],
      ['教学闭环', '学期、课程、教学班、学生名单、课表、成绩、考勤和预警形成的完整业务链路。'],
      ['学业预警', '系统根据成绩和考勤异常生成 LOW、MEDIUM、HIGH 风险等级。'],
      ['逻辑外键', '数据库字段保存关联 id，不建立强外键，由索引和 Service 层校验保证一致性。'],
      ['外模式', '面向页面、报表或统计的数据组织方式，本系统通过视图和接口组合提供。'],
    ], [2200, 6800]),
    h1('功能需求'),
    h2('2.1 系统范围'),
    para('开发意图与应用目标：SmartCampus 的目标是支撑高校教务运行中的日常查询、教学过程管理、风险预警和后台配置，让管理员、教师、学生在同一系统内完成高频教务工作。'),
    para('系统的作用范围：管理员负责全局配置和数据维护；教师负责本人教学班的课表、成绩、考勤和预警；学生负责查询本人学习相关数据。系统边界不覆盖真实选课抢课、缴费、宿舍、图书馆、第三方统一身份认证和生产级消息推送。'),
    table(['角色', '作用范围', '典型页面'], [
      ['管理员', '全量基础数据、教学班、学生名单、课表、公告、用户、角色、权限、系统配置。', '管理员后台、学期管理、课程管理、教学班、学生名单、成绩、考勤、预警、课表管理、公告管理'],
      ['教师', '本人教学班范围内的课表、成绩、考勤和预警数据。', '首页、教学课表、成绩管理、考勤查询、学业预警'],
      ['学生', '本人课程、课表、校历、成绩、绩点、考试、补考、考勤和预警。', '主页、我的选课、个人课表、班级课表、校历、成绩查询、绩点查询、考试、补考'],
    ], [1300, 5000, 2700]),
    h2('2.2 系统功能结构'),
    para('系统功能结构按“基础与后台配置、教学过程管理、学生查询服务、运行支撑”四个层次组织。'),
    table(['编号', '模块', '功能说明'], modules, [900, 2100, 6000]),
    placeholder('图 2-1 系统功能结构图'),
    h2('2.3 系统总体流程'),
    para('用户通过统一登录入口提交账号密码，后端校验成功后返回 JWT、用户信息和菜单。管理员先维护学期、学院、专业、课程、教师、学生等基础资料，再创建教学班、维护学生名单和课表；教师在本人教学班范围内维护成绩和考勤；系统根据成绩和考勤生成学业预警；学生登录后只读查看本人课程、课表、成绩、考勤、预警、考试和补考信息。'),
    placeholder('图 2-2 系统总体流程图'),
    h2('2.4 需求分析'),
    ...requirementUseCases(),
    h2('2.5 数据词典'),
    ...dictGroups.flatMap((group) => [
      h2(group.title),
      table(['数据项名称', '用户视角说明', '格式/长度', '取值范围与业务规则', '典型界面'], group.rows, [1400, 2500, 1700, 2300, 1100]),
    ]),
    h1('非功能需求'),
    h2('3.1 性能与时间特性'),
    bullet('常规列表查询、表单保存、详情查看和首页数据加载应保持秒级响应。'),
    bullet('成绩、考勤导入导出可接受较长处理时间，但界面应展示进度或明确反馈，避免重复提交。'),
    bullet('成绩保存、考勤保存、预警重算等关键业务应在后端统一校验后写入，避免前端绕过约束。'),
    h2('3.2 精度与输入输出'),
    bullet('成绩分值统一按 0-100 范围处理，总评保留两位小数。'),
    bullet('日期统一使用 YYYY-MM-DD，日期时间统一使用 YYYY-MM-DD HH:MM:SS。'),
    bullet('分页接口统一支持 page、size、keyword 等参数，导入导出使用 xlsx 文件。'),
    h2('3.3 数据管理能力'),
    bullet('系统应支持学生、课程、教学班、课表、成绩、考勤、公告和权限数据长期累积。'),
    bullet('高频字段建立索引，包括用户名、角色、课程编码、教学班编码、学生学号、考勤日期、预警等级和公告发布时间。'),
    bullet('应提供覆盖主要角色和业务流程的演示数据，便于答辩、测试和截图。'),
    h2('3.4 安全保密性与审计'),
    bullet('所有业务页面需登录后访问，后端以 JWT 和权限码控制接口访问。'),
    bullet('密码不得明文保存，数据库仅保存 BCrypt 哈希。'),
    bullet('权限控制不能只依赖前端隐藏菜单，后端必须按角色和数据范围校验。'),
    bullet('JWT 密钥不应硬编码到源码中，演示密钥文件可由环境变量覆盖。'),
    h2('3.5 易用性、可靠性与灵活性'),
    bullet('导航、表格、筛选、分页、表单和导入导出应保持后台管理系统常见交互模式。'),
    bullet('Redis 异常时，主要业务查询应尽量降级到本地缓存或数据库路径。'),
    bullet('预警规则、权限码和菜单路径应保持可扩展，便于后续加入审批流、选课和消息通知。'),
    h1('运行环境规定'),
    h2('4.1 设备'),
    table(['设备类别', '规定'], [
      ['服务器端', 'CPU 双核 2.0GHz 及以上，内存 4GB 及以上，50GB 以上可用空间。'],
      ['客户端', '普通办公电脑即可，建议 1366x768 及以上分辨率，使用键盘、鼠标和现代浏览器。'],
      ['网络', '研发和演示阶段可运行于本机或校园局域网，前后端通过 HTTP 通信。'],
    ], [1800, 7200]),
    h2('4.2 支持软件'),
    table(['软件类别', '规定'], [
      ['操作系统', 'Windows 10/11、Windows Server 或 Linux 发行版。'],
      ['后端环境', 'JDK 17、Maven 3.9+、Spring Boot 3.3.7。'],
      ['数据库', 'MySQL 8.0，默认数据库 smart_campus。'],
      ['缓存', 'Redis 可选；连接失败时业务缓存降级处理。'],
      ['前端环境', 'Node.js 20.19+、22.13+ 或 24+，Vite 开发服务器。'],
      ['浏览器', 'Chrome、Edge 等支持 HTML5 和 JavaScript 的现代浏览器。'],
    ], [1800, 7200]),
    h2('4.3 接口'),
    bullet('浏览器与后端通过 REST JSON API 通信，统一响应结构为 code、message、data。'),
    bullet('后端接口集中在 /api 路径下，接口文档可通过 /doc.html 和 /v3/api-docs 查看。'),
    bullet('成绩和考勤提供模板下载、Excel 导入和 Excel 导出接口。'),
    h2('4.4 控制'),
    bullet('后端通过 Maven 或打包后的 Spring Boot 应用启动，默认端口 8080，可用环境变量覆盖。'),
    bullet('前端通过 npm run dev 启动开发服务器，默认代理 /api、/v3、/doc.html 到后端。'),
    bullet('用户操作通过点击、表单输入、文件上传和筛选条件触发 HTTP 请求。'),
    h1('需求跟踪'),
    table(['需求编号', '需求内容', '来源用户/业务场景', '对应功能模块', '优先级/状态'], modules.map((module) => [
      module[0].replace('M', 'R'),
      module[2],
      module[1].includes('学生') ? '学生查询场景' : module[1].includes('后台') ? '管理员配置场景' : '教务运行场景',
      module[1],
      '高/已确认',
    ]), [900, 3400, 1900, 1700, 1100]),
    h1('签批单'),
    para('我已阅读上述软件需求规格说明书，我将严格遵守说明书中的条款，并保证全力支持该规格说明书的实施。'),
    para('执行主管: 陈志杰                     技术主管: 胡衍科'),
    para('日期                               日期'),
    para('项目组长: 陈志杰                    用户代表: 贺宇轩'),
    para('日期                               日期'),
    para('开发人员代表: 段瑞                  小组成员: 陈志杰、段瑞、贺宇轩、胡衍科'),
    para('日期                               日期'),
  ];
  return baseDoc(children);
}

function designCover() {
  return [
    para('华南农业大学课程设计报告', { align: AlignmentType.CENTER, size: 36, bold: true, font: '黑体', before: 900 }),
    para('实验项目名称：数据库分析与设计实习', { align: AlignmentType.CENTER, size: 24, before: 260 }),
    para('实验项目性质：课程设计', { align: AlignmentType.CENTER, size: 24 }),
    para('计划学时：2周', { align: AlignmentType.CENTER, size: 24 }),
    para('所属课程名称：数据库系统', { align: AlignmentType.CENTER, size: 24 }),
    para('开设时间：2025-2026学年第2学期', { align: AlignmentType.CENTER, size: 24 }),
    para('授课学生：24软件工程3班', { align: AlignmentType.CENTER, size: 24 }),
    para('授课人数：4', { align: AlignmentType.CENTER, size: 24 }),
    para('实验课指导教师：郭玉彬', { align: AlignmentType.CENTER, size: 24 }),
    para('华 南 农 业 大 学 信 息 学 院', { align: AlignmentType.CENTER, size: 24, before: 600 }),
    pageBreak(),
  ];
}

function scoreSheet() {
  return [
    para('数据库分析与设计实习成绩单', { align: AlignmentType.CENTER, size: 32, bold: true, font: '黑体', before: 260 }),
    para('开设时间：2025-2026学年第2学期', { align: AlignmentType.CENTER }),
    table(['小组成员、组内分工及各成员成绩', '', '', ''], [['学号', '姓名', '分工', '工作量比例'], ...members], [1800, 1400, 4400, 1400]),
    table(['项目', '内容'], [
      ['实验题目', 'SmartCampus 通用高校教务系统数据库分析与设计'],
      ['教师评语', '评价指标：成员分工完成情况、数据库设计水平、功能设计、后台程序设计、界面设计、课程设计报告结构与总结分析。'],
      ['小组成绩', ''],
      ['教师签名', ''],
    ], [1800, 7200]),
    pageBreak(),
  ];
}

function designDoc() {
  const children = [
    ...designCover(),
    ...scoreSheet(),
    para('目录', { align: AlignmentType.CENTER, size: 30, bold: true, font: '黑体' }),
    ...['1. 引言', '2. 功能需求', '3. 数据库设计', '4. 系统设计与实现', '5. 系统安装及使用说明', '6. 总结'].map((item) => para(item)),
    pageBreak(),
    h1('数据库系统课程设计说明书'),
    h1('1. 引言'),
    h2('1.1 编写目的'),
    para('本课程设计说明书用于对 SmartCampus 通用高校教务系统的业务需求、数据库结构、系统实现方案、部署配置及使用方式进行系统化说明。文档重点展示系统在数据库分析与设计方面的完整思路，包括实体建模、逻辑结构、外模式、物理结构、接口落地和演示运行方式。'),
    h2('1.2 定义'),
    table(['名词', '定义'], [
      ['SmartCampus', '面向高校教务场景的数据库应用系统，覆盖基础数据、课表、成绩、考勤、预警、公告和后台配置。'],
      ['教学班', '课程在某一学期面向一组学生开设的教学组织，由学期、课程、教师和学生名单组成。'],
      ['RBAC', '基于角色的访问控制，通过用户、角色、权限码和菜单路径限制访问能力。'],
      ['逻辑删除', '数据不物理删除，使用 deleted 字段标识删除状态。'],
      ['外模式', '通过视图和接口为页面或统计场景提供的数据组织形式。'],
    ], [2100, 6900]),
    h2('1.3 参考资料'),
    bullet('《数据库系统课程设计任务书》'),
    bullet('数据库课程设计报告模板结构'),
    bullet('SmartCampus 源码、SQL 脚本、README 和运行说明'),
    bullet('Spring Boot、MyBatis-Plus、MySQL、React、Vite、Knife4j、POI 官方文档'),
    h1('2. 功能需求'),
    h2('2.1 系统范围'),
    para('SmartCampus 的系统范围是高校教务管理演示闭环，用户包括管理员、教师和学生。系统覆盖登录认证、首页、公告、校历、课表、基础数据、教学班、学生名单、成绩、考勤、学业预警、学生查询、后台权限配置和个人安全设置。'),
    h2('2.2 系统功能结构'),
    table(['编号', '模块', '说明'], modules, [900, 2100, 6000]),
    placeholder('系统功能结构图'),
    h2('2.3 系统总体流程'),
    para('总体流程为：用户登录 -> 后端返回用户和菜单 -> 管理员维护基础数据 -> 管理员创建教学班和名单 -> 管理员维护课表和公告 -> 教师录入成绩与考勤 -> 系统生成学业预警 -> 学生查询本人课程、课表、成绩、考勤、预警、考试和补考。'),
    placeholder('系统总体流程图'),
    h2('2.4 需求分析'),
    para('需求分析详见需求分析文档。本设计文档在该基础上进一步说明数据库模式、程序分层和部署运行方式。'),
    h1('3. 数据库设计'),
    h2('3.1 概念结构设计'),
    para('核心实体包括系统用户、角色、权限、学期、学院、专业、行政班、课程、教师档案、学生档案、教学班、教学班学生名单、课表、成绩、考勤、学业预警、公告、系统配置、校历和校历日期。系统围绕“基础资料 -> 教学班 -> 课表/成绩/考勤 -> 预警/查询”的业务链路设计。'),
    placeholder('整体 ER 图'),
    placeholder('用户权限 ER 图'),
    placeholder('教学班、课表、成绩、考勤 ER 图'),
    h2('3.2 逻辑结构设计'),
    table(['联系', '类型', '关系数据库转换'], [
      ['用户-角色', '多对多', 'sys_user_role 保存 user_id、role_id。'],
      ['角色-权限', '一对多配置', 'sys_permission 通过 role_code 关联角色编码。'],
      ['学院-专业', '一对多', 'major.college_id 逻辑关联 college.id。'],
      ['专业-行政班', '一对多', 'admin_class.major_id 逻辑关联 major.id。'],
      ['用户-教师档案', '一对一', 'teacher_profile.user_id 逻辑关联 sys_user.id。'],
      ['用户-学生档案', '一对一', 'student_profile.user_id 逻辑关联 sys_user.id。'],
      ['学期/课程/教师-教学班', '多对一组合', 'teaching_class 保存 semester_id、course_id、teacher_id。'],
      ['教学班-学生', '多对多', 'teaching_class_student 保存 teaching_class_id、student_id。'],
      ['教学班-课表', '一对多', 'class_schedule.teaching_class_id 逻辑关联 teaching_class.id。'],
      ['教学班/学生-成绩', '一对一业务记录', 'grade_record 对 teaching_class_id + student_id 建唯一约束。'],
      ['教学班/学生/日期-考勤', '一对一业务记录', 'attendance_record 对 teaching_class_id + student_id + attendance_date 建唯一约束。'],
      ['学生-预警', '一对多', 'academic_warning.student_id 逻辑关联 student_profile.id。'],
    ], [2300, 1700, 5000]),
    h2('3.3 数据库模式设计'),
    table(['英文表名', '中文表名', '主键', '主要索引或约束', '说明'], dbTables, [1700, 1700, 700, 2700, 2200]),
    h2('3.4 外模式设计'),
    table(['外模式', '来源表', '用途'], views, [2500, 4100, 2400]),
    h2('3.5 物理结构设计'),
    para('数据库使用 MySQL 8、InnoDB、utf8mb4 字符集。主键采用 BIGINT AUTO_INCREMENT，业务唯一性使用 unique 约束，高频检索字段建立普通索引。核心表均包含 create_time、update_time 和 deleted 字段，支持逻辑删除和后续审计。系统不建立数据库强外键，避免课程演示环境导入顺序和数据重置复杂化，引用一致性由 Service 层校验。'),
    h2('3.6 编程性结构设计'),
    para('系统当前未使用触发器和存储过程。成绩总评由 ScoreCalculator 计算；学业预警由 WarningRuleEngine 根据成绩和考勤生成；Excel 导入导出由 ExcelService 处理；数据范围由 AccessService 和业务 Service 共同控制。数据库端提供 3 个视图支撑学习概览、教学班成绩统计和预警来源分析。'),
    h1('4. 系统设计与实现'),
    h2('4.1 开发环境'),
    table(['类别', '选择', '说明'], [
      ['后端语言', 'Java 17', '实现 Web API、鉴权和业务逻辑。'],
      ['后端框架', 'Spring Boot 3.3.7、Spring Security、MyBatis-Plus 3.5.9', '组织 REST 接口、权限控制和数据库访问。'],
      ['数据库与缓存', 'MySQL 8、Redis、Caffeine', 'MySQL 保存业务数据，Redis/Caffeine 支撑缓存和会话相关能力。'],
      ['接口文档', 'Knife4j / OpenAPI', '提供 /doc.html 和 /v3/api-docs。'],
      ['前端语言', 'TypeScript', '提高前端接口和组件类型安全。'],
      ['前端框架', 'React 19、Vite 8、Tailwind CSS 4、TanStack Query、Axios', '实现教务后台工作台和服务端状态管理。'],
      ['文件处理', 'Apache POI、xlsx 下载接口', '支持成绩和考勤模板、导入、导出。'],
    ], [1800, 3600, 3600]),
    h2('4.2 功能模块划分'),
    para('后端按 Controller、Service、Mapper、Domain、DTO、VO、Config、Security、Exception 分层组织。Controller 暴露 /api 接口并进行权限入口控制；Service 负责业务规则、逻辑外键和数据范围校验；Mapper 通过 MyBatis-Plus 访问 MySQL；Security 负责 JWT 解析、当前用户和权限上下文。'),
    para('前端按 pages、components、api、types、hooks、lib 分层组织。页面负责表格、表单、弹窗、导入导出和查询交互；api/campus.ts 封装后端接口；AppShell 根据后端菜单渲染侧边栏；TanStack Query 管理服务端状态。'),
    h2('4.3 系统界面设计'),
    para('界面采用后台工作台风格。左侧导航由后端菜单驱动，顶部显示当前用户和退出入口，主区以统计卡片、公告列表、课表、数据表格、筛选栏、表单弹窗和导入导出控件为主。管理员页面强调配置效率，教师页面强调成绩和考勤录入，学生页面强调只读查询。'),
    placeholder('登录页原型图'),
    placeholder('管理员首页原型图'),
    placeholder('成绩管理和考勤管理原型图'),
    placeholder('学生查询页面原型图'),
    h2('4.4 数据库连接'),
    para('后端默认连接 jdbc:mysql://localhost:3306/smart_campus，用户名 root，密码通过 SMARTCAMPUS_DB_PASSWORD 覆盖，默认演示值为 123456。JWT 密钥优先读取 SMARTCAMPUS_JWT_SECRET，也可读取 config/jwt-secret.txt。前端不直接连接数据库，而是通过 /api REST 接口访问后端。'),
    h2('4.5 实验数据设计与构造说明'),
    para('sql/data.sql 提供管理员、教师、学生、角色、权限、学院、专业、行政班、课程、教学班、名单、课表、公告、成绩、考勤、预警和校历等演示数据。演示账号包括 admin、teacher01、student01，默认密码均为 123456。'),
    h2('4.6 代码质量保障措施'),
    bullet('后端提供 ScoreCalculatorTest、WarningRuleEngineTest、JwtServiceTest、PasswordEncodingTest、LocalCacheServiceTest 等单元测试。'),
    bullet('前端提供 npm run type-check、npm run build 和 npm run lint 脚本。'),
    bullet('SQL 拆分为 schema.sql、views.sql、data.sql，便于空库导入和重复演示。'),
    h2('4.7 应用变化下的数据库调整策略'),
    para('后续若扩展在线选课、请假审批、排课冲突检测或消息通知，应优先新增独立业务表，并通过现有 sys_user、student_profile、teacher_profile、teaching_class 和 class_schedule 等主数据建立逻辑关联；预警规则可从固定代码演进为可配置策略表。'),
    h1('5. 系统安装及使用说明'),
    h2('5.1 运行环境'),
    para('服务器端需要 JDK 17、Maven 3.9+、MySQL 8；前端开发需要 Node.js 20.19+、22.13+ 或 24+；客户端建议使用 Chrome 或 Edge。Redis 可按需启动，主要业务演示可使用降级路径。'),
    h2('5.2 配置说明'),
    para('启动 MySQL 后依次导入 sql/schema.sql、sql/views.sql、sql/data.sql。进入 backend 执行 mvn spring-boot:run 启动后端；进入 frontend 执行 npm install 和 npm run dev 启动前端。若端口、数据库用户名密码或 Redis 地址不同，可通过 SMARTCAMPUS_SERVER_PORT、SMARTCAMPUS_DB_URL、SMARTCAMPUS_DB_USERNAME、SMARTCAMPUS_DB_PASSWORD、SMARTCAMPUS_REDIS_HOST 等环境变量覆盖。'),
    h2('5.3 用户使用说明'),
    para('管理员使用 admin/123456 登录，进入后台维护公告、配置、用户、角色和权限，并维护学期、课程、教学班、学生名单、课表、成绩、考勤和预警。教师使用 teacher01/123456 登录，查看教学课表并维护本人教学班的成绩、考勤和预警。学生使用 student01/123456 登录，查看个人课表、班级课表、校历、选课、成绩、绩点、考试和补考。'),
    h1('6. 总结'),
    para('SmartCampus 已形成围绕高校教务场景的数据库应用闭环：数据库结构覆盖用户权限、基础教务数据、教学班、课表、成绩、考勤、预警和公告；后端通过 Spring Boot、Spring Security、MyBatis-Plus 和 MySQL 实现接口与数据范围控制；前端通过 React、Vite、Tailwind、Axios 和 TanStack Query 实现后台工作台体验。后续可在当前模型上继续扩展在线选课、请假审批、排课冲突检测、消息通知和更细粒度的数据分析。'),
  ];
  return baseDoc(children);
}

function makeFallbackHtml() {
  const slides = [
    ['01', 'SmartCampus 通用高校教务系统', '面向高校教务管理场景的数据库应用系统'],
    ['02', '汇报目录', '需求分析、数据库设计、应用程序、协作与总结'],
    ['03', '需求分析：实际痛点', '教务数据分散、角色协作弱、过程追踪难'],
    ['04', '需求分析：拟解决方案', '按管理员、教师、学生三类角色划分功能，并落到数据表'],
    ['05', '数据库设计流程总览', '从业务对象推导实体，再落成逻辑表和约束'],
    ['06', '课程表设计流程 I', '课程作为教学资源实体，连接教学班、课表和成绩'],
    ['07', '课程表设计流程 II', 'course 表保留课程编码、名称、学分、学时和逻辑删除字段'],
    ['08', '学生与预警 ER 图', '学生档案和学业预警表字段完整展示'],
    ['09', '用户与权限 ER 图', '系统账号、角色、权限和菜单路径完整展示'],
    ['10', '教学班与成绩 ER 图', '教学班、学生名单、成绩和考勤关联展示'],
    ['11', '后端框架和设计', 'Spring Boot + Spring Security + MyBatis-Plus 三层结构'],
    ['12', '前端框架和设计', 'React + Axios + TanStack Query 管理端流程'],
    ['13', '小组工作总结', '小组成员与组内分工'],
    ['14', '谢谢观看', '请老师和同学批评指正'],
  ];
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>SmartCampus 通用高校教务系统课程设计报告</title><style>body{font-family:"Microsoft YaHei",sans-serif;margin:0;background:#f6f7f9}.slide{width:1280px;height:720px;padding:80px;box-sizing:border-box;border-bottom:1px solid #ddd}h1{font-size:56px;color:#0f766e}p{font-size:28px}</style></head><body>${slides.map((slide) => `<section class="slide" data-section="${slide[0]}"><h1>${slide[1]}</h1><p>${slide[2]}</p></section>`).join('')}</body></html>`;
}

const directHtmlTextMap = new Map(Object.entries({
  'TLIAS 管理系统': 'SmartCampus 通用高校教务系统',
  '面向培训机构教学管理场景的数据库应用系统': '面向高校教务管理场景的数据库应用系统',
  '汇报人：胡衍科': '汇报人：陈志杰 / 段瑞 / 贺宇轩 / 胡衍科',
  '24 软件工程 3 班': '24 软件工程 3 班',
  '答辩内容按课程设计报告逻辑展开。': '答辩内容按课程设计报告逻辑展开。',
  '01 需求分析': '01 需求分析',
  '业务痛点、三类角色、拟解决方案和数据库设计入口。': '教务痛点、三类角色、拟解决方案和数据库设计入口。',
  '02 数据库设计': '02 数据库设计',
  '设计流程、课程表重点流程、核心表与约束索引。': '设计流程、课程表重点流程、核心表、视图与约束索引。',
  '03 应用程序': '03 应用程序',
  '后端 MVC 三层、前端 Vue + Axios、页面如何落到数据库。': '后端分层架构、前端 React + Axios、页面如何落到数据库。',
  '04 协作与总结': '04 协作与总结',
  '小组分工、项目总结和后续扩展。': '小组分工、项目总结和后续扩展。',
  '需求分析：实际痛点': '需求分析：实际痛点',
  '系统要解决的是教学管理数据分散、流程割裂的问题。': '系统要解决的是高校教务数据分散、角色边界不清和过程追踪困难的问题。',
  '数据分散': '数据分散',
  '员工、班级、学员、课程、成绩、考勤、违纪数据容易散落在不同表格或人工记录中。': '用户、学院、专业、行政班、课程、教学班、课表、成绩、考勤和预警数据容易散落在不同表格或人工记录中。',
  '角色协作弱': '角色协作弱',
  '管理员、班主任、讲师关注的数据不同，缺少统一权限边界和同一套基础数据。': '管理员、教师、学生关注的数据不同，需要统一权限边界和同一套基础教务数据。',
  '过程追踪难': '过程追踪难',
  '成绩、考勤、违纪等过程数据如果不结构化，后续统计和追溯成本高。': '成绩、考勤、课表和预警等过程数据如果不结构化，后续统计和追溯成本高。',
  '核心需求': '核心需求',
  '可维护、可查询、可统计、可导入、可按角色控制访问范围。': '可维护、可查询、可统计、可导入导出、可按角色和数据范围控制访问。',
  '需求分析：拟解决方案': '需求分析：拟解决方案',
  '解决方案是按角色划分功能，再把功能落到数据表。': '解决方案是按管理员、教师、学生划分功能，再把功能落到数据库表和接口。',
  '管理员': '管理员',
  '负责员工、部门、菜单、公告等系统基础管理。': '负责用户、角色、权限、公告、系统配置和基础教务数据管理。',
  '权限落点：账号、job 字段、菜单数据和系统配置。': '权限落点：账号、角色、权限码、菜单路径和系统配置。',
  '班主任': '教师',
  '负责班级、学员、考勤、违纪等过程管理。': '负责本人教学班课表、成绩、考勤和学业预警管理。',
  '权限落点：按班级和学员组织日常过程数据。': '权限落点：按教学班和学生名单组织过程数据。',
  '讲师': '学生',
  '负责课程、考试、成绩、课表等教学结果管理。': '查看本人课程、课表、校历、成绩、绩点、考试、补考和预警。',
  '权限落点：按课程和考试沉淀教学结果数据。': '权限落点：按当前登录学生过滤本人查询数据。',
  '数据库设计流程总览': '数据库设计流程总览',
  '数据库设计从业务对象推导实体，再落成逻辑表和约束。': '数据库设计从教务业务对象推导实体，再落成逻辑表、视图和约束。',
  '业务对象': '业务对象',
  '课程、班级、学员、考试、成绩等管理对象': '学期、课程、教学班、学生、课表、成绩、考勤、预警等管理对象',
  '实体关系': '实体关系',
  '确认 1:N、N:1 和过程记录关系': '确认一对多、多对多和过程记录关系',
  '逻辑表': '逻辑表',
  '确定表名、字段、类型、默认值和逻辑删除': '确定表名、字段、类型、唯一约束、索引和逻辑删除',
  '约束索引': '约束索引',
  '主键、唯一约束、查询索引和导入防重复': '主键、唯一约束、查询索引和导入防重复',
  '课程表设计流程 I：业务对象到实体关系': '课程表设计流程 I：业务对象到实体关系',
  '课程先作为教学资源实体，再连接考试、成绩和课表。': '课程先作为教学资源实体，再连接教学班、课表和成绩。',
  '课程：教学内容、学科、课时': '课程：课程编码、名称、学分、学时',
  'course 实体': 'course 实体',
  'course_name / subject / duration': 'code / name / credit / hours',
  '考试关联课程': '教学班关联课程',
  '成绩按课程统计': '成绩按课程和教学班统计',
  '课表安排课程': '课表安排课程',
  '为什么单独建 course': '为什么单独建 course',
  '课程会被考试、成绩、课表重复引用，如果只写在成绩表中会造成课程名称重复和维护困难。': '课程会被教学班、课表和成绩重复引用，如果只写在成绩表中会造成课程名称重复和维护困难。',
  '实体边界': '实体边界',
  '课程保存稳定的教学资源信息；考试、成绩、课表保存围绕课程发生的业务记录。': '课程保存稳定的教学资源信息；教学班、成绩、课表保存围绕课程发生的业务记录。',
  '课程表设计流程 II：逻辑表到约束索引': '课程表设计流程 II：逻辑表到约束索引',
  'course 表保留课程基础信息，并通过逻辑删除服务维护。': 'course 表保留课程基础信息，并通过唯一编码、学院关联和逻辑删除维护。',
  '字段（数据类型）': '字段（数据类型）',
  '设计含义': '设计含义',
  '课程主键，自增生成，用于被考试、成绩、课表等业务记录引用。': '课程主键，自增生成，用于被教学班、成绩、课表等业务记录引用。',
  '课程名称，例如 Java基础、Spring Boot企业开发，是页面展示和下拉选择的核心字段。': '课程名称，例如数据库系统、软件工程，是页面展示和下拉选择的核心字段。',
  '课程所属学科方向，1 Java、2 前端、3 大数据、4 Python、5 Go、6 嵌入式。': '课程所属学院和课程性质，支撑课程归类、筛选和统计。',
  '课程课时，表示课程计划时长，为教学安排和课表编排提供参考。': '课程学时，表示课程计划时长，为教学安排和课表编排提供参考。',
  '课程描述，保存课程内容范围和补充说明。': '课程别名或补充说明，保存课程展示名称和扩展信息。',
  '记录课程创建时间，方便追踪基础数据产生时间。': '记录课程创建时间，方便追踪基础数据产生时间。',
  '记录课程最后修改时间，方便维护和排查数据变更。': '记录课程最后修改时间，方便维护和排查数据变更。',
  '逻辑删除标记，0 未删除、1 已删除，删除课程时保留历史引用。': '逻辑删除标记，0 未删除、1 已删除，删除课程时保留历史引用。',
  '其他展示表 ER 图': '其他展示表 ER 图',
  '学员与违纪记录表字段完整展示。': '学生档案与学业预警表字段完整展示。',
  '员工与菜单表字段完整展示。': '系统用户与权限表字段完整展示。',
  '班级与成绩表字段完整展示。': '教学班与成绩表字段完整展示。',
  '后端框架和设计': '后端框架和设计',
  '后端采用 Spring Boot + MyBatis 的 MVC 三层结构。': '后端采用 Spring Boot + Spring Security + MyBatis-Plus 的分层结构。',
  '接收 REST 请求，校验权限，统一返回 Result。': '接收 REST 请求，校验权限，统一返回 ApiResponse。',
  '封装业务逻辑：导入、统计、分页、逻辑删除。': '封装业务逻辑：数据范围、导入导出、统计、分页、逻辑删除。',
  '执行 MyBatis SQL，访问 MySQL 表结构。': '通过 MyBatis-Plus 访问 MySQL 表结构。',
  'tlias.sql 建库建表并提供演示数据。': 'schema.sql、views.sql、data.sql 建库建表、创建视图并提供演示数据。',
  'Spring Boot 3': 'Spring Boot 3.3.7',
  '后端基础框架与接口组织。': '后端基础框架与接口组织。',
  'MyBatis / MP': 'MyBatis-Plus',
  '对象和数据表映射，支持分页与条件查询。': '对象和数据表映射，支持分页与条件查询。',
  'JWT + AOP': 'JWT + Security',
  'Token 登录、接口拦截和角色权限切面。': 'Token 登录、接口拦截、角色权限和数据范围控制。',
  'Knife4j / POI': 'Knife4j / POI',
  '接口文档和 Excel 导入能力。': '接口文档、Excel 模板、导入和导出能力。',
  '前端框架和设计': '前端框架和设计',
  '前端采用 Vue + Axios 的标准管理端开发流程。': '前端采用 React + Axios + TanStack Query 的标准管理端开发流程。',
  'View': 'Pages',
  '页面表格、筛选表单、弹窗、导入按钮，承接具体业务操作。': '页面表格、筛选表单、弹窗、导入导出按钮，承接具体业务操作。',
  'Router': 'React Router',
  '登录后进入 Layout，根据菜单访问学员、课程、成绩等页面。': '登录后进入 AppShell，根据后端菜单访问课表、课程、成绩、考勤等页面。',
  '统一封装请求，携带 Token，集中处理响应和错误提示。': '统一封装请求，携带 Token，集中处理响应和错误提示。',
  'REST API': 'REST API',
  '调用后端资源接口，最终完成数据库读写。': '调用后端资源接口，最终完成数据库读写。',
  'Vue 3': 'React 19',
  '组件化组织管理端页面。': '组件化组织管理端页面。',
  'Pinia': 'AuthProvider',
  '保存用户信息、Token 和菜单状态。': '保存用户信息、Token 和登录状态。',
  'Ant Design Vue': 'Tailwind CSS',
  '提供表格、表单、弹窗和按钮组件。': '配合本地 UI 组件实现表格、表单、弹窗和按钮。',
  'ECharts / XLSX': 'TanStack Query',
  '支撑统计图表、Excel 导入和数据展示。': '管理服务端状态，支撑列表查询、刷新和加载状态。',
  '小组工作总结': '小组工作总结',
  '小组成员与组内分工。': '小组成员与组内分工。',
  '前端页面开发': '前端页面开发',
  '完成主要管理页面、列表表格、表单弹窗和页面交互。': '完成主要管理页面、列表表格、表单弹窗和页面交互。',
  '后端业务实现、接口联调': '后端业务实现、接口联调',
  '完成业务接口、分页查询、导入统计和前后端联调。': '完成业务接口、分页查询、导入导出和前后端联调。',
  '前端功能完善、测试文档': '前端功能完善、测试文档',
  '完善前端细节、整理测试过程和演示材料。': '完善前端细节、整理测试过程和演示材料。',
  '后端开发、数据库设计': '后端开发、数据库设计',
  '设计核心表结构、约束索引，完成部分后端模块。': '设计核心表结构、约束索引和视图，完成部分后端模块。',
  '谢谢观看': '谢谢观看',
  '请老师和同学批评指正': '请老师和同学批评指正',
}));

const phraseReplacements = [
  ['TLIAS 管理系统课程设计报告', 'SmartCampus 通用高校教务系统课程设计报告'],
  ['TLIAS 管理系统', 'SmartCampus 通用高校教务系统'],
  ['TLIAS', 'SmartCampus'],
  ['培训机构教学管理', '高校教务管理'],
  ['培训机构', '高校'],
  ['学员', '学生'],
  ['员工', '用户'],
  ['班主任', '教师'],
  ['讲师', '教师'],
  ['违纪类型', '预警等级'],
  ['违纪记录', '学业预警'],
  ['违纪', '预警'],
  ['班级', '教学班'],
  ['部门', '学院'],
  ['菜单', '权限菜单'],
  ['tlias.sql', 'schema.sql / views.sql / data.sql'],
  ['emp 用户表', 'sys_user 用户表'],
  ['emp 用户', 'sys_user 用户'],
  ['emp', 'sys_user'],
  ['dept', 'college'],
  ['menu', 'sys_permission'],
  ['notice', 'announcement'],
  ['clazz 教学班表', 'teaching_class 教学班表'],
  ['clazz', 'teaching_class'],
  ['student 学生表', 'student_profile 学生档案表'],
  ['student', 'student_profile'],
  ['attendance', 'attendance_record'],
  ['violation_type', 'academic_warning'],
  ['violation', 'academic_warning'],
  ['score 成绩表', 'grade_record 成绩记录表'],
  ['score', 'grade_record'],
  ['exam', 'class_schedule'],
  ['course_name', 'name'],
  ['subject', 'college_id'],
  ['duration', 'hours'],
  ['is_delete', 'deleted'],
  ['Vue + Axios', 'React + Axios'],
  ['Vue', 'React'],
  ['Pinia', 'AuthProvider'],
  ['Ant Design Vue', 'Tailwind CSS'],
];

const tokenReplacementKeys = new Set([
  'emp',
  'dept',
  'menu',
  'notice',
  'clazz',
  'student',
  'attendance',
  'violation_type',
  'violation',
  'score',
  'exam',
  'course_name',
  'subject',
  'duration',
  'is_delete',
  'Vue',
  'Pinia',
]);

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceIdentifier(text, from, to) {
  const pattern = new RegExp(`(^|[^A-Za-z0-9])${escapeRegExp(from)}(?=$|[^A-Za-z0-9])`, 'g');
  return text.replace(pattern, (_, prefix) => `${prefix}${to}`);
}

function normalizeGeneratedText(text) {
  return text
    .replace(/student_profile(?:_profile)+/g, 'student_profile')
    .replace(/attendance_record(?:_record)+/g, 'attendance_record')
    .replace(/teaching_class(?:_class)+/g, 'teaching_class')
    .replace(/academic_warning(?:_warning)+/g, 'academic_warning')
    .replace(/grade_record(?:_record)+/g, 'grade_record')
    .replace(/class_schedule(?:_schedule)+/g, 'class_schedule')
    .replace(/sys_permission(?:_permission)+/g, 'sys_permission')
    .replace(/权限权限菜单/g, '权限菜单')
    .replace(/后端权限菜单访问/g, '后端菜单访问');
}

function rewriteTextNode(text) {
  const trimmed = text.trim();
  if (!trimmed) return text;
  const mapped = directHtmlTextMap.get(trimmed);
  let next = mapped || text;
  phraseReplacements.forEach(([from, to]) => {
    next = tokenReplacementKeys.has(from) ? replaceIdentifier(next, from, to) : next.split(from).join(to);
  });
  next = normalizeGeneratedText(next);
  if (mapped) {
    const prefix = text.match(/^\s*/)?.[0] || '';
    const suffix = text.match(/\s*$/)?.[0] || '';
    return `${prefix}${next}${suffix}`;
  }
  return next;
}

function replaceVisibleTextNodes(html) {
  let output = '';
  let index = 0;
  let skipping = null;
  while (index < html.length) {
    const lt = html.indexOf('<', index);
    if (lt === -1) {
      output += skipping ? html.slice(index) : rewriteTextNode(html.slice(index));
      break;
    }
    if (!skipping) {
      output += rewriteTextNode(html.slice(index, lt));
    } else {
      output += html.slice(index, lt);
    }
    const gt = html.indexOf('>', lt);
    if (gt === -1) {
      output += html.slice(lt);
      break;
    }
    const tag = html.slice(lt, gt + 1);
    output += tag;
    const lowerTag = tag.toLowerCase();
    if (!skipping && /^<\s*(script|style)\b/.test(lowerTag)) {
      skipping = lowerTag.match(/^<\s*(script|style)\b/)[1];
    } else if (skipping && lowerTag.startsWith(`</${skipping}`)) {
      skipping = null;
    }
    index = gt + 1;
  }
  return output;
}

const smartCampusPresentationCss = `
    .deck-header-brand {
      top: 18px;
      left: 32px;
      right: 32px;
    }

    .deck-foot {
      left: 32px;
      right: 32px;
      bottom: 18px;
    }

    .slide {
      padding: 56px 62px 58px 66px;
      overflow: hidden;
    }

    .slide::before {
      left: 24px;
      top: 58px;
      width: 28px;
      height: 28px;
    }

    .slide::after {
      left: 38px;
      top: 94px;
      bottom: 58px;
    }

    .h1 {
      font-size: 48px;
      line-height: 1.06;
    }

    .h2 {
      max-width: 1050px;
      font-size: 30px;
      line-height: 1.14;
    }

    .kicker {
      padding: 3px 9px;
      font-size: 12px;
    }

    .lede {
      max-width: 900px;
      font-size: 18px;
      line-height: 1.45;
    }

    .mt-l {
      margin-top: 22px !important;
    }

    .card {
      padding: 13px 15px;
    }

    .card h4 {
      margin: 0 0 7px;
      font-size: 18px;
    }

    .card p,
    .dim {
      line-height: 1.42;
    }

    .mini-flow {
      gap: 10px;
      margin-top: 16px;
    }

    .mini-step {
      min-height: 84px;
      padding: 11px;
    }

    .mini-step b,
    .schema-line b,
    .entity b {
      font-size: 17px;
    }

    .mini-step span,
    .entity span,
    .schema-line span {
      margin-top: 6px;
      font-size: 13px;
      line-height: 1.36;
    }

    .relation {
      min-height: 280px;
      margin-top: 16px;
    }

    .schema-card {
      margin-top: 16px;
      padding: 16px 18px;
      font-size: 17px;
      line-height: 1.58;
    }

    .schema-list {
      gap: 9px;
      margin-top: 15px;
    }

    .schema-line {
      grid-template-columns: 170px 1fr;
      gap: 12px;
      padding: 11px 14px;
    }

    .compact-table {
      font-size: 13.2px;
      line-height: 1.32;
    }

    .compact-table th,
    .compact-table td {
      padding: 7px 9px;
    }

    .team-table {
      font-size: 12.2px;
    }

    .team-table th,
    .team-table td {
      padding: 7px 7px;
      line-height: 1.28;
    }

    .team-table th:nth-child(1),
    .team-table td:nth-child(1) { width: 118px; }
    .team-table th:nth-child(2),
    .team-table td:nth-child(2) { width: 58px; }
    .team-table th:nth-child(3),
    .team-table td:nth-child(3) { width: 136px; }
    .team-table th:nth-child(4),
    .team-table td:nth-child(4) { width: 78px; }
    .team-table th:nth-child(5),
    .team-table td:nth-child(5) { width: 258px; }

    .section-title-row {
      grid-template-columns: 76px 1fr;
      gap: 14px;
      margin-bottom: 14px;
    }

    .big-sec {
      height: 56px;
      font-size: 26px;
    }

    .content-board {
      margin-top: 14px;
      padding: 14px;
    }

    .split-board {
      gap: 12px;
      margin-top: 14px;
    }

    .split-board > .panel,
    .split-board > .content-board {
      min-height: 246px;
    }

    .screen-placeholder {
      min-height: 180px;
      padding: 14px;
    }

    .one-line {
      font-size: 24px;
    }

    .section-mark {
      font-size: 124px;
    }

    .fact-strip {
      gap: 10px;
      margin-top: 14px;
    }

    .fact {
      padding: 10px 12px;
    }

    .fact b {
      font-size: 20px;
    }

    .fact span {
      margin-top: 5px;
      font-size: 12px;
      line-height: 1.3;
    }

    .dense-list {
      gap: 6px;
      margin-top: 12px;
    }

    .dense-list li {
      padding: 7px 10px;
      font-size: 14.5px;
      line-height: 1.34;
    }

    .evidence-grid {
      gap: 10px;
      margin-top: 12px;
    }

    .evidence {
      padding: 12px 14px;
    }

    .evidence b {
      margin-bottom: 5px;
      font-size: 15.5px;
    }

    .evidence span {
      font-size: 13px;
      line-height: 1.34;
    }

    .code-pill {
      padding: 3px 7px;
      font-size: 11.5px;
      line-height: 1.25;
    }

    .report-frame {
      margin-top: 14px;
      padding: 13px 15px;
    }

    .report-frame h3 {
      margin-bottom: 9px;
      font-size: 18px;
    }

    .mini-matrix {
      gap: 8px;
    }

    .mini-matrix div {
      padding: 9px 10px;
    }

    .mini-matrix b {
      font-size: 13.5px;
    }

    .mini-matrix span {
      font-size: 12px;
      line-height: 1.32;
    }

    .compare-row {
      gap: 10px;
      margin-top: 12px;
    }

    .compare-row .panel {
      padding: 12px 13px;
    }

    .compare-row h4 {
      margin-bottom: 6px;
      font-size: 15px;
    }

    .compare-row p {
      font-size: 13px;
      line-height: 1.32;
    }

    .toc-center {
      min-height: 342px;
      gap: 14px;
      align-content: start;
      margin-top: 18px;
    }

    .toc-item {
      padding: 18px 20px;
    }

    .toc-item h4 {
      margin-bottom: 8px;
      font-size: 20px;
    }

    .toc-item p {
      font-size: 15px;
      line-height: 1.4;
    }

    .split-canvas {
      gap: 18px;
      margin-top: 16px;
    }

    .level-stack {
      gap: 9px;
    }

    .level-item {
      padding: 12px 14px;
      border-left-width: 4px;
    }

    .level-item b {
      margin-bottom: 5px;
      font-size: 16px;
    }

    .level-item span {
      font-size: 13.2px;
      line-height: 1.34;
    }

    .tech-grid {
      gap: 10px;
    }

    .tech-cell {
      padding: 14px;
    }

    .tech-cell h4 {
      margin-bottom: 7px;
      font-size: 17px;
    }

    .tech-cell p {
      font-size: 13.2px;
      line-height: 1.34;
    }

    .image-only-placeholder {
      height: 360px;
      margin-top: 18px;
    }

    .role-solution-grid {
      gap: 12px;
      margin-top: 20px;
    }

    .role-card {
      min-height: 282px;
      padding: 15px 14px;
      grid-template-rows: auto auto auto auto;
      gap: 8px;
    }

    .role-card h3 {
      font-size: 22px;
    }

    .role-card .role-duty {
      font-size: 15px;
      line-height: 1.34;
    }

    .role-card .role-tables {
      gap: 5px;
    }

    .role-card .role-note {
      padding-top: 8px;
      font-size: 12.5px;
      line-height: 1.32;
    }

    .process-board {
      margin-top: 24px;
      padding: 20px 22px;
    }

    .process-flow {
      gap: 14px;
    }

    .process-flow .mini-step {
      min-height: 108px;
      padding: 14px;
    }

    .process-arrow {
      height: 32px;
      margin: 18px 8px 0;
    }

    .process-arrow::before {
      top: 15px;
      height: 3px;
    }

    .process-arrow::after {
      top: 7px;
    }

    .process-arrow span {
      padding: 3px 10px;
      font-size: 12px;
    }

    .course-relation {
      min-height: 272px;
      padding: 22px 24px;
      grid-template-columns: 1fr 70px 1fr 70px 1fr;
    }

    .course-node {
      min-height: 128px;
      padding: 18px 16px;
    }

    .course-node b,
    .course-branch b {
      font-size: 19px;
    }

    .course-node span,
    .course-branch span {
      margin-top: 7px;
      font-size: 13px;
      line-height: 1.34;
    }

    .course-link {
      margin: 0 10px;
    }

    .course-branches {
      gap: 10px;
    }

    .course-branch {
      min-height: 64px;
      padding: 11px 12px;
    }

    .er-slide-grid,
    .er-svg-grid {
      gap: 10px;
      margin-top: 10px;
    }

    .er-card {
      min-height: 370px;
      padding: 11px 12px;
    }

    .er-card h3 {
      font-size: 18px;
    }

    .er-svg-card {
      height: 456px;
      padding: 6px;
    }
`;

function injectBeforeFirstStyleClose(html, css) {
  const styleClose = '</style>';
  const index = html.indexOf(styleClose);
  if (index === -1) return html;
  return `${html.slice(0, index)}\n${css}\n${html.slice(index)}`;
}

function applyPresentationRuntimeFixes(html) {
  let next = injectBeforeFirstStyleClose(html, smartCampusPresentationCss);
  next = next.replace(
    /function setDeckScale\(\) \{\s*const scale = Math\.min\(window\.innerWidth \/ 1280, window\.innerHeight \/ 720\);\s*document\.documentElement\.style\.setProperty\("--deck-scale", String\(scale\)\);\s*\}/,
    'let deckZoom = 1;\n  function setDeckScale() {\n    const fitScale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);\n    const scale = fitScale * deckZoom;\n    document.documentElement.style.setProperty("--deck-scale", String(scale));\n  }'
  );
  next = next.replace(
    /window\.addEventListener\("resize", setDeckScale\);\s*setDeckScale\(\);/,
    '  window.addEventListener("resize", setDeckScale);\n  window.addEventListener("wheel", (event) => {\n    if (!event.ctrlKey && !event.metaKey) return;\n    event.preventDefault();\n    deckZoom = Math.max(0.62, Math.min(1.35, deckZoom + (event.deltaY > 0 ? -0.06 : 0.06)));\n    setDeckScale();\n  }, { passive: false });\n  setDeckScale();'
  );
  next = next.replace(
    /window\.addEventListener\("wheel", \(event\) => \{\s*if \(Math\.abs\(event\.deltaY\) < Math\.abs\(event\.deltaX\) \|\| Math\.abs\(event\.deltaY\) < 24\) return;/,
    'window.addEventListener("wheel", (event) => {\n      if (event.ctrlKey || event.metaKey) return;\n      if (Math.abs(event.deltaY) < Math.abs(event.deltaX) || Math.abs(event.deltaY) < 24) return;'
  );
  return next;
}

function htmlPresentation() {
  const template = fs.existsSync(htmlTemplatePath) ? fs.readFileSync(htmlTemplatePath, 'utf8') : makeFallbackHtml();
  let html = replaceVisibleTextNodes(template);
  html = html.replace(/<title>.*?<\/title>/, '<title>SmartCampus 通用高校教务系统课程设计报告</title>');
  if (!/<link\s+rel=["'](?:icon|shortcut icon)["']/i.test(html)) {
    html = html.replace('</title>', '</title>\n  <link rel="icon" href="data:,">');
  }
  html = html.replace(/data-title="封面"/, 'data-title="封面"');
  html = html.replace(/data-title="痛点与需求"/, 'data-title="痛点与需求"');
  html = html.replace(/data-title="解决方案与三角色设计"/, 'data-title="解决方案与三角色设计"');
  html = html.replace(/data-title="学员与违纪 ER 图"/, 'data-title="学生与预警 ER 图"');
  html = html.replace(/data-title="员工与菜单 ER 图"/, 'data-title="用户与权限 ER 图"');
  html = html.replace(/data-title="班级与成绩 ER 图"/, 'data-title="教学班与成绩 ER 图"');
  html = applyPresentationRuntimeFixes(html);
  html = html.replace(/data-total="14"/g, 'data-total="14"');
  return html;
}

const presentationScriptSections = [
  {
    page: '01',
    title: '封面：SmartCampus 通用高校教务系统',
    time: '约 45 秒',
    script: '各位老师、同学大家好。我们小组本次课程设计的题目是 SmartCampus 通用高校教务系统。这个系统面向高校教务管理场景，不是单纯做一个页面展示，而是围绕用户、课程、教学班、课表、成绩、考勤、学业预警和公告这些真实教务对象，完成一套可以登录、可以按角色使用、可以落到数据库表结构的应用系统。接下来我会按课程设计报告的逻辑进行汇报，重点说明需求分析、数据库设计、应用程序实现和小组分工。'
  },
  {
    page: '02',
    title: '汇报目录',
    time: '约 35 秒',
    script: '本次答辩主要分为四个部分。第一部分是需求分析，说明系统为什么要做，以及管理员、教师、学生三类角色分别要解决什么问题。第二部分是数据库设计，包括设计流程、课程表设计流程、核心 ER 图和约束索引。第三部分是应用程序实现，说明后端分层、前端框架，以及页面操作怎样最终落到数据库。第四部分是小组分工和总结。下面先进入需求分析。'
  },
  {
    page: '03',
    title: '需求分析：实际痛点',
    time: '约 55 秒',
    script: '在需求分析阶段，我们先梳理高校教务场景的实际痛点。第一个问题是数据分散。用户、学院、专业、行政班、课程、教学班、课表、成绩、考勤和预警数据，如果只靠表格或人工记录维护，很容易出现重复录入、字段不统一和查询困难。第二个问题是角色协作弱。管理员、教师、学生关注的数据完全不同，如果没有统一权限边界，同一套数据很难保证既能共享又能隔离。第三个问题是过程追踪难。成绩、考勤、课表和预警都属于过程数据，如果不结构化保存，后续统计、查询和追溯成本会很高。所以本系统的核心需求是可维护、可查询、可统计、可导入导出，并且能够按角色和数据范围控制访问。'
  },
  {
    page: '04',
    title: '需求分析：拟解决方案',
    time: '约 60 秒',
    script: '针对这些问题，我们的解决方案不是简单堆功能菜单，而是先按角色划分业务边界，再把功能落到数据库表和接口。管理员负责用户、角色、权限、公告、系统配置和基础教务数据管理，对应 sys_user、college、sys_permission、announcement 等表。教师负责本人教学班的课表、成绩、考勤和学业预警，核心数据落在 teaching_class、student_profile、attendance_record、academic_warning 等表。学生主要是只读查询，查看本人课程、课表、校历、成绩、绩点、考试、补考和预警，所有查询都要按当前登录学生过滤。这样做的好处是，每类用户看到的功能和数据范围都清楚，后续数据库设计也有明确依据。'
  },
  {
    page: '05',
    title: '数据库设计流程总览',
    time: '约 45 秒',
    script: '数据库设计部分，我们遵循从业务对象到实体关系，再到逻辑表和约束索引的流程。第一步是识别业务对象，例如学期、课程、教学班、学生、课表、成绩、考勤和预警。第二步是确认实体关系，包括一对多、多对多以及过程记录关系。第三步是落成逻辑表，确定表名、字段、类型、唯一约束、索引和逻辑删除字段。第四步是补充约束索引，保证主键稳定、业务唯一、防止导入重复，并提高高频查询效率。下面用 course 课程表作为例子，展示从业务对象到表结构的设计过程。'
  },
  {
    page: '06',
    title: '课程表设计流程 I：业务对象到实体关系',
    time: '约 50 秒',
    script: '以课程为例，课程首先是一个稳定的教学资源实体，它包含课程编码、课程名称、学分、学时等基础属性。课程不能只写在成绩表或课表记录里，因为同一门课程会被教学班、课表和成绩多次引用。如果到处重复保存课程名称，后期改名、统计和筛选都会变得困难。因此我们单独建立 course 实体，再让教学班、课表和成绩等业务记录通过 course_id 或相关逻辑关系引用课程。这样课程保存稳定信息，业务记录保存围绕课程发生的过程数据，实体边界比较清晰。'
  },
  {
    page: '07',
    title: '课程表设计流程 II：逻辑表到约束索引',
    time: '约 55 秒',
    script: '落到逻辑表后，course 表保存课程基础信息。id 作为课程主键，用于被教学班、成绩和课表等记录引用。name 保存课程名称，是页面展示和下拉选择的核心字段。college_id 用于表示课程所属学院或课程归类，便于后续筛选和统计。hours 表示课程学时，为教学安排和课表编排提供依据。description 保存课程别名或补充说明。create_time 和 update_time 用于记录数据创建和修改时间。deleted 是逻辑删除标记，删除课程时不直接物理删除，避免影响历史成绩、课表和教学班记录。'
  },
  {
    page: '08',
    title: '学生与预警 ER 图',
    time: '约 55 秒',
    script: '接下来展示 ER 图补充。第八页是学生档案和学业预警。student_profile 表保存学生身份和学籍相关信息，包括用户关联、学号、专业、行政班、班级名称和入学年级等内容，是学生查询、成绩、考勤和预警的基础。academic_warning 表保存预警等级、原因、状态和生成时间，用于记录低成绩、挂科、旷课、迟到早退等风险。两张表之间的关系体现了学生到预警的一对多结构，一个学生可能在不同课程或不同时间产生多条预警记录。这样设计后，教师和管理员可以追踪风险来源，学生端也可以只查看本人预警。'
  },
  {
    page: '09',
    title: '用户与权限 ER 图',
    time: '约 55 秒',
    script: '第九页展示系统用户和权限。sys_user 是登录认证和用户身份的核心表，保存用户名、密码哈希、真实姓名、用户类型、邮箱、微信绑定状态和登录时间等字段。sys_role 保存 ADMIN、TEACHER、STUDENT 等角色，sys_permission 保存权限码、菜单路径和角色绑定。系统登录后由后端根据用户角色返回菜单和权限信息，前端再根据这些信息渲染可访问页面。这样管理员可以看到后台配置入口，教师只能访问本人教学班相关数据，学生只能访问本人查询服务。用户权限表的设计重点是保证角色边界清楚、菜单可控、接口鉴权可追踪。'
  },
  {
    page: '10',
    title: '教学班与成绩 ER 图',
    time: '约 55 秒',
    script: '第十页展示教学班和成绩相关设计。teaching_class 是教务运行中的关键实体，它把学期、课程、教师和学生名单组织在一起。教学班学生表保存教学班与学生之间的多对多关系。grade_record 成绩记录表则按教学班和学生保存平时分、期末分、总评和备注，其中总评按照平时分百分之四十加期末分百分之六十计算。这样设计后，教师可以按本人教学班录入成绩，管理员可以做全量维护，学生可以查询本人课程成绩。同时唯一约束可以避免同一教学班同一学生重复出现多条成绩记录。'
  },
  {
    page: '11',
    title: '后端框架和设计',
    time: '约 55 秒',
    script: '应用程序实现方面，后端采用 Spring Boot 3.3.7、Spring Security 和 MyBatis-Plus 的分层结构。Controller 层负责接收 REST 请求、校验权限入口，并统一返回 ApiResponse。Service 层封装核心业务逻辑，包括数据范围控制、导入导出、分页查询、统计计算和逻辑删除。Mapper 层通过 MyBatis-Plus 访问 MySQL 表结构。数据库脚本拆分为 schema.sql、views.sql 和 data.sql，分别负责建表、创建视图和初始化演示数据。除此之外，系统使用 JWT 完成登录和接口拦截，使用 Knife4j 提供接口文档，使用 Apache POI 支持 Excel 模板、导入和导出。'
  },
  {
    page: '12',
    title: '前端框架和设计',
    time: '约 50 秒',
    script: '前端采用 React、Axios 和 TanStack Query 的管理端开发流程。页面层负责表格、筛选表单、弹窗、导入导出按钮和具体交互。React Router 负责登录后的页面路由，AppShell 根据后端返回的菜单渲染侧边栏。Axios 统一封装请求，自动携带 Token，并集中处理响应和错误提示。TanStack Query 管理服务端状态，支撑列表查询、刷新和加载状态。前端本身不直接操作数据库，而是通过 REST API 调用后端接口，后端完成权限校验和数据库读写，最后把结果返回页面展示。'
  },
  {
    page: '13',
    title: '小组成员与组内分工',
    time: '约 45 秒',
    script: '最后说明小组分工。陈志杰主要负责前端页面开发，完成管理页面、列表表格、表单弹窗和页面交互。段瑞主要负责后端业务实现和接口联调，完成业务接口、分页查询、导入导出和前后端联调。贺宇轩负责前端功能完善和测试文档，整理测试过程和演示材料。胡衍科负责后端开发和数据库设计，设计核心表结构、约束索引和视图，并参与部分后端模块实现。整个过程中，我们围绕同一套数据库字段和接口参数协作，保证前端页面、后端接口和数据库结构能够对应起来。'
  },
  {
    page: '14',
    title: '结束页',
    time: '约 20 秒',
    script: '以上就是我们小组关于 SmartCampus 通用高校教务系统的课程设计汇报。总结来说，本项目完成了从需求分析、数据库设计到前后端应用实现的闭环，核心重点是角色边界清楚、数据结构可维护、业务流程可以落到数据库。我的汇报到此结束，请老师和同学批评指正，谢谢大家。'
  },
];

function presentationScriptMarkdown() {
  const lines = [
    '# SmartCampus 通用高校教务系统 14 页 PPT 答辩逐字稿',
    '',
    '建议总时长：约 10 分钟。',
    '使用方式：按页切换 PPT 时照读“逐字稿”段落，可根据现场提问适当压缩或展开。',
    '',
  ];
  presentationScriptSections.forEach((item) => {
    lines.push(`## 第 ${item.page} 页 ${item.title}`);
    lines.push(`建议时长：${item.time}`);
    lines.push('');
    lines.push(item.script);
    lines.push('');
  });
  return lines.join('\n');
}

function presentationScriptDoc() {
  const children = [
    para('SmartCampus 通用高校教务系统 14 页 PPT 答辩逐字稿', {
      align: AlignmentType.CENTER,
      size: 32,
      bold: true,
      font: '黑体',
      before: 260,
      after: 160,
    }),
    para('建议总时长：约 10 分钟。按页切换 PPT 时照读逐字稿，可根据现场情况微调语速。', {
      align: AlignmentType.CENTER,
      before: 80,
      after: 260,
    }),
  ];
  presentationScriptSections.forEach((item, index) => {
    if (index > 0) children.push(pageBreak());
    children.push(h1(`第 ${item.page} 页 ${item.title}`));
    children.push(para(`建议时长：${item.time}`, { bold: true, color: '0F766E' }));
    children.push(para(item.script, { line: 360 }));
  });
  return baseDoc(children);
}

async function main() {
  copyDirectory(htmlTemplateAssetsDir, path.join(outDir, 'html-ppt-assets'));
  fs.writeFileSync(path.join(outDir, 'SmartCampus-defense-presentation.html'), htmlPresentation(), 'utf8');
  fs.writeFileSync(path.join(outDir, '24软工3班陈志杰数据库作业需求分析文档.docx'), await Packer.toBuffer(requirementDoc()));
  fs.writeFileSync(path.join(outDir, '应用系统设计阶段概要设计与详细设计文档.docx'), await Packer.toBuffer(designDoc()));
  fs.writeFileSync(path.join(outDir, 'SmartCampus-14页PPT答辩逐字稿-10分钟.md'), presentationScriptMarkdown(), 'utf8');
  fs.writeFileSync(path.join(outDir, 'SmartCampus-14页PPT答辩逐字稿-10分钟.docx'), await Packer.toBuffer(presentationScriptDoc()));
  console.log(outDir);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
