import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import CourseDetail from './pages/CourseDetail';
import LearnView from './pages/LearnView';
import QuizView from './pages/QuizView';
import StudentDashboard from './pages/StudentDashboard';
import Certificates from './pages/Certificates';
import VerifyCertificate from './pages/VerifyCertificate';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPayments from './pages/admin/AdminPayments';
import AdminCourses from './pages/admin/AdminCourses';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#070b13] text-slate-100">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/learn/:videoId" element={<LearnView />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/verify/:code" element={<VerifyCertificate />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Protected Routes */}
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <Certificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId"
            element={
              <ProtectedRoute>
                <QuizView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/module/:quizId"
            element={
              <ProtectedRoute>
                <QuizView />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quizzes"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminQuizzes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminAuditLogs />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
