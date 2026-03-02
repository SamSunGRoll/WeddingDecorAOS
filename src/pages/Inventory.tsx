import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  Box,
  Calendar,
  Truck,
  BarChart3,
} from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import {
  api,
  type InventoryForecastResponse,
  type InventoryItemResponse,
  type InventoryRecommendationResponse,
} from '@/lib/api'

export function Inventory() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemResponse[]>([])
  const [forecastData, setForecastData] = useState<InventoryForecastResponse[]>([])
  const [recommendations, setRecommendations] = useState<InventoryRecommendationResponse[]>([])
  const [propCategories, setPropCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '',
    category: '',
    totalQuantity: 0,
    value: 0,
    location: '',
  })
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)
  const { canEdit } = useAuth()

  const loadInventoryData = () => {
    return Promise.all([
      api.getInventoryItems(),
      api.getInventoryForecast(),
      api.getInventoryRecommendations(),
      api.getMeta(),
    ])
      .then(([items, forecast, recommendationData, meta]) => {
        setInventoryItems(items)
        setForecastData(forecast)
        setRecommendations(recommendationData)
        setPropCategories(meta.propCategories || [])
      })
      .catch(() => {
        setInventoryItems([])
        setForecastData([])
        setRecommendations([])
        setPropCategories([])
      })
  }

  useEffect(() => {
    void loadInventoryData()
  }, [])

  const handleCreateItem = async () => {
    if (!addForm.name || !addForm.category || !addForm.location || addForm.totalQuantity <= 0 || addForm.value <= 0) {
      setAddError('Please fill all fields with valid values.')
      return
    }
    setAdding(true)
    setAddError('')
    try {
      await api.createInventoryItem({
        name: addForm.name,
        category: addForm.category,
        totalQuantity: addForm.totalQuantity,
        value: addForm.value,
        location: addForm.location,
      })
      await loadInventoryData()
      setAddOpen(false)
      setAddForm({ name: '', category: '', totalQuantity: 0, value: 0, location: '' })
    } catch {
      setAddError('Could not add inventory item.')
    } finally {
      setAdding(false)
    }
  }

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalValue = inventoryItems.reduce((sum, item) => sum + item.value, 0)
  const lowStockItems = inventoryItems.filter((item) => item.available / item.totalQuantity < 0.3)
  const needsRepairItems = inventoryItems.filter((item) => item.condition === 'needs_repair' || item.condition === 'fair')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Items</p>
                <p className="mt-1 text-xl sm:text-2xl font-bold">{inventoryItems.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {inventoryItems.reduce((sum, i) => sum + i.totalQuantity, 0)} units
                </p>
              </div>
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-100">
                <Box className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Value</p>
                <p className="mt-1 text-xl sm:text-2xl font-bold">{formatCurrency(totalValue)}</p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +8% this quarter
                </p>
              </div>
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-emerald-100">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Low Stock</p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-amber-600">{lowStockItems.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Items need restocking</p>
              </div>
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-amber-100">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Needs Repair</p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-red-600">{needsRepairItems.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Items need attention</p>
              </div>
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-red-100">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          {canEdit('inventory') && (
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Inventory Item</DialogTitle>
                  <DialogDescription>Add a new prop or equipment to inventory</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Item Name</label>
                    <Input placeholder="e.g., Crystal Chandelier" value={addForm.name} onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select value={addForm.category} onValueChange={(value) => setAddForm((prev) => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {propCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Quantity</label>
                      <Input type="number" placeholder="0" value={addForm.totalQuantity || ''} onChange={(e) => setAddForm((prev) => ({ ...prev, totalQuantity: Number(e.target.value) || 0 }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Value (₹)</label>
                      <Input type="number" placeholder="0" value={addForm.value || ''} onChange={(e) => setAddForm((prev) => ({ ...prev, value: Number(e.target.value) || 0 }))} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Location</label>
                      <Input placeholder="Warehouse A" value={addForm.location} onChange={(e) => setAddForm((prev) => ({ ...prev, location: e.target.value }))} />
                    </div>
                  </div>
                  {addError && <p className="text-sm text-red-600">{addError}</p>}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                  <Button onClick={() => void handleCreateItem()} disabled={adding}>{adding ? 'Adding...' : 'Add Item'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <TabsContent value="inventory" className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {propCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Stock</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground hidden md:table-cell">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Next Booking</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground hidden sm:table-cell">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const stockPercent = (item.available / item.totalQuantity) * 100
                      const isLowStock = stockPercent < 30

                      return (
                        <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground sm:hidden">{item.category}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-center gap-1">
                              <span className={cn(
                                "text-sm font-medium",
                                isLowStock && "text-amber-600"
                              )}>
                                {item.available}/{item.totalQuantity}
                              </span>
                              <Progress value={stockPercent} className="h-1.5 w-16" />
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-center">
                            <Badge variant={
                              item.condition === 'excellent' ? 'success' :
                              item.condition === 'good' ? 'secondary' :
                              item.condition === 'fair' ? 'warning' : 'error'
                            } className="text-xs capitalize">
                              {item.condition.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {item.nextBooking ? (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {item.nextBooking}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell">
                            <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Demand Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecastData.map((data) => {
                    const isShortage = data.required > data.available
                    return (
                      <div key={data.month} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{data.month}</span>
                          {isShortage && (
                            <Badge variant="error" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Shortage
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Required: </span>
                            <span className="font-medium">{data.required} events</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Capacity: </span>
                            <span className={cn("font-medium", isShortage && "text-red-600")}>
                              {data.available} events
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={Math.min((data.available / data.required) * 100, 100)}
                          className={cn("h-2 mt-2", isShortage && "[&>div]:bg-red-500")}
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.map((item) => {
                  const isWarning = item.severity === 'warning'
                  const isError = item.severity === 'error'
                  const isSuccess = item.severity === 'success'
                  const Icon = isError ? AlertTriangle : isWarning ? Truck : isSuccess ? Package : TrendingUp
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'rounded-lg border p-4',
                        isError && 'border-red-200 bg-red-50',
                        isWarning && 'border-amber-200 bg-amber-50',
                        isSuccess && 'border-emerald-200 bg-emerald-50',
                        !isError && !isWarning && !isSuccess && 'border-blue-200 bg-blue-50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className={cn(
                            'h-5 w-5 mt-0.5',
                            isError && 'text-red-600',
                            isWarning && 'text-amber-600',
                            isSuccess && 'text-emerald-600',
                            !isError && !isWarning && !isSuccess && 'text-blue-600'
                          )}
                        />
                        <div>
                          <p
                            className={cn(
                              'font-medium',
                              isError && 'text-red-800',
                              isWarning && 'text-amber-800',
                              isSuccess && 'text-emerald-800',
                              !isError && !isWarning && !isSuccess && 'text-blue-800'
                            )}
                          >
                            {item.title}
                          </p>
                          <p
                            className={cn(
                              'text-sm mt-1',
                              isError && 'text-red-700',
                              isWarning && 'text-amber-700',
                              isSuccess && 'text-emerald-700',
                              !isError && !isWarning && !isSuccess && 'text-blue-700'
                            )}
                          >
                            {item.message}
                          </p>
                          <Button size="sm" variant="outline" className="mt-2">
                            {item.actionLabel}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
