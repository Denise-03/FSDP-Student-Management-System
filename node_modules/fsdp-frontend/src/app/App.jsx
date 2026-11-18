import { Routes, Route, Link } from 'react-router-dom';
import SiteLayout from '../shared/layouts/SiteLayout.jsx';
import { RoleGuard } from './routes.jsx';
import HomePage from '../features/public-site/pages/HomePage.jsx';
import {
  AboutPage,
  GradingInfoPage,
  FeesPage,
  HowToJoinPage,
} from '../features/public-site/pages/InformationPages.jsx';
import {
  ClassesPage,
  ClassDetailsPage,
  DojosPage,
  BookClassesPage,
  MyBookingsPage,
} from '../features/dojos-classes/pages/ClassesPages.jsx';
import AuthPage from '../features/authentication/pages/AuthPage.jsx';
import EnrolmentPage from '../features/membership-enrolment/pages/EnrolmentPage.jsx';
import ApplicationStatusPage from '../features/membership-enrolment/pages/ApplicationStatusPage.jsx';
import StudentDashboardPage from '../features/student-dashboard/pages/StudentDashboardPage.jsx';
import StudentAttendanceHistoryPage from '../features/attendance/pages/StudentAttendanceHistoryPage.jsx';
import InstructorTakeAttendancePage from '../features/attendance/pages/InstructorTakeAttendancePage.jsx';
import GradingReadinessPage from '../features/grading-readiness/pages/GradingReadinessPage.jsx';
import GradingApplicationsPage from '../features/grading-applications/pages/GradingApplicationsPage.jsx';
import NotificationsPage from '../features/notifications/pages/NotificationsPage.jsx';
import ProfilePage from '../features/student-profiles/pages/ProfilePage.jsx';
import PaymentsPage from '../features/payments/pages/PaymentsPage.jsx';
import {
  InstructorDashboardPage,
  StudentProgressPage,
} from '../features/instructor-dashboard/pages/InstructorDashboardPages.jsx';
import InstructorAssessmentsPage from '../features/instructor-assessment/pages/InstructorAssessmentsPage.jsx';
import {
  AdminDashboardPage,
  MembersPage,
  CentreReportsPage,
  AdminPaymentsPage,
} from '../features/admin-dashboard/pages/AdminOverviewPages.jsx';
import ApplicationReviewsPage from '../features/admin-dashboard/pages/ApplicationReviewsPage.jsx';
import ManageClassesPage from '../features/admin-dashboard/pages/ManageClassesPage.jsx';
export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/classes/:classId" element={<ClassDetailsPage />} />
        <Route path="/dojos" element={<DojosPage />} />
        <Route path="/grading-info" element={<GradingInfoPage />} />
        <Route path="/fees" element={<FeesPage />} />
        <Route path="/how-to-join" element={<HowToJoinPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage register />} />
        <Route element={<RoleGuard allowed={['applicant', 'student']} />}>
          <Route path="/enrolment" element={<EnrolmentPage />} />
          <Route path="/enrolment/status" element={<ApplicationStatusPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/payments/result" element={<PaymentsPage result />} />
        </Route>
        <Route element={<RoleGuard allowed={['student']} />}>
          <Route path="/student" element={<StudentDashboardPage />} />
          <Route path="/student/classes" element={<BookClassesPage />} />
          <Route path="/student/bookings" element={<MyBookingsPage />} />
          <Route path="/student/attendance" element={<StudentAttendanceHistoryPage />} />
          <Route path="/student/grading-readiness" element={<GradingReadinessPage />} />
          <Route
            path="/student/grading-applications"
            element={<GradingApplicationsPage />}
          />
          <Route path="/student/notifications" element={<NotificationsPage />} />
          <Route path="/student/membership" element={<PaymentsPage />} />
          <Route path="/student/profile" element={<ProfilePage />} />
        </Route>
        <Route element={<RoleGuard allowed={['instructor']} />}>
          <Route path="/instructor" element={<InstructorDashboardPage />} />
          <Route
            path="/instructor/classes/:sessionId/attendance"
            element={<InstructorTakeAttendancePage />}
          />
          <Route path="/instructor/students" element={<StudentProgressPage />} />
          <Route path="/instructor/assessments" element={<InstructorAssessmentsPage />} />
        </Route>
        <Route element={<RoleGuard allowed={['admin']} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/enrolments" element={<ApplicationReviewsPage />} />
          <Route path="/admin/members" element={<MembersPage />} />
          <Route path="/admin/reports" element={<CentreReportsPage />} />
          <Route path="/admin/manage" element={<ManageClassesPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        </Route>
        <Route
          path="*"
          element={
            <div className="section">
              <h1>Page not found.</h1>
              <Link to="/">Return home →</Link>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
