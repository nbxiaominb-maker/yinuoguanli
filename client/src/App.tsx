import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { useEffect, useState } from 'react'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Departments from './pages/Departments'
import Projects from './pages/Projects'
import Financial from './pages/Financial'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  const [loading, setLoading] = useState(true)
  const { token, user, checkAuth } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth()
      setLoading(false)
    }
    initAuth()
  }, [checkAuth])

  if (loading) {
    return (
      <div className="loading-overlay">
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" />
          <p style={{ marginTop: '16px' }}>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/"
          element={
            token ? (
              <Layout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="departments" element={<Departments />} />
          <Route path="projects" element={<Projects />} />
          <Route path="financial" element={<Financial />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigProvider>
  )
}

export default App
