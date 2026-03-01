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

      {/* Add this new route inside your protected area */}
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
      
      <Route path="/students/:id" element={
        <ProtectedRoute>
          <Layout><StudentDetail /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/edit-student/:id" element={
        <ProtectedRoute>
          <Layout><EditStudent /></Layout>
        </ProtectedRoute>
      } />


      {/* Redirect any unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
