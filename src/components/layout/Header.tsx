import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Bell,
  ChevronRight,
  User,
  Settings,
  LogOut,
  HelpCircle,
} from 'lucide-react'
import { notifications } from '@/data/dummy-data'
import { getInitials } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/costing': 'Costing Engine',
  '/materials': 'Material Estimation',
  '/workflow': 'Workflow Tracker',
  '/designs': 'Design Repository',
  '/reports': 'Reports & Analytics',
  '/settings': 'Settings',
}

const breadcrumbs: Record<string, string[]> = {
  '/': ['Home'],
  '/costing': ['Home', 'Costing Engine'],
  '/materials': ['Home', 'Material Estimation'],
  '/workflow': ['Home', 'Workflow Tracker'],
  '/designs': ['Home', 'Design Repository'],
  '/reports': ['Home', 'Reports'],
  '/settings': ['Home', 'Settings'],
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  designer: 'Designer',
  production_manager: 'Production Manager',
  procurement: 'Procurement',
  sales: 'Sales',
  finance: 'Finance',
}

export function Header() {
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, role } = useAuth()
  const unreadCount = notifications.filter((n) => !n.read).length

  const pageTitle = pageTitles[location.pathname] || 'Page'
  const pageBreadcrumbs = breadcrumbs[location.pathname] || ['Home']

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-xl">
      {/* Left: Breadcrumbs & Title */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {pageBreadcrumbs.map((crumb, index) => (
            <span key={crumb} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3 w-3" />}
              <span className={index === pageBreadcrumbs.length - 1 ? 'text-foreground' : ''}>
                {crumb}
              </span>
            </span>
          ))}
        </div>
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          {searchOpen ? (
            <Input
              autoFocus
              placeholder="Search events, designs..."
              className="w-64 pr-8"
              onBlur={() => setSearchOpen(false)}
            />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 p-3"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium">{notification.title}</span>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-gold-500" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {notification.message}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 pl-2 pr-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{getInitials(user?.name || 'User')}</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {roleLabels[role]}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
