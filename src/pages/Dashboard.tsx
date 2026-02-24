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
import { events } from '@/data/dummy-data'

// Venue-wise metrics
const venueMetrics = [
  { venue: 'Taj Palace, Delhi', events: 8, revenue: 3200000, utilization: 85 },
  { venue: 'ITC Grand Chola', events: 6, revenue: 2400000, utilization: 72 },
  { venue: 'Leela Palace, Jaipur', events: 5, revenue: 2100000, utilization: 68 },
  { venue: 'Oberoi Udaivilas', events: 4, revenue: 2600000, utilization: 90 },
]

// Team metrics
const teamMetrics = [
  { name: 'Rahul Mehta', role: 'Designer', tasks: 12, completed: 10, rating: 4.8 },
  { name: 'Anjali Verma', role: 'Production', tasks: 8, completed: 7, rating: 4.6 },
  { name: 'Vikram Singh', role: 'Procurement', tasks: 15, completed: 14, rating: 4.9 },
  { name: 'Neha Kapoor', role: 'Sales', tasks: 10, completed: 9, rating: 4.7 },
]

// Pending approvals
const pendingApprovals = [
  { id: 1, type: 'Cost Sheet', event: 'Patel-Gupta Reception', amount: 563640, submittedBy: 'Priya Sharma', date: '2024-02-27' },
  { id: 2, type: 'Cost Sheet', event: 'Mehta Sangeet Night', amount: 365400, submittedBy: 'Anjali Verma', date: '2024-02-26' },
  { id: 3, type: 'Material PO', event: 'Sharma-Kapoor Wedding', amount: 125000, submittedBy: 'Vikram Singh', date: '2024-02-28' },
]

export function Dashboard() {
  const { role, canApprove } = useAuth()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards - Responsive Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Events This Month"
          value="12"
          change={15}
          changeType="increase"
          icon={CalendarDays}
          tooltip="Total number of events scheduled for the current month"
        />
        <KPICard
          title="Total Revenue"
          value={formatCurrency(5840000)}
          change={23}
          changeType="increase"
          icon={IndianRupee}
          tooltip="Total revenue from confirmed events this month"
        />
        <KPICard
          title="Avg. Costing Time"
          value="18 min"
          change={-42}
          changeType="increase"
          icon={Clock}
          tooltip="Average time to prepare a cost sheet (down from 48 hours)"
        />
        <KPICard
          title="Material Variance"
          value="4.2%"
          change={-12}
          changeType="increase"
          icon={TrendingDown}
          tooltip="Difference between estimated and actual material usage"
        />
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
                      <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        Reject
                      </button>
                      <button className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
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
      {role === 'designer' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Your Design Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">Designs Created</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold">18</p>
                <p className="text-xs text-muted-foreground">Designs Reused</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-50">
                <p className="text-2xl font-bold text-emerald-600">92%</p>
                <p className="text-xs text-muted-foreground">Approval Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {role === 'procurement' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Procurement Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Active POs</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-amber-50">
                <p className="text-2xl font-bold text-amber-600">3</p>
                <p className="text-xs text-muted-foreground">Pending Delivery</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold">{formatCurrency(450000)}</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-50">
                <p className="text-2xl font-bold text-emerald-600">12%</p>
                <p className="text-xs text-muted-foreground">Cost Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
