import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { Layout } from '@/components/layout'
import {
  Dashboard,
  CostingEngine,
  MaterialEstimation,
  WorkflowTracker,
  DesignRepository,
  Reports,
  Inventory,
  AIFeatures,
  Settings,
  Login,
} from '@/pages'

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Layout />
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/costing" element={<CostingEngine />} />
              <Route path="/materials" element={<MaterialEstimation />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/workflow" element={<WorkflowTracker />} />
              <Route path="/designs" element={<DesignRepository />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/ai-features" element={<AIFeatures />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  )
}

export default App
