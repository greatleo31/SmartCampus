import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthProvider } from './hooks/AuthProvider'
import { useAuth } from './hooks/useAuth'
import { AdminPage } from './pages/AdminPage'
import { AttendancePage } from './pages/AttendancePage'
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
  const { token } = useAuth()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return (
    <AppShell>
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
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/announcements" element={<AdminPage />} />
        <Route path="/admin/users" element={<AdminPage />} />
        <Route path="/admin/roles" element={<AdminPage />} />
        <Route path="/admin/configs" element={<AdminPage />} />
        <Route path="/admin/schedules" element={<AdminPage />} />
        <Route path="/my/courses" element={<ReadOnlyPage title="我的课程" endpoint="/api/my/courses" />} />
        <Route path="/my/grades" element={<ReadOnlyPage title="我的成绩" endpoint="/api/my/grades" />} />
        <Route path="/my/attendance" element={<ReadOnlyPage title="我的考勤" endpoint="/api/my/attendance" />} />
        <Route path="/my/warnings" element={<ReadOnlyPage title="我的预警" endpoint="/api/my/warnings" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
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
