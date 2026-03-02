import { useEffect, useState } from 'react'
import { CalendarDays, IndianRupee, Clock, TrendingDown, MapPin, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  KPICard,
  RevenueChart,
  EventStatusChart,
  ActivityPanel,
  DeadlinesPanel,
} from '@/components/dashboard'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { api, type DashboardInsightsResponse, type DashboardOverview } from '@/lib/api'
import type { Event } from '@/types'

const kpiIconMap = {
  'Total Events': CalendarDays,
  'Total Budget': IndianRupee,
  'Approved Cost Sheets': Clock,
  'Material Variance': TrendingDown,
  'Events This Month': CalendarDays,
  'Total Revenue': IndianRupee,
  'Avg. Costing Time': Clock,
} as const

export function Dashboard() {
  const { role, canApprove, user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [insights, setInsights] = useState<DashboardInsightsResponse | null>(null)

  useEffect(() => {
    void Promise.all([api.getEvents(), api.getDashboardOverview(), api.getDashboardInsights()])
      .then(([eventData, overviewData, insightsData]) => {
        setEvents(eventData)
        setOverview(overviewData)
        setInsights(insightsData)
      })
      .catch(() => {
        setEvents([])
        setOverview(null)
        setInsights(null)
      })
  }, [])

  const pendingApprovals = insights?.pendingApprovals ?? []
  const venueMetrics = insights?.venueMetrics ?? []
  const teamMetrics = insights?.teamMetrics ?? []
  const roleStats = role ? insights?.roleStats?.[role] ?? [] : []
  const roleCardTitle = role === 'designer' ? 'Your Design Stats' : role === 'procurement' ? 'Procurement Overview' : null

  const handleApprovalAction = async (sheetId: string, approved: boolean) => {
    if (!user) return
    try {
      await api.approveCostSheet(sheetId, user.name, approved)
      const [overviewData, insightsData] = await Promise.all([api.getDashboardOverview(), api.getDashboardInsights()])
      setOverview(overviewData)
      setInsights(insightsData)
    } catch {
      // keep UI responsive; panel will refresh on next load
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards - Responsive Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {(overview?.kpis ?? []).slice(0, 4).map((kpi) => {
          const Icon = kpiIconMap[kpi.label as keyof typeof kpiIconMap] ?? CalendarDays
          return (
            <KPICard
              key={kpi.label}
              title={kpi.label}
              value={kpi.value}
              change={kpi.change}
              changeType={kpi.changeType}
              icon={Icon}
            />
          )
        })}
      </div>

      {/* Role-specific dashboards */}
      {(role === 'admin' || role === 'finance') && canApprove('costing') && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Pending Approvals
              </CardTitle>
              <Badge variant="warning">{pendingApprovals.length} pending</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                      <span className="font-medium">{item.event}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Submitted by {item.submittedBy} on {item.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gold-600">{formatCurrency(item.amount)}</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => void handleApprovalAction(item.id, false)}>
                        Reject
                      </button>
                      <button className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors" onClick={() => void handleApprovalAction(item.id, true)}>
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Tabs - Venue, Event, Team wise */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="venue">Venue-wise</TabsTrigger>
          <TabsTrigger value="events">Event-wise</TabsTrigger>
          {(role === 'admin' || role === 'production_manager') && (
            <TabsTrigger value="team">Team-wise</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Charts Row */}
          <div className="grid gap-4 lg:grid-cols-3">
            <RevenueChart />
            <EventStatusChart />
          </div>

          {/* Activity & Deadlines Row */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ActivityPanel />
            <DeadlinesPanel />
          </div>
        </TabsContent>

        <TabsContent value="venue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {venueMetrics.map((venue) => (
              <Card key={venue.venue}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gold-500" />
                        <h3 className="font-semibold text-sm sm:text-base">{venue.venue}</h3>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Events</p>
                          <p className="text-lg sm:text-xl font-bold">{venue.events}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="text-lg sm:text-xl font-bold text-gold-600">
                            {formatCurrency(venue.revenue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Utilization</span>
                      <span className="font-medium">{venue.utilization}%</span>
                    </div>
                    <Progress value={venue.utilization} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Active Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Event</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Venue</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Budget</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.filter(e => e.status !== 'completed').map((event) => (
                      <tr key={event.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-sm">{event.name}</p>
                            <p className="text-xs text-muted-foreground">{event.date}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">{event.venue.split(',')[0]}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={
                            event.status === 'setup' ? 'success' :
                            event.status === 'production' ? 'warning' :
                            'secondary'
                          } className="text-xs capitalize">
                            {event.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right hidden sm:table-cell">
                          <span className="text-sm font-medium">{formatCurrency(event.budget)}</span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="text-sm">{event.assignedTo.split(' ')[0]}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {teamMetrics.map((member) => (
              <Card key={member.name}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-100 text-gold-700 font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold">{member.rating}</span>
                        <span className="text-amber-500">★</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-muted p-2">
                      <p className="text-xs text-muted-foreground">Assigned</p>
                      <p className="text-lg font-bold">{member.tasks}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-2">
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-lg font-bold text-emerald-600">{member.completed}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <p className="text-xs text-muted-foreground">Rate</p>
                      <p className="text-lg font-bold">{Math.round((member.completed / member.tasks) * 100)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats for specific roles */}
      {roleCardTitle && roleStats.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">{roleCardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {roleStats.map((item) => (
                <div
                  key={item.label}
                  className={
                    item.tone === 'success'
                      ? 'text-center p-4 rounded-xl bg-emerald-50'
                      : item.tone === 'warning'
                        ? 'text-center p-4 rounded-xl bg-amber-50'
                        : 'text-center p-4 rounded-xl bg-muted'
                  }
                >
                  <p className={item.tone === 'success' ? 'text-2xl font-bold text-emerald-600' : item.tone === 'warning' ? 'text-2xl font-bold text-amber-600' : 'text-2xl font-bold'}>
                    {item.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
