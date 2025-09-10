import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Task from './pages/Task'
import { Route, Routes, useNavigate } from 'react-router'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import { jwtDecode } from 'jwt-decode'
import { useEffect } from 'react'
function App() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  useEffect(() => {
    if (token) {
      try {
        const decode = jwtDecode(token);
        const currentPath = window.location.pathname;
       if (currentPath === "/") {
        if (decode?.role === 'admin') {
          navigate("/dashboard", { replace: true });
        } else if (decode?.role === 'user') {
          navigate("/home", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        navigate("/", { replace: true });
      }
    } else {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);
  return (
    <div className="h-screen w-full flex flex-col">

      {token && <Header />}
      <div className="flex-1 overflow-y-auto w-full">
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
          </ProtectedRoute>}></Route>
          <Route path="/dashboard" element={
            <ProtectedRoute>
                <Dashboard />
             </ProtectedRoute>
          }></Route>
          <Route path="/tasks" element=
          { <ProtectedRoute><Task /></ProtectedRoute>}>
            </Route>
        </Routes>
      </div>
      {token && <Footer />}
    </div>
  )
}

export default App
