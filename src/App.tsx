import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/useAuth'
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
} from '@/pages'

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/costing" element={<CostingEngine />} />
              <Route path="/materials" element={<MaterialEstimation />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/workflow" element={<WorkflowTracker />} />
              <Route path="/designs" element={<DesignRepository />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/ai-features" element={<AIFeatures />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  )
}

export default App
