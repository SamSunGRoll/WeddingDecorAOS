import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LayoutDashboard,
  Calculator,
  Package,
  Kanban,
  Image,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  Boxes,
  Wand2,
} from 'lucide-react'
import { useAuth, type Module } from '@/hooks/useAuth'
import tieInLogo from '@/assets/tie-in_logo.png'
import type { UserRole } from '@/types'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  module: Module
  badge?: string
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard, module: 'dashboard' },
  { title: 'Costing Engine', href: '/costing', icon: Calculator, module: 'costing' },
  { title: 'Materials', href: '/materials', icon: Package, module: 'materials' },
  { title: 'Inventory', href: '/inventory', icon: Boxes, module: 'inventory' },
  { title: 'Workflow', href: '/workflow', icon: Kanban, module: 'workflow' },
  { title: 'Design Repository', href: '/designs', icon: Image, module: 'designs' },
  { title: 'Reports', href: '/reports', icon: BarChart3, module: 'reports' },
  { title: 'AI Features', href: '/ai-features', icon: Wand2, module: 'dashboard', badge: 'Soon' },
]

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  designer: 'Designer',
  production_manager: 'Production Mgr',
  procurement: 'Procurement',
  sales: 'Sales',
  finance: 'Finance',
}

const roleDescriptions: Record<UserRole, string> = {
  admin: 'Full system access',
  designer: 'Design & costing access',
  production_manager: 'Production & workflow',
  procurement: 'Materials & inventory',
  sales: 'Client-facing reports',
  finance: 'Approvals & reports',
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { role, setRole, canView } = useAuth()

  const visibleNavItems = navItems.filter((item) => canView(item.module))

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={tieInLogo}
              alt="Tie In logo"
              className={cn(
                'h-10 w-10 rounded-xl object-contain bg-white p-1 shadow-sm ring-1 ring-border/60',
                collapsed && 'h-9 w-9 p-0.5'
              )}
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">Tie In</span>
                <span className="text-[10px] text-muted-foreground">Wedding Décor Ops</span>
              </div>
            )}
          </div>
        </div>

        {/* Role Switcher (for demo) */}
        {!collapsed && (
          <div className="border-b border-border p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Users className="h-3 w-3" />
              <span>Switch Role (Demo)</span>
            </div>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    <div className="flex flex-col">
                      <span className="font-medium">{label}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {roleDescriptions[value as UserRole]}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleNavItems.map((item) => (
            <NavItemComponent
              key={item.href}
              item={item}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Settings & Collapse */}
        <div className="border-t border-border p-3">
          {canView('settings') && (
            <NavItemComponent
              item={{ title: 'Settings', href: '/settings', icon: Settings, module: 'settings' }}
              collapsed={collapsed}
            />
          )}
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'default'}
            className={cn(
              'mt-2 w-full justify-start text-muted-foreground hover:text-foreground',
              collapsed && 'justify-center'
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-2">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  )
}

function NavItemComponent({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const content = (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-gold-100 text-gold-700'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          collapsed && 'justify-center px-2'
        )
      }
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </NavLink>
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          <div className="flex items-center gap-2">
            {item.title}
            {item.badge && (
              <Badge variant="secondary" className="text-[10px]">
                {item.badge}
              </Badge>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
