import { Routes, Route, Navigate } from "react-router-dom";
import CourseCatalog from "./pages/CourseCatalog";
import CourseDetails from "./pages/CourseDetails";
import EnrollmentPage from "./pages/EnrollmentPage"; 
import Dashboard from "./pages/Dashboard";
import CoursePlayer from "./pages/CoursePlayer";
import { useAuth } from "./auth/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";

// Assuming you have these components. If named differently, update the imports.
import Login from "./pages/Login"; 
import Register from "./pages/Register";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#457B9D]"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<CourseCatalog />} />
      <Route path="/courses" element={<CourseCatalog />} />
      <Route path="/course/:courseId" element={<CourseDetails />} />
      
      {/* --- Auth Routes --- */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

      {/* --- Protected Routes --- */}
      <Route 
        path="/enroll/:courseId" 
        element={user ? <EnrollmentPage /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/dashboard" 
        element={user ? <Dashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/classroom/:courseId" 
        element={user ? <CoursePlayer /> : <Navigate to="/login" />} 
      />
      
      <Route path="*" element={<Navigate to="/" />} />

      <Route 
  path="/admin" 
  element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} 
/>
    </Routes>
  );
}

export default App;