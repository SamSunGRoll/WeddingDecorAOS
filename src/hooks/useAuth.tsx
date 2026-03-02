import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User, UserRole } from '@/types'
import { api, setAuthToken } from '@/lib/api'

interface AuthContextType {
  user: User | null
  role: UserRole | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: Permission) => boolean
  canView: (module: Module) => boolean
  canEdit: (module: Module) => boolean
  canApprove: (module: Module) => boolean
}

type Module =
  | 'dashboard'
  | 'costing'
  | 'materials'
  | 'workflow'
  | 'designs'
  | 'reports'
  | 'inventory'
  | 'settings'

type Permission =
  | 'view_dashboard'
  | 'view_costing'
  | 'edit_costing'
  | 'approve_costing'
  | 'view_materials'
  | 'edit_materials'
  | 'view_workflow'
  | 'edit_workflow'
  | 'view_designs'
  | 'edit_designs'
  | 'view_reports'
  | 'view_inventory'
  | 'edit_inventory'
  | 'view_settings'
  | 'edit_settings'

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard',
    'view_costing', 'edit_costing', 'approve_costing',
    'view_materials', 'edit_materials',
    'view_workflow', 'edit_workflow',
    'view_designs', 'edit_designs',
    'view_reports',
    'view_inventory', 'edit_inventory',
    'view_settings', 'edit_settings',
  ],
  designer: [
    'view_dashboard',
    'view_costing', 'edit_costing',
    'view_materials',
    'view_workflow',
    'view_designs', 'edit_designs',
    'view_inventory',
  ],
  production_manager: [
    'view_dashboard',
    'view_costing',
    'view_materials', 'edit_materials',
    'view_workflow', 'edit_workflow',
    'view_inventory', 'edit_inventory',
    'view_reports',
  ],
  procurement: [
    'view_dashboard',
    'view_costing',
    'view_materials', 'edit_materials',
    'view_workflow',
    'view_inventory', 'edit_inventory',
  ],
  sales: [
    'view_dashboard',
    'view_costing',
    'view_designs',
    'view_reports',
  ],
  finance: [
    'view_dashboard',
    'view_costing', 'approve_costing',
    'view_reports',
    'view_inventory',
  ],
}

const modulePermissions: Record<Module, { view: Permission; edit?: Permission; approve?: Permission }> = {
  dashboard: { view: 'view_dashboard' },
  costing: { view: 'view_costing', edit: 'edit_costing', approve: 'approve_costing' },
  materials: { view: 'view_materials', edit: 'edit_materials' },
  workflow: { view: 'view_workflow', edit: 'edit_workflow' },
  designs: { view: 'view_designs', edit: 'edit_designs' },
  reports: { view: 'view_reports' },
  inventory: { view: 'view_inventory', edit: 'edit_inventory' },
  settings: { view: 'view_settings', edit: 'edit_settings' },
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('tiein_user')
    const storedToken = localStorage.getItem('tiein_access_token')

    if (storedUser && storedToken) {
      setAuthToken(storedToken)
      setUser(JSON.parse(storedUser) as User)
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password)
    setAuthToken(response.accessToken)
    localStorage.setItem('tiein_user', JSON.stringify(response.user))
    setUser(response.user)
  }

  const logout = () => {
    setAuthToken(null)
    localStorage.removeItem('tiein_user')
    setUser(null)
  }

  const role = user?.role ?? null

  const hasPermission = (permission: Permission): boolean => {
    if (!role) return false
    return rolePermissions[role].includes(permission)
  }

  const canView = (module: Module): boolean => {
    const perm = modulePermissions[module]?.view
    return perm ? hasPermission(perm) : false
  }

  const canEdit = (module: Module): boolean => {
    const perm = modulePermissions[module]?.edit
    return perm ? hasPermission(perm) : false
  }

  const canApprove = (module: Module): boolean => {
    const perm = modulePermissions[module]?.approve
    return perm ? hasPermission(perm) : false
  }

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      hasPermission,
      canView,
      canEdit,
      canApprove,
    }),
    [user, role, loading]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export type { Permission, Module }
