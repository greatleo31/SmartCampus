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
  credit: number
  hours: number
}

export type TeachingClass = {
  id: number
  className: string
  semesterName: string
  courseName: string
  teacherName: string
  capacity: number
}

export type TeacherProfile = {
  id: number
  userId?: number
  teacherNo: string
  realName: string
  department: string
  title?: string
}

export type StudentProfile = {
  id: number
  userId?: number
  studentNo: string
  realName: string
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
  teachingClassName: string
  courseName: string
  studentName: string
  regularScore: number
  finalScore: number
  totalScore: number
}

export type AttendanceRecord = {
  id: number
  teachingClassName: string
  courseName: string
  studentName: string
  attendanceDate: string
  status: 'NORMAL' | 'LATE' | 'EARLY_LEAVE' | 'LEAVE' | 'ABSENT'
  statusText: string
  remark?: string
}

export type AcademicWarning = {
  id: number
  teachingClassName: string
  courseName: string
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
}

export type AdminUserPayload = {
  username: string
  realName: string
  userType: User['userType']
  status: number
  roleIds: number[]
  password?: string
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
  campusIdentity?: string
  lastLoginTime?: string
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
