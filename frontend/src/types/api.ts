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
  classCode: string
  className: string
  semesterId: number
  courseId: number
  teacherId: number
  capacity: number
}

export type TeacherProfile = {
  id: number
  userId: number
  teacherNo: string
  department: string
  title?: string
}

export type StudentProfile = {
  id: number
  userId: number
  studentNo: string
  major: string
  className: string
  gradeYear: number
}

export type Enrollment = {
  id: number
  teachingClassId: number
  studentId: number
}

export type GradeRecord = {
  id: number
  teachingClassId: number
  studentId: number
  regularScore: number
  finalScore: number
  totalScore: number
}

export type AttendanceRecord = {
  id: number
  teachingClassId: number
  studentId: number
  attendanceDate: string
  status: 'NORMAL' | 'LATE' | 'EARLY_LEAVE' | 'LEAVE' | 'ABSENT'
  remark?: string
}

export type AcademicWarning = {
  id: number
  teachingClassId?: number
  studentId: number
  warningLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  reason: string
  status: 'OPEN' | 'CLOSED'
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
}

export type AnnouncementPayload = {
  title: string
  category: AnnouncementCategory
  summary: string
  content: string
  status: 'DRAFT' | 'PUBLISHED'
  pinned: boolean
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
  lowScoreCount: number
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
