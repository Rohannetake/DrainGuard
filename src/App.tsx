import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components'
import { AppProvider } from './context'
import { CitizenHome, FileComplaintPage, SubmittedPage } from './pages-citizen'
import {
  AdminOtpPage,
  EscalationPage,
  FeedbackPage,
  ForgotPage,
  LoginPage,
  PublicDashboard,
  RegisterPage,
  StatusPage,
} from './pages-public'
import {
  AdminFeedback,
  AdminHome,
  AdminRegions,
  AdminReviewCase,
  AdminReviewRequest,
  RepairHistoryPage,
  WorkerAssignment,
  WorkerHome,
} from './pages-staff'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<PublicDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/admin-otp" element={<AdminOtpPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/escalation" element={<EscalationPage />} />
            <Route path="/citizen" element={<CitizenHome />} />
            <Route path="/complaints/new" element={<FileComplaintPage />} />
            <Route path="/complaints/submitted" element={<SubmittedPage />} />
            <Route path="/worker" element={<WorkerHome />} />
            <Route path="/worker/assignments/vanaz" element={<WorkerAssignment />} />
            <Route path="/worker/history" element={<RepairHistoryPage />} />
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/cases/:id" element={<AdminReviewCase />} />
            <Route path="/admin/requests/ramwadi" element={<AdminReviewRequest />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
            <Route path="/admin/regions" element={<AdminRegions />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      </BrowserRouter>
    </AppProvider>
  )
}
