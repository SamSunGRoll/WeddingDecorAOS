import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User, UserRole } from '@/types'

interface AuthContextType {
  user: User | null
  role: UserRole
  setRole: (role: UserRole) => void
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

// Comprehensive role-based permissions matrix
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

// Module to permission mapping
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

// Default users for each role
const roleUsers: Record<UserRole, User> = {
  admin: {
    id: 'u1',
    name: 'Priya Sharma',
    email: 'priya@tiein.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  designer: {
    id: 'u2',
    name: 'Rahul Mehta',
    email: 'rahul@tiein.com',
    role: 'designer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  production_manager: {
    id: 'u3',
    name: 'Anjali Verma',
    email: 'anjali@tiein.com',
    role: 'production_manager',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
  },
  procurement: {
    id: 'u4',
    name: 'Vikram Singh',
    email: 'vikram@tiein.com',
    role: 'procurement',
  },
  sales: {
    id: 'u5',
    name: 'Neha Kapoor',
    email: 'neha@tiein.com',
    role: 'sales',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
  },
  finance: {
    id: 'u6',
    name: 'Amit Patel',
    email: 'amit@tiein.com',
    role: 'finance',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  },
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('admin')

  const user = roleUsers[role]

  const hasPermission = (permission: Permission): boolean => {
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

  return (
    <AuthContext.Provider value={{ user, role, setRole, hasPermission, canView, canEdit, canApprove }}>
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

export { rolePermissions, roleUsers }
export type { Permission, Module }
