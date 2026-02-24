import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease'
  icon: LucideIcon
  tooltip?: string
  className?: string
}

export function KPICard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  tooltip,
  className,
}: KPICardProps) {
  return (
    <Card className={cn('card-hover', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {tooltip && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
            {change !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                {changeType === 'increase' ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    changeType === 'increase' ? 'text-emerald-500' : 'text-red-500'
                  )}
                >
                  {change > 0 ? '+' : ''}{change}%
                </span>
                <span className="text-sm text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100">
            <Icon className="h-6 w-6 text-gold-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
