import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Download, FileSpreadsheet, Calendar, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#b8977e', '#d4b896', '#e8d5c4', '#94a3b8', '#cbd5e1']

export function Reports() {
  const [costVarianceData, setCostVarianceData] = useState<Array<Record<string, string | number>>>([])
  const [materialUsageData, setMaterialUsageData] = useState<Array<Record<string, string | number>>>([])
  const [resourceUtilizationData, setResourceUtilizationData] = useState<Array<Record<string, string | number>>>([])
  const [revenueData, setRevenueData] = useState<Array<Record<string, string | number>>>([])

  useEffect(() => {
    void api
      .getDashboardOverview()
      .then((data) => {
        setCostVarianceData(data.costVarianceData)
        setMaterialUsageData(data.materialUsageData)
        setResourceUtilizationData(data.resourceUtilizationData)
        setRevenueData(data.revenueData)
      })
      .catch(() => {
        setCostVarianceData([])
        setMaterialUsageData([])
        setResourceUtilizationData([])
        setRevenueData([])
      })
  }, [])

  const materialSummary = useMemo(() => {
    const totals = materialUsageData.reduce<{ flowers: number; fabric: number; props: number }>(
      (acc, item) => {
        acc.flowers += Number(item.flowers || 0)
        acc.fabric += Number(item.fabric || 0)
        acc.props += Number(item.props || 0)
        return acc
      },
      { flowers: 0, fabric: 0, props: 0 }
    )
    return [
      { label: 'Flowers This Month', value: `${totals.flowers.toFixed(0)} kg` },
      { label: 'Fabric This Month', value: `${totals.fabric.toFixed(0)} m` },
      { label: 'Props This Month', value: `${totals.props.toFixed(0)} units` },
    ]
  }, [materialUsageData])

  const revenueSummary = useMemo(() => {
    const totalRevenue = revenueData.reduce((sum, row) => sum + Number(row.value || 0), 0)
    const totalEvents = revenueData.reduce((sum, row) => sum + Number(row.events || 0), 0)
    const averageEventValue = totalEvents > 0 ? totalRevenue / totalEvents : 0
    const firstValue = Number(revenueData[0]?.value || 0)
    const lastValue = Number(revenueData[revenueData.length - 1]?.value || 0)
    const growthRate = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0
    return {
      totalRevenue,
      averageEventValue,
      totalEvents,
      growthRate,
    }
  }, [revenueData])

  const downloadBlob = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleExportExcel = () => {
    const rows = [
      ['Month', 'Revenue', 'Events'],
      ...revenueData.map((row) => [String(row.name || ''), String(row.value || 0), String(row.events || 0)]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
    downloadBlob(csv, 'revenue-report.csv', 'text/csv;charset=utf-8;')
  }

  const handleDownloadReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      costVarianceData,
      materialUsageData,
      resourceUtilizationData,
      revenueData,
      summary: revenueSummary,
    }
    downloadBlob(JSON.stringify(report, null, 2), 'operations-report.json', 'application/json;charset=utf-8;')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select defaultValue="this-month">
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="gold" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="cost" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cost">Cost Variance</TabsTrigger>
          <TabsTrigger value="materials">Material Usage</TabsTrigger>
          <TabsTrigger value="resources">Resource Utilization</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
        </TabsList>

        {/* Cost Variance Tab */}
        <TabsContent value="cost" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Cost Variance by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costVarianceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal />
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(value) => [formatCurrency(Number(value))]}
                      />
                      <Legend />
                      <Bar dataKey="estimated" name="Estimated" fill="#b8977e" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="actual" name="Actual" fill="#d4b896" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Variance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {costVarianceData.map((item) => {
                  const estimated = item.estimated as number
                  const actual = item.actual as number
                  const variance = ((actual - estimated) / estimated) * 100
                  const isOverBudget = variance > 0

                  return (
                    <div key={item.name} className="rounded-xl border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        <span
                          className={
                            isOverBudget ? 'text-red-600' : 'text-emerald-600'
                          }
                        >
                          {isOverBudget ? '+' : ''}
                          {variance.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                        <span>Est: {formatCurrency(estimated)}</span>
                        <span>Act: {formatCurrency(actual)}</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Material Usage Tab */}
        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Weekly Material Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={materialUsageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="flowers" name="Flowers (kg)" fill="#b8977e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fabric" name="Fabric (m)" fill="#d4b896" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="props" name="Props (units)" fill="#e8d5c4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {materialSummary.map((item) => (
              <Card key={item.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="mt-1 text-2xl font-bold">{item.value}</p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Live</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Resource Utilization Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Team Utilization Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={resourceUtilizationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value) => [`${value}%`]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="designers"
                      name="Designers"
                      stroke="#b8977e"
                      strokeWidth={2}
                      dot={{ fill: '#b8977e', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="production"
                      name="Production"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ fill: '#6366f1', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="procurement"
                      name="Procurement"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Analysis Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#b8977e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#b8977e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#b8977e"
                        strokeWidth={2}
                        dot={{ fill: '#b8977e', strokeWidth: 2, r: 4 }}
                        fill="url(#revenueGradient)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Events by Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="events"
                        nameKey="name"
                        strokeWidth={0}
                      >
                        {revenueData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(value, name) => [
                          `${value} events`,
                          name,
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Revenue (YTD)</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(revenueSummary.totalRevenue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Avg. Event Value</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(revenueSummary.averageEventValue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="mt-1 text-2xl font-bold">{revenueSummary.totalEvents}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {`${revenueSummary.growthRate >= 0 ? '+' : ''}${revenueSummary.growthRate.toFixed(1)}%`}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
