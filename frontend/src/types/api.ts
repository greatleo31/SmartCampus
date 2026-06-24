export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

export type PageResult<T> = {
  total: number
  page: number
  size: number
  records: T[]
}

export type User = {
  id: number
  username: string
  realName: string
  userType: 'ADMIN' | 'TEACHER' | 'STUDENT'
  roles: string[]
  permissions: string[]
}

export type Menu = {
  name: string
  path: string
  permission: string
}

export type Semester = {
  id: number
  name: string
  startDate: string
  endDate: string
  currentFlag: number
}

export type Course = {
  id: number
  code: string
  name: string
  aliasName?: string
  collegeId?: number
  collegeName?: string
  credit: number
  hours: number
}

export type CoursePayload = {
  code: string
  name: string
  aliasName?: string
  collegeId?: number
  credit: number
  hours: number
}

export type TeachingClass = {
  id: number
  classCode: string
  semesterId: number
  courseId: number
  teacherId: number
  className: string
  semesterName: string
  courseName: string
  teacherName: string
  capacity: number
}

export type TeachingClassPayload = {
  classCode: string
  className: string
  semesterId: number
  courseId: number
  teacherId: number
  capacity: number
}

export type TeacherProfile = {
  id: number
  userId?: number
  teacherNo: string
  realName: string
  collegeName: string
  department: string
  title?: string
}

export type StudentProfile = {
  id: number
  userId?: number
  studentNo: string
  realName: string
  collegeName: string
  major: string
  className: string
  gradeYear: number
}

export type Enrollment = {
  id: number
  teachingClassName: string
  studentName: string
  studentNo: string
  major: string
  className: string
}

export type GradeRecord = {
  id: number
  teachingClassId: number
  studentId: number
  semesterName: string
  teachingClassName: string
  courseName: string
  studentNo: string
  studentName: string
  regularScore: number
  finalScore: number
  totalScore: number
}

export type GradePayload = {
  teachingClassId: number
  studentId: number
  regularScore: number
  finalScore: number
}

export type AttendanceRecord = {
  id: number
  teachingClassId: number
  studentId: number
  adminClassName: string
  studentNo: string
  studentName: string
  courseName: string
  semesterName: string
  teachingClassName: string
  attendanceDate: string
  weekLabel: string
  teacherName: string
  sectionLabel: string
  classroom: string
  status: 'NORMAL' | 'LATE' | 'EARLY_LEAVE' | 'LEAVE' | 'ABSENT'
  statusText: string
  remark?: string
}

export type AttendancePayload = {
  teachingClassId: number
  studentId: number
  attendanceDate: string
  status: AttendanceRecord['status']
  remark?: string
}

export type AcademicWarning = {
  id: number
  teachingClassName: string
  courseName: string
  studentNo: string
  studentName: string
  warningLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  warningLevelText: string
  absentCount: number
  lateOrEarlyCount: number
  reason: string
  generatedTime: string
}

export type Dashboard = {
  role: User['userType']
  greetingName: string
  showKpis: boolean
  teachingClassCount: number
  studentCount: number
  todayAttendanceAbnormalCount: number
  highRiskStudentCount: number
  recentWarnings: AcademicWarning[]
  trends: TrendPoint[]
}

export type LoginResult = {
  token: string
  user: User
}

export type AnnouncementCategory = 'NOTICE' | 'MEETING' | 'PUBLICITY' | 'LECTURE'

export type Announcement = {
  id: number
  title: string
  category: AnnouncementCategory
  summary: string
  content: string
  status: 'DRAFT' | 'PUBLISHED'
  pinned: number
  publisherId: number
  publishTime?: string
  sourceUrl: string
}

export type AnnouncementPayload = {
  title: string
  category: AnnouncementCategory
  summary?: string
  content?: string
  status: 'DRAFT' | 'PUBLISHED'
  pinned: boolean
  sourceUrl: string
  publishTime?: string
}

export type ScheduleItem = {
  id: number
  teachingClassId: number
  semesterName: string
  className: string
  courseName: string
  teacherName: string
  dayOfWeek: number
  startSection: number
  endSection: number
  startWeek: number
  endWeek: number
  classroom: string
  location?: string
}

export type SchedulePayload = {
  teachingClassId: number
  dayOfWeek: number
  startSection: number
  endSection: number
  startWeek: number
  endWeek: number
  classroom: string
  location?: string
}

export type TrendPoint = {
  label: string
  attendanceAbnormalCount: number
  warningCount: number
  absentCount: number
}

export type Weather = {
  city: string
  weather: string
  temperature?: number
  precipitation?: number
  windSpeed?: number
  observedAt: string
  stale: boolean
}

export type SystemConfig = {
  id: number
  configKey: string
  configName: string
  configValue: string
  description?: string
}

export type AdminUser = {
  id: number
  username: string
  realName: string
  userType: User['userType']
  status: number
  roles: string[]
  entryYear?: number
  collegeId?: number
  collegeName?: string
  department?: string
  title?: string
  teacherNo?: string
}

export type AdminUserPayload = {
  username: string
  realName: string
  userType: User['userType']
  status: number
  roleIds: number[]
  password?: string
  entryYear?: number
  collegeId?: number
  department?: string
  title?: string
}

export type PasswordResetPayload = {
  password: string
}

export type Role = {
  id: number
  code: string
  name: string
  dataScope: string
}

export type Permission = {
  id: number
  code: string
  name: string
  menuPath?: string
  roleCode: string
}

export type ProfileSecurity = {
  userId: number
  username: string
  realName: string
  userType: User['userType']
  email?: string
  wechatBound: boolean
  collegeName?: string
  majorName?: string
  className?: string
  studentNo?: string
  teacherNo?: string
  title?: string
  department?: string
  lastLoginTime?: string
}

export type College = {
  id: number
  code: string
  name: string
  shortName?: string
  teacherCode?: string
  foundedYear?: number
}

export type Major = {
  id: number
  collegeId: number
  collegeName: string
  code: string
  name: string
}

export type AdminClass = {
  id: number
  majorId: number
  collegeName: string
  majorName: string
  className: string
  gradeYear: number
  classNo: number
}

export type CalendarDay = {
  date: string
  weekNo?: number
  monthLabel?: string
  dayText: string
  eventName?: string
  dayType: 'NORMAL' | 'WEEKEND' | 'HOLIDAY' | 'EXAM' | 'ADJUST'
}

export type AcademicCalendar = {
  academicYear: string
  term: number
  yearLabel: number
  days: CalendarDay[]
}

export type AdminStats = {
  userCount: number
  activeUserCount: number
  announcementCount: number
  scheduleCount: number
  importTaskCount: number
  exceptionTaskCount: number
}

export type ImportResult = {
  successCount: number
  errors: string[]
}
