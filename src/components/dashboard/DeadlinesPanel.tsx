import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { upcomingDeadlines } from '@/data/dummy-data'
import { formatDate } from '@/lib/utils'
import { Clock, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react'
import type { Deadline } from '@/types'

const statusConfig: Record<
  Deadline['status'],
  { icon: React.ComponentType<{ className?: string }>; variant: 'success' | 'warning' | 'error'; label: string }
> = {
  on_track: { icon: CheckCircle, variant: 'success', label: 'On Track' },
  at_risk: { icon: AlertTriangle, variant: 'warning', label: 'At Risk' },
  overdue: { icon: Clock, variant: 'error', label: 'Overdue' },
}

export function DeadlinesPanel() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-primary">
            View all
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingDeadlines.map((deadline) => {
          const config = statusConfig[deadline.status]
          const StatusIcon = config.icon
          return (
            <div
              key={deadline.id}
              className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{deadline.task}</p>
                <p className="text-xs text-muted-foreground">
                  {deadline.eventName}
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Due {formatDate(deadline.dueDate)}
                  </span>
                </div>
              </div>
              <Badge variant={config.variant} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
