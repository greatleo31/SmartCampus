import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminShell } from './components/layout/AdminShell'
import { AppShell } from './components/layout/AppShell'
import { AuthProvider } from './hooks/AuthProvider'
import { useAuth } from './hooks/useAuth'
import { AdminPage } from './pages/AdminPage'
import { AttendancePage } from './pages/AttendancePage'
import { CalendarPage } from './pages/CalendarPage'
import { CoursesPage } from './pages/CoursesPage'
import { DashboardPage } from './pages/DashboardPage'
import { EnrollmentsPage } from './pages/EnrollmentsPage'
import { GradesPage } from './pages/GradesPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { ReadOnlyPage } from './pages/ReadOnlyPage'
import { SchedulePage } from './pages/SchedulePage'
import { SemestersPage } from './pages/SemestersPage'
import { TeachingClassesPage } from './pages/TeachingClassesPage'
import { WarningsPage } from './pages/WarningsPage'

const queryClient = new QueryClient()

function PrivateRoutes() {
  const { token, user } = useAuth()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          user?.permissions.includes('admin:access')
            ? <AdminShell><AdminRoutes /></AdminShell>
            : <Navigate to="/" replace />
        }
      />
      <Route path="/*" element={<AppShell><FrontRoutes /></AppShell>} />
    </Routes>
  )
}

function FrontRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/semesters" element={<SemestersPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/teaching-classes" element={<TeachingClassesPage />} />
      <Route path="/enrollments" element={<EnrollmentsPage />} />
      <Route path="/grades" element={<GradesPage />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/warnings" element={<WarningsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/class-schedule" element={<SchedulePage title="班级课表查询" />} />
      <Route path="/my/courses" element={<ReadOnlyPage title="我的选课" endpoint="/api/my/courses" />} />
      <Route path="/my/grades" element={<ReadOnlyPage title="学生成绩查询" endpoint="/api/my/grades" />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/gpa-ranking" element={<ReadOnlyPage title="绩点排名查询" endpoint="/api/gpa-ranking" />} />
      <Route path="/exams" element={<ReadOnlyPage title="考试安排" endpoint="/api/exams" />} />
      <Route path="/makeup-exams" element={<ReadOnlyPage title="补考报名" endpoint="/api/makeup-exams" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminPage />} />
      <Route path="announcements" element={<AdminPage />} />
      <Route path="users" element={<AdminPage />} />
      <Route path="roles" element={<AdminPage />} />
      <Route path="configs" element={<AdminPage />} />
      <Route path="schedules" element={<AdminPage />} />
      <Route path="attendance-import" element={<AttendancePage adminMode />} />
      <Route path="grade-import" element={<GradesPage adminMode />} />
      <Route path="warnings" element={<WarningsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<PrivateRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
