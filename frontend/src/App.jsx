import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import StudentList from './pages/StudentList';
import AddStudent from './pages/AddStudent';
import StudentDetail from './pages/StudentDetail';
import EditStudent from './pages/EditStudent';
import TeacherList from './pages/TeacherList';
import AddTeacher from './pages/AddTeacher';
import EditTeacher from './pages/EditTeacher';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Analytics from './pages/Analytics';
import StudentProfile from "./pages/StudentProfile";


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Home />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/teachers" element={
        <ProtectedRoute>
          <Layout><TeacherList /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/add-teacher" element={
        <ProtectedRoute>
          <Layout><AddTeacher /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/students" element={
        <ProtectedRoute>
          <Layout><StudentList /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/add-student" element={
        <ProtectedRoute>
          <Layout><AddStudent /></Layout>
          </ProtectedRoute>
        } />

      <Route path="/edit-student/:id" element={
        <ProtectedRoute>
          <Layout><EditStudent /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/edit-teacher/:id" element={
        <ProtectedRoute>
          <Layout><EditTeacher /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/attendance" element={
        <ProtectedRoute>
          <Layout><Attendance /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/fees" element={
        <ProtectedRoute>
          <Layout>
            <Fees />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/analytics" element={
        <ProtectedRoute>
          <Layout>
            <Analytics />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/students/:id" element={
        <ProtectedRoute>
          <Layout>
            <StudentProfile />
          </Layout>
        </ProtectedRoute>
      } />


      {/* Redirect any unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
