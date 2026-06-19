const fs = require('fs');
const path = require('path');
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  ShadingType,
  LevelFormat,
} = require('docx');

const root = path.resolve(__dirname, '..', '..');
const outDir = path.join(root, 'docs', 'deliverables');
fs.mkdirSync(outDir, { recursive: true });

const members = [
  ['202425220304', '陈志杰', '前端页面开发、答辩材料整理', '25%'],
  ['202425220306', '段瑞', '后端业务实现、接口联调', '25%'],
  ['202425220307', '贺宇轩', '前端功能完善、测试文档', '20%'],
  ['202425220308', '胡衍科', '后端开发、数据库设计', '30%'],
];

const roles = [
  ['管理员', '维护学期、课程、教学班、学生名单、成绩、考勤、学业预警；查看全量仪表盘。'],
  ['教师', '维护本人负责教学班的成绩、考勤和预警；查看本人教学班数据。'],
  ['学生', '只读查看本人课程、成绩、考勤和预警。'],
];

const modules = [
  ['M01', '登录认证', '用户名密码登录、BCrypt 校验、JWT 签发、当前用户信息、退出。'],
  ['M02', '学期管理', '新增、查询、修改、软删除学期，支持当前学期标识。'],
  ['M03', '课程管理', '维护课程编码、名称、学分、学时。'],
  ['M04', '教学班管理', '按学期、课程、教师建立教学班，维护容量和班级编码。'],
  ['M05', '学生名单管理', '将学生加入教学班名单，形成后续成绩和考勤的业务范围。'],
  ['M06', '成绩管理', '维护平时分、期末分，总评按 40% + 60% 自动计算。'],
  ['M07', '考勤管理', '记录正常、迟到、早退、请假、旷课五类状态。'],
  ['M08', '学业预警', '根据低成绩、挂科、旷课、迟到早退生成低/中/高风险。'],
  ['M09', '学生端只读', '我的课程、我的成绩、我的考勤、我的预警。'],
  ['M10', '首页仪表盘', '教学班数量、学生数量、今日考勤异常、高风险学生、最近预警。'],
];

const tables = [
  ['sys_user', '系统账号表', 'id', 'uk_sys_user_username；idx_sys_user_type', '统一账号、用户类型、BCrypt 密码哈希。'],
  ['sys_role', '角色表', 'id', 'uk_sys_role_code', '管理员、教师、学生及数据范围。'],
  ['sys_permission', '权限表', 'id', 'uk_sys_permission_code_role；idx_sys_permission_role', '权限码、菜单路径和角色绑定。'],
  ['sys_user_role', '用户角色表', 'id', 'uk_sys_user_role；idx_user/role', '账号与角色逻辑关联。'],
  ['semester', '学期表', 'id', 'uk_semester_name；idx_semester_current', '学期名称、起止日期、当前学期。'],
  ['course', '课程表', 'id', 'uk_course_code；idx_course_name', '课程编码、学分、学时。'],
  ['teacher_profile', '教师档案表', 'id', 'uk_teacher_user；uk_teacher_no', '教师工号、院系、职称。'],
  ['student_profile', '学生档案表', 'id', 'uk_student_user；uk_student_no', '学号、专业、行政班、年级。'],
  ['teaching_class', '教学班表', 'id', 'uk_teaching_class_code；idx_semester/course/teacher', '学期、课程、教师组成教学班。'],
  ['teaching_class_student', '教学班学生表', 'id', 'uk_class_student；idx_class/student', '教学班与学生名单。'],
  ['grade_record', '成绩记录表', 'id', 'uk_grade_class_student；idx_grade_total', '平时分、期末分、总评。'],
  ['attendance_record', '考勤记录表', 'id', 'uk_attendance_once；idx_status/date', '按教学班、学生、日期记录考勤。'],
  ['academic_warning', '学业预警表', 'id', 'idx_warning_student/class/level/status', '预警等级、原因、状态、生成时间。'],
];

const dataDictionary = [
  ['用户名', '1-64 位字符，唯一，建议使用工号/学号或管理员账号', '登录认证、权限识别'],
  ['密码', '用户输入明文只用于登录传输，数据库保存 BCrypt 哈希', '账号安全'],
  ['学号', '建议 8-32 位，可包含年份、专业和序号，系统字段预留 64 位', '学生档案、名单、成绩、考勤'],
  ['教师工号', '建议 T + 年份 + 序号，系统字段预留 64 位', '教师档案、教学班分配'],
  ['课程编码', '建议学院/课程编号组合，唯一，系统字段预留 64 位', '课程管理、教学班管理'],
  ['教学班编码', '课程编码 + 学期 + 班号，唯一，系统字段预留 64 位', '教学闭环主线'],
  ['平时分', '0-100，保留两位小数', '成绩管理'],
  ['期末分', '0-100，保留两位小数', '成绩管理'],
  ['总评', '平时分 * 40% + 期末分 * 60%，保留两位小数', '成绩统计、学业预警'],
  ['考勤状态', 'NORMAL、LATE、EARLY_LEAVE、LEAVE、ABSENT', '考勤管理、预警计算'],
  ['预警等级', 'LOW、MEDIUM、HIGH', '学业预警'],
];

function tr(text, opts = {}) {
  return new TextRun({ text, font: '宋体', size: opts.size ?? 24, bold: opts.bold, color: opts.color });
}

function p(text, opts = {}) {
  return new Paragraph({
    heading: opts.heading,
    alignment: opts.align,
    spacing: { before: opts.before ?? 80, after: opts.after ?? 80, line: 360 },
    numbering: opts.numbering,
    children: [tr(text, opts)],
  });
}

function pageBreak() {
  return new Paragraph({ children: [new TextRun({ break: 1 })] });
}

function cell(text, width, shaded = false) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 90, bottom: 90, left: 120, right: 120 },
    shading: shaded ? { fill: 'E8F3F0', type: ShadingType.CLEAR } : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    },
    children: [p(String(text), { before: 0, after: 0 })],
  });
}

function table(headers, rows, widths) {
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ children: headers.map((h, i) => cell(h, widths[i], true)) }),
      ...rows.map((row) => new TableRow({ children: row.map((v, i) => cell(v, widths[i])) })),
    ],
  });
}

function baseDoc(children) {
  return new Document({
    styles: {
      default: { document: { run: { font: '宋体', size: 24 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: '黑体', size: 32, bold: true }, paragraph: { spacing: { before: 260, after: 180 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: '黑体', size: 28, bold: true }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 } },
      ],
    },
    numbering: {
      config: [
        { reference: 'bullet', levels: [{ level: 0, format: LevelFormat.BULLET, text: '●', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 480, hanging: 240 } } } }] },
      ],
    },
    sections: [{
      properties: { page: { margin: { top: 1200, right: 1000, bottom: 1000, left: 1000 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [tr('第 '), new TextRun({ children: [PageNumber.CURRENT], font: '宋体', size: 20 }), tr(' 页', { size: 20 })] })] }) },
      children,
    }],
  });
}

function cover(title, subtitle) {
  return [
    p('华南农业大学课程设计文档', { align: AlignmentType.CENTER, size: 32, bold: true, before: 1200 }),
    p(title, { align: AlignmentType.CENTER, size: 40, bold: true, color: '0F766E', before: 500, after: 260 }),
    p(subtitle, { align: AlignmentType.CENTER, size: 28 }),
    p('项目名称：SmartCampus 通用高校教务系统', { align: AlignmentType.CENTER, before: 500 }),
    p('课程名称：数据库系统', { align: AlignmentType.CENTER }),
    p('班级：24 软件工程 3 班', { align: AlignmentType.CENTER }),
    p('项目经理：陈志杰', { align: AlignmentType.CENTER }),
    p('小组成员：陈志杰、段瑞、贺宇轩、胡衍科', { align: AlignmentType.CENTER }),
    p('日期：2026 年 6 月', { align: AlignmentType.CENTER }),
    pageBreak(),
  ];
}

function requirementDoc() {
  const children = [
    ...cover('24软工3班陈志杰数据库作业需求分析文档', 'SmartCampus 设计方案之需求分析'),
    p('文档信息', { heading: HeadingLevel.HEADING_1 }),
    table(['项目', '内容'], [
      ['项目名称', 'SmartCampus 通用高校教务系统'],
      ['项目经理', '陈志杰'],
      ['文档编号', 'SMARTCAMPUS-REQ-001'],
      ['密级', '内部交流'],
      ['文档标题', 'SmartCampus 设计方案之需求分析'],
      ['版本', 'V1.0.0'],
    ], [2200, 6800]),
    p('版本记录', { heading: HeadingLevel.HEADING_2 }),
    table(['日期', '作者', '版本', '变更说明'], [
      ['2026-06-20', '陈志杰、段瑞、贺宇轩、胡衍科', 'V1.0.0', '根据 SmartCampus v1 范围完成需求分析、用例和数据字典。'],
    ], [1800, 3000, 1400, 2800]),
    p('1 引言', { heading: HeadingLevel.HEADING_1 }),
    p('1.1 编写目的', { heading: HeadingLevel.HEADING_2 }),
    p('本文档用于说明 SmartCampus 通用高校教务系统的需求范围、用户角色、功能需求、非功能需求、运行环境和需求跟踪关系，为后续数据库设计、后端实现、前端页面开发、测试验收和课程答辩提供依据。'),
    p('1.2 背景', { heading: HeadingLevel.HEADING_2 }),
    p('SmartCampus 面向高校教务场景。系统以学期、课程、教学班、学生名单、成绩、考勤和学业预警为主线，解决高校教学过程数据分散、教师维护成本高、学生学习风险发现滞后的问题。'),
    p('1.3 用户特点', { heading: HeadingLevel.HEADING_2 }),
    table(['用户', '特点'], roles, [1600, 7400]),
    p('1.4 假定与约束', { heading: HeadingLevel.HEADING_2 }),
    ...['系统采用 B/S 架构，用户通过现代浏览器访问。', '后端使用 Java 17、Spring Boot、Spring Security、MyBatis-Plus 和 MySQL。', '前端使用 React、TypeScript、Vite、Tailwind、React Router、Axios 和 TanStack Query。', 'v1 不做学生选课/退课、请假审批流、排课冲突检测、OSS 上传和微服务。', '数据库不使用强外键，采用逻辑外键、索引和 Service 层校验。'].map((x) => p(x, { numbering: { reference: 'bullet', level: 0 } })),
    p('1.5 参考资料', { heading: HeadingLevel.HEADING_2 }),
    ...['《2026数据库课程设计任务书》', '《需求分析文档模板.doc》', 'SmartCampus 当前源码与 SQL 脚本', 'Spring Boot、Spring Security、MyBatis-Plus、MySQL、React、Vite 官方文档'].map((x) => p(x, { numbering: { reference: 'bullet', level: 0 } })),
    p('1.6 术语定义及说明', { heading: HeadingLevel.HEADING_2 }),
    table(['术语', '说明'], [
      ['教学班', '某一学期中由一门课程、一名任课教师和一组学生组成的教学组织。'],
      ['教学闭环', '学期 -> 课程 -> 教学班 -> 学生名单 -> 成绩 -> 考勤 -> 预警的完整业务链路。'],
      ['学业预警', '系统根据成绩和考勤异常生成 LOW、MEDIUM、HIGH 风险等级。'],
      ['数据范围', '后端根据角色限制可访问数据：管理员全量、教师本人教学班、学生本人数据。'],
    ], [2200, 6800]),
    p('2 功能需求', { heading: HeadingLevel.HEADING_1 }),
    p('2.1 系统范围', { heading: HeadingLevel.HEADING_2 }),
    p('系统覆盖高校教务 v1 的核心流程：登录、学期管理、课程管理、教学班管理、教学班学生名单管理、成绩管理、考勤管理、学业预警、学生端只读和首页仪表盘。系统暂不覆盖复杂排课、在线选课、审批流、资源上传和多校区集团管理。'),
    p('2.2 系统功能结构', { heading: HeadingLevel.HEADING_2 }),
    table(['编号', '模块', '功能说明'], modules, [900, 1800, 6300]),
    p('2.3 系统总体流程', { heading: HeadingLevel.HEADING_2 }),
    p('管理员先维护学期和课程，再创建教学班并维护学生名单；教师进入本人教学班录入成绩和考勤；系统按固定规则生成学业预警；学生登录后只读查看本人课程、成绩、考勤和预警；首页根据角色展示对应范围内的统计数据。'),
    p('2.4 需求分析', { heading: HeadingLevel.HEADING_2 }),
    ...useCaseParagraphs(),
    p('2.5 数据字典', { heading: HeadingLevel.HEADING_2 }),
    table(['数据项', '用户视角结构要求', '来源需求'], dataDictionary, [1900, 4700, 2400]),
    p('3 非功能需求', { heading: HeadingLevel.HEADING_1 }),
    table(['类别', '要求'], [
      ['性能', '常规列表查询响应时间建议不超过 2 秒，分页接口统一 page/size/keyword 参数，单页最大 200 条。'],
      ['安全', '密码不得明文入库，使用 BCrypt；JWT 只保存必要身份信息；权限以后端为准。'],
      ['可靠性', '关键写入记录 create_time、update_time、deleted；删除优先软删除。'],
      ['可维护性', '后端按 Controller、Service、Mapper、Domain、DTO、VO、Config、Security、Exception 分层；前端按 pages、components、api、types、hooks、router/lib 分层。'],
      ['可扩展性', '权限码和数据范围可扩展；预警规则 v1 固定，后续可演进为策略配置。'],
    ], [1800, 7200]),
    p('4 运行环境规定', { heading: HeadingLevel.HEADING_1 }),
    table(['项目', '规定'], [
      ['服务器', 'JDK 17、Maven 3.9+、MySQL 8、Windows/Linux 均可部署。'],
      ['客户端', 'Chrome、Edge 等现代浏览器，建议 1366x768 以上分辨率。'],
      ['接口', '前后端通过 HTTP/HTTPS JSON API 通信，统一响应结构为 {code,message,data}。'],
      ['控制', '后端通过 Maven/Spring Boot 启动；前端通过 Vite 开发服务器或构建静态资源部署。'],
    ], [1800, 7200]),
    p('5 需求跟踪', { heading: HeadingLevel.HEADING_1 }),
    table(['需求编号', '需求名称', '实现位置'], modules.map((m) => [m[0], m[1], '后端 /api 接口、前端对应页面、SQL 表和视图']), [1400, 2400, 5200]),
    p('6 签批单', { heading: HeadingLevel.HEADING_1 }),
    p('执行主管：陈志杰    技术主管：胡衍科'),
    p('项目组长：陈志杰    用户代表：贺宇轩'),
    p('开发人员代表：段瑞    小组成员：陈志杰、段瑞、贺宇轩、胡衍科'),
  ];
  return baseDoc(children);
}

function useCaseParagraphs() {
  const children = [];
  const cases = [
    ['UC-001', '登录认证', '管理员、教师、学生', '用户输入用户名和密码，系统校验 BCrypt 密码哈希，成功后签发 JWT。', '账号存在且状态正常。', '成功进入系统；失败提示用户名或密码错误。'],
    ['UC-002', '管理员配置教学闭环', '管理员', '管理员维护学期、课程、教学班和学生名单，形成教学运行基础数据。', '管理员已登录并具有管理权限。', '教学班具备学期、课程、教师和学生名单。'],
    ['UC-003', '教师维护成绩', '教师', '教师在本人教学班范围内录入平时分和期末分，系统计算总评。', '教师负责该教学班，学生已在名单中。', 'grade_record 写入或更新，总评公式正确。'],
    ['UC-004', '教师维护考勤', '教师', '教师在本人教学班范围内记录学生每日考勤状态。', '教师负责该教学班，学生已在名单中。', 'attendance_record 写入或更新，同一学生同一天同一教学班不重复。'],
    ['UC-005', '生成学业预警', '管理员、教师', '系统按低成绩、挂科、旷课、迟到早退规则生成预警记录。', '成绩或考勤数据已存在。', 'academic_warning 生成 LOW/MEDIUM/HIGH 风险。'],
    ['UC-006', '学生查看本人数据', '学生', '学生只读查看本人课程、成绩、考勤和预警。', '学生已登录并有学生档案。', '只能返回本人数据，直接调用他人数据被后端拒绝或过滤。'],
  ];
  cases.forEach((c) => {
    children.push(p(c[1], { heading: HeadingLevel.HEADING_2 }));
    children.push(table(['描述对象', '描述内容'], [
      ['标识符', c[0]],
      ['参与者', c[2]],
      ['说明', c[3]],
      ['前置条件', c[4]],
      ['后置条件', c[5]],
      ['基本流程', '登录或进入页面 -> 填写/选择业务数据 -> 前端提交 API -> 后端鉴权和数据范围校验 -> Service 校验逻辑外键和业务规则 -> Mapper 写入或查询 MySQL -> 返回统一响应。'],
      ['异常流程', '未登录返回 401；无权限返回 403；参数不合法或关联数据不存在返回业务错误。'],
      ['用户界面', '后台管理风格，表格 + 表单 + 明确操作按钮；学生端为只读表格。'],
    ], [1800, 7200]));
  });
  return children;
}

function designDoc() {
  const children = [
    p('华南农业大学课程设计报告', { align: AlignmentType.CENTER, size: 36, bold: true, before: 800 }),
    p('实验项目名称：数据库分析与设计实习', { align: AlignmentType.CENTER }),
    p('实验项目性质：课程设计', { align: AlignmentType.CENTER }),
    p('计划学时：2周', { align: AlignmentType.CENTER }),
    p('所属课程名称：数据库系统', { align: AlignmentType.CENTER }),
    p('开设时间：2025-2026学年第2学期', { align: AlignmentType.CENTER }),
    p('授课学生：24软件工程3班', { align: AlignmentType.CENTER }),
    p('实验课指导教师：郭玉彬', { align: AlignmentType.CENTER }),
    pageBreak(),
    p('华南农业大学信息学院数据库分析与设计实习成绩单', { heading: HeadingLevel.HEADING_1, align: AlignmentType.CENTER }),
    table(['学号', '姓名', '分工', '工作量比例'], members, [1800, 1600, 4300, 1300]),
    p('实验题目：SmartCampus 通用高校教务系统', { before: 260 }),
    pageBreak(),
    p('数据库系统课程设计说明书', { heading: HeadingLevel.HEADING_1 }),
    p('1 引言', { heading: HeadingLevel.HEADING_1 }),
    p('1.1 编写目的', { heading: HeadingLevel.HEADING_2 }),
    p('本文档用于交付 SmartCampus 在应用系统设计阶段的概要设计与详细设计成果，说明系统架构、模块划分、数据库设计、接口实现、界面设计和安装使用方式。'),
    p('1.2 定义', { heading: HeadingLevel.HEADING_2 }),
    table(['术语', '说明'], [
      ['B/S 架构', '浏览器/服务器架构，前端通过浏览器访问，后端处理业务并访问数据库。'],
      ['RBAC + 数据范围', '角色权限控制和数据范围控制组合，防止越权访问。'],
      ['逻辑外键', '数据库不建立强外键，通过索引和 Service 层校验维护引用一致性。'],
      ['外模式', '面向页面或报表的数据组织方式，本系统以视图和接口组合提供。'],
    ], [2200, 6800]),
    p('2 功能需求', { heading: HeadingLevel.HEADING_1 }),
    p('2.1 系统范围', { heading: HeadingLevel.HEADING_2 }),
    p('SmartCampus 是通用高校教务系统，核心用户为管理员、教师、学生，主线为教学闭环和学业预警。系统围绕学期、课程、教学班、学生名单、成绩、考勤和学业风险管理展开。'),
    p('2.2 系统功能结构', { heading: HeadingLevel.HEADING_2 }),
    table(['编号', '模块', '说明'], modules, [900, 1800, 6300]),
    p('2.3 系统总体流程', { heading: HeadingLevel.HEADING_2 }),
    p('管理员配置基础教务数据；教师维护本人教学班成绩和考勤；预警模块按规则生成风险；学生只读查看本人数据；仪表盘按角色展示统计。'),
    p('3 数据库设计', { heading: HeadingLevel.HEADING_1 }),
    p('3.1 概念结构设计', { heading: HeadingLevel.HEADING_2 }),
    p('核心实体包括用户、角色、权限、学期、课程、教师档案、学生档案、教学班、教学班学生名单、成绩记录、考勤记录和学业预警。学期与教学班是一对多，课程与教学班是一对多，教师与教学班是一对多，教学班与学生通过教学班学生名单形成多对多，成绩和考勤依赖教学班与学生组合，预警由成绩和考勤推导。'),
    p('ER 关系文字图：sys_user -> teacher_profile/student_profile；semester + course + teacher_profile -> teaching_class；teaching_class + student_profile -> teaching_class_student；teaching_class_student -> grade_record / attendance_record -> academic_warning。'),
    p('3.2 逻辑结构设计', { heading: HeadingLevel.HEADING_2 }),
    table(['联系', '类型', '关系数据库转换'], [
      ['用户-角色', '多对多', 'sys_user_role 保存 user_id、role_id。'],
      ['用户-教师档案', '一对一', 'teacher_profile.user_id 逻辑关联 sys_user.id。'],
      ['用户-学生档案', '一对一', 'student_profile.user_id 逻辑关联 sys_user.id。'],
      ['学期-教学班', '一对多', 'teaching_class.semester_id 逻辑关联 semester.id。'],
      ['课程-教学班', '一对多', 'teaching_class.course_id 逻辑关联 course.id。'],
      ['教师-教学班', '一对多', 'teaching_class.teacher_id 逻辑关联 teacher_profile.id。'],
      ['教学班-学生', '多对多', 'teaching_class_student 保存 teaching_class_id、student_id。'],
      ['教学班/学生-成绩', '一对一业务记录', 'grade_record 对 teaching_class_id + student_id 建唯一约束。'],
      ['教学班/学生/日期-考勤', '一对一业务记录', 'attendance_record 对 teaching_class_id + student_id + attendance_date 建唯一约束。'],
    ], [2200, 2000, 4800]),
    p('3.3 数据库模式设计', { heading: HeadingLevel.HEADING_2 }),
    table(['英文表名', '中文表名', '主键', '主要索引或约束', '说明'], tables, [1800, 1800, 900, 2600, 1900]),
    p('3.4 外模式设计', { heading: HeadingLevel.HEADING_2 }),
    table(['外模式', '来源表', '用途'], [
      ['v_student_learning_summary', 'student_profile、sys_user、teaching_class_student、grade_record、attendance_record', '学生学习概览、平均分、挂科数、异常考勤数。'],
      ['v_teaching_class_grade_stat', 'teaching_class、course、grade_record', '教学班成绩统计，包含平均分、最高分、最低分和挂科数。'],
      ['v_academic_warning_source', 'teaching_class_student、grade_record、attendance_record', '预警规则计算来源数据。'],
    ], [2500, 4000, 2500]),
    p('3.5 物理结构设计', { heading: HeadingLevel.HEADING_2 }),
    p('数据库使用 MySQL 8、InnoDB、utf8mb4 字符集。主键使用 BIGINT AUTO_INCREMENT，常用查询字段建立普通索引，业务唯一性使用 unique 约束。逻辑删除字段 deleted 支持演示数据重置和后续审计。预计 attendance_record.remark 空值率 60%-80%，academic_warning.teaching_class_id 在全局预警场景可为空但 v1 主要有值，教师 title 空值率约 30%-50%。'),
    p('3.6 编程性结构设计', { heading: HeadingLevel.HEADING_2 }),
    p('v1 未使用触发器和存储过程。成绩总评和预警规则在 Service 层实现，原因是便于结合角色数据范围、单元测试和后续规则扩展。数据库端已提供三个视图支持统计和预警来源分析。'),
    p('4 系统设计与实现', { heading: HeadingLevel.HEADING_1 }),
    p('4.1 开发环境', { heading: HeadingLevel.HEADING_2 }),
    table(['类别', '选择', '说明'], [
      ['后端语言', 'Java 17', '适合企业级 Web 后端。'],
      ['后端框架', 'Spring Boot、Spring Security、MyBatis-Plus', '实现 REST、鉴权和数据库访问。'],
      ['数据库', 'MySQL 8', '保存结构化教务数据，支持索引和视图。'],
      ['前端语言', 'TypeScript', '提高前端类型安全。'],
      ['前端框架', 'React、Vite、Tailwind、TanStack Query', '实现后台管理界面和 API 状态管理。'],
      ['接口文档', 'Knife4j/OpenAPI', '用于接口调试和说明。'],
    ], [1800, 3300, 3900]),
    p('4.2 整体结构', { heading: HeadingLevel.HEADING_2 }),
    p('后端目录 backend 按 Controller、Service、Mapper、Domain/Entity、DTO、VO、Config、Security、Exception 分层组织。前端目录 frontend 按 pages、components、api、types、hooks、lib 分层组织。SQL 脚本位于 sql/schema.sql、sql/views.sql、sql/data.sql。'),
    p('4.3 设计与实现技术', { heading: HeadingLevel.HEADING_2 }),
    p('Controller 负责接收请求和权限码校验，Service 负责业务规则、逻辑外键校验和数据范围校验，Mapper 通过 MyBatis-Plus 操作数据库。前端通过 Axios 封装统一请求，通过 TanStack Query 管理服务端状态，通过后端返回菜单控制页面显示。'),
    p('4.4 系统界面设计', { heading: HeadingLevel.HEADING_2 }),
    p('界面采用后台工作台风格。左侧为后端菜单驱动导航，顶部显示当前用户与退出按钮，主区以表格、表单和统计卡片为主。管理员页面强调配置效率；教师页面强调成绩和考勤录入；学生页面只读，减少误操作。'),
    p('4.5 数据库连接', { heading: HeadingLevel.HEADING_2 }),
    p('后端 application.yml 中数据库 URL、用户名和密码均支持环境变量覆盖：SMARTCAMPUS_DB_URL、SMARTCAMPUS_DB_USERNAME、SMARTCAMPUS_DB_PASSWORD。JWT 密钥通过 SMARTCAMPUS_JWT_SECRET 提供，不在代码中硬编码。前端不直接连接数据库，只调用 /api 下的 REST 接口。'),
    p('5 系统安装及使用说明', { heading: HeadingLevel.HEADING_1 }),
    p('5.1 运行环境', { heading: HeadingLevel.HEADING_2 }),
    p('服务器端需要 JDK 17、Maven、MySQL 8；客户端需要 Chrome 或 Edge；前端开发需要 Node.js 20+。'),
    p('5.2 配置说明', { heading: HeadingLevel.HEADING_2 }),
    p('导入数据库：mysql -u root -p < sql/schema.sql，随后导入 views.sql 和 data.sql。启动后端前设置 SMARTCAMPUS_DB_USERNAME、SMARTCAMPUS_DB_PASSWORD、SMARTCAMPUS_JWT_SECRET。进入 backend 执行 mvn spring-boot:run。进入 frontend 执行 npm install 和 npm run dev。'),
    p('5.3 用户使用说明', { heading: HeadingLevel.HEADING_2 }),
    p('管理员登录后依次进入学期管理、课程管理、教学班管理、学生名单页面完成教学闭环配置。教师登录后进入成绩管理和考勤管理维护本人教学班数据，再进入学业预警页面重新计算预警。学生登录后进入我的课程、我的成绩、我的考勤、我的预警页面查看本人数据。'),
  ];
  return baseDoc(children);
}

function htmlPresentation() {
  const slides = [
    ['01', 'SmartCampus 通用高校教务系统', '数据库系统课程设计答辩', ['24 软件工程 3 班', '陈志杰 / 段瑞 / 贺宇轩 / 胡衍科']],
    ['02', '项目定位', '通用高校教务系统', ['管理员、教师、学生三类角色', '教学闭环与学业预警两个亮点', '后端权限与数据范围为准']],
    ['03', '业务闭环', '学期 -> 课程 -> 教学班 -> 学生名单 -> 成绩 -> 考勤 -> 预警', ['管理员配置基础数据', '教师维护过程数据', '学生只读查看本人数据']],
    ['04', '技术架构', 'React + Spring Boot + MySQL', ['前端：React、TypeScript、Vite、Tailwind、TanStack Query', '后端：Java 17、Spring Security、MyBatis-Plus、Knife4j', '数据库：MySQL 手动导入脚本、索引、视图、逻辑外键']],
    ['05', '权限设计', '权限码 + 数据范围', ['管理员：全量数据', '教师：本人负责教学班、成绩、考勤、预警', '学生：本人课程、成绩、考勤、预警']],
    ['06', '数据库模型', '13 张业务表 + 3 个视图', ['sys_user / sys_role / sys_permission', 'semester / course / teaching_class / teaching_class_student', 'grade_record / attendance_record / academic_warning']],
    ['07', '关键约束', '不使用数据库强外键', ['通过 unique 保证业务唯一性', '关联字段建立普通索引', 'Service 层校验逻辑外键和数据范围']],
    ['08', '成绩与预警规则', '总评 = 平时分 40% + 期末分 60%', ['总评低于 70 触发低风险', '总评低于 60 或旷课触发更高风险', '旷课、迟到、早退共同影响风险等级']],
    ['09', '前端实现', '后台工作台而非营销页', ['登录页、仪表盘、管理页、学生只读页', '后端菜单驱动导航显示', 'TypeScript 手写类型，不自动生成 client']],
    ['10', '验证结果', '构建、测试、SQL 导入均已验证', ['mvn test 通过', 'npm run type-check / build 通过', 'MySQL 空库导入通过']],
    ['11', '安全措施', '不信任前端权限', ['BCrypt 密码哈希', 'JWT 不保存敏感字段', '数据库密码和 JWT 密钥通过环境变量提供']],
    ['12', '总结与扩展', 'v1 可答辩、可运行、可扩展', ['后续可扩展选课、请假审批、排课冲突检测', '预警规则可升级为策略配置', '统计视图可扩展为数据看板']],
  ];
  const slideHtml = slides.map((s) => `
    <section class="slide" data-section="${s[0]}">
      <div class="kicker">SmartCampus / ${s[0]}</div>
      <h1>${s[1]}</h1>
      <h2>${s[2]}</h2>
      <div class="cards">${s[3].map((x) => `<div class="card">${x}</div>`).join('')}</div>
    </section>`).join('\n');
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>SmartCampus 通用高校教务系统课程设计答辩</title>
  <style>
    :root{--bg:#f6f7f9;--surface:#fff;--text:#172033;--muted:#64748b;--accent:#0f766e;--line:#d9e2e1}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);font-family:"Microsoft YaHei",system-ui,sans-serif;color:var(--text);overflow:hidden}
    .deck{position:fixed;left:50%;top:50%;width:1280px;height:720px;transform:translate(-50%,-50%) scale(var(--scale,1));transform-origin:center;background:var(--surface);box-shadow:0 20px 60px rgba(15,23,42,.18);border:1px solid var(--line)}
    .slide{position:absolute;inset:0;padding:74px 86px;display:none}
    .slide.active{display:block}
    .slide:before{content:attr(data-section);position:absolute;left:36px;top:74px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:white;font-size:13px;font-weight:800}
    .slide:after{content:"";position:absolute;left:53px;top:120px;bottom:74px;width:1px;background:color-mix(in srgb,var(--accent) 35%,transparent)}
    .kicker{display:inline-flex;padding:5px 12px;border:1px solid color-mix(in srgb,var(--accent) 30%,transparent);border-radius:999px;color:var(--accent);font-size:13px;font-weight:700;letter-spacing:.04em}
    h1{margin:34px 0 18px;font-size:54px;line-height:1.1;letter-spacing:0;color:#0f172a}
    h2{margin:0;max-width:930px;font-size:28px;line-height:1.35;color:var(--muted);font-weight:500}
    .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;margin-top:54px}
    .card{min-height:120px;border:1px solid var(--line);border-top:5px solid var(--accent);border-radius:8px;padding:20px;background:#fbfdfd;font-size:23px;line-height:1.45;font-weight:600}
    .foot{position:absolute;left:86px;right:86px;bottom:26px;display:flex;justify-content:space-between;color:#94a3b8;font-size:13px}
    .nav{position:fixed;right:24px;bottom:24px;display:flex;gap:8px;z-index:20}
    button{border:1px solid var(--line);background:white;border-radius:6px;padding:8px 12px;cursor:pointer}
  </style>
</head>
<body>
  <main class="deck">${slideHtml}<div class="foot"><span>24 软件工程 3 班</span><span id="page"></span></div></main>
  <div class="nav"><button onclick="prev()">上一页</button><button onclick="next()">下一页</button></div>
  <script>
    const slides=[...document.querySelectorAll('.slide')];let i=0;
    function render(){slides.forEach((s,idx)=>s.classList.toggle('active',idx===i));document.getElementById('page').textContent=(i+1)+' / '+slides.length}
    function next(){i=Math.min(slides.length-1,i+1);render()} function prev(){i=Math.max(0,i-1);render()}
    addEventListener('keydown',e=>{if(['ArrowRight','PageDown',' '].includes(e.key))next();if(['ArrowLeft','PageUp'].includes(e.key))prev()});
    function fit(){document.documentElement.style.setProperty('--scale',Math.min(innerWidth/1280,innerHeight/720)*.98)} addEventListener('resize',fit);fit();render();
  </script>
</body>
</html>`;
}

async function main() {
  fs.writeFileSync(path.join(outDir, 'SmartCampus-defense-presentation.html'), htmlPresentation(), 'utf8');
  await Packer.toBuffer(requirementDoc()).then((buf) => fs.writeFileSync(path.join(outDir, '24软工3班陈志杰数据库作业需求分析文档.docx'), buf));
  await Packer.toBuffer(designDoc()).then((buf) => fs.writeFileSync(path.join(outDir, '应用系统设计阶段概要设计与详细设计文档.docx'), buf));
  console.log(outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
