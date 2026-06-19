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
  teachingClassCount: number
  studentCount: number
  todayAttendanceAbnormalCount: number
  highRiskStudentCount: number
  recentWarnings: AcademicWarning[]
}

export type LoginResult = {
  token: string
  user: User
}
