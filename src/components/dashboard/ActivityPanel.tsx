import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials, formatDateTime } from '@/lib/utils'
import {
  Calculator,
  Package,
  Palette,
  Calendar,
  CheckCircle,
} from 'lucide-react'
import type { Activity } from '@/types'
import { api } from '@/lib/api'

const activityIcons: Record<Activity['type'], React.ComponentType<{ className?: string }>> = {
  costing: Calculator,
  material: Package,
  design: Palette,
  event: Calendar,
  approval: CheckCircle,
}

const activityColors: Record<Activity['type'], string> = {
  costing: 'bg-blue-100 text-blue-600',
  material: 'bg-emerald-100 text-emerald-600',
  design: 'bg-purple-100 text-purple-600',
  event: 'bg-amber-100 text-amber-600',
  approval: 'bg-gold-100 text-gold-600',
}

export function ActivityPanel() {
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])

  useEffect(() => {
    void api.getActivities().then(setRecentActivity).catch(() => setRecentActivity([]))
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {recentActivity.length} updates
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivity.map((activity) => {
          const Icon = activityIcons[activity.type]
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${activityColors[activity.type]}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-tight">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={activity.userAvatar} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(activity.user)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {activity.user} • {formatDateTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
