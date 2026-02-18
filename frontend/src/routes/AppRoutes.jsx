import { Routes, Route, Navigate } from 'react-router-dom';
import CourseCatalog from '../pages/CourseCatalog'; 
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import { useAuth } from '../auth/AuthContext';
import Register from '../pages/Register';
import EnrollmentSummary from '../pages/EnrollmentSummary';
import CoursePlayer from '../pages/CoursePlayer';
import CourseBuilder from '../pages/CourseBuilder';
import Settings from '../pages/Settings';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center text-olg-blue">Loading Academy...</div>;

  return (
    <Routes>
      {/* 1. Root is now the Course Catalog */}
      <Route path="/" element={<CourseCatalog />} />
      
      {/* 2. Auth Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

      {/* 3. Student Dashboard (Protected) */}
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      
      <Route 
  path="/enroll/:courseId" 
  element={user ? <EnrollmentSummary /> : <Navigate to="/login" />} 
/>

<Route path="/player/:courseId" element={user ? <CoursePlayer /> : <Navigate to="/login" />} />

<Route 
  path="/admin/course/:courseId/builder" 
  element={user?.role === 'admin' ? <CourseBuilder /> : <Navigate to="/dashboard" />} 
/>

<Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;