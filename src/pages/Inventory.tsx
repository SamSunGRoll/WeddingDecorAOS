import { useState } from 'react'
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
import { propCategories } from '@/data/dummy-data'
import { formatCurrency, cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface InventoryItem {
  id: string
  name: string
  category: string
  totalQuantity: number
  available: number
  reserved: number
  inUse: number
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair'
  lastUsed: string
  nextBooking?: string
  value: number
  location: string
}

const inventoryItems: InventoryItem[] = [
  { id: 'inv1', name: 'Crystal Chandeliers', category: 'Lighting', totalQuantity: 12, available: 5, reserved: 4, inUse: 3, condition: 'excellent', lastUsed: '2024-02-25', nextBooking: '2024-03-10', value: 180000, location: 'Warehouse A' },
  { id: 'inv2', name: 'Brass Urlis (Large)', category: 'Decor', totalQuantity: 40, available: 25, reserved: 10, inUse: 5, condition: 'good', lastUsed: '2024-02-20', nextBooking: '2024-03-15', value: 100000, location: 'Warehouse A' },
  { id: 'inv3', name: 'Floral Pillars', category: 'Structure', totalQuantity: 24, available: 16, reserved: 8, inUse: 0, condition: 'excellent', lastUsed: '2024-02-18', value: 240000, location: 'Warehouse B' },
  { id: 'inv4', name: 'King Throne Set', category: 'Furniture', totalQuantity: 4, available: 2, reserved: 1, inUse: 1, condition: 'excellent', lastUsed: '2024-02-22', nextBooking: '2024-03-08', value: 140000, location: 'Warehouse A' },
  { id: 'inv5', name: 'Round Dining Tables', category: 'Furniture', totalQuantity: 100, available: 60, reserved: 25, inUse: 15, condition: 'good', lastUsed: '2024-02-28', nextBooking: '2024-03-05', value: 150000, location: 'Warehouse B' },
  { id: 'inv6', name: 'LED String Lights', category: 'Lighting', totalQuantity: 200, available: 120, reserved: 50, inUse: 30, condition: 'good', lastUsed: '2024-02-26', value: 60000, location: 'Warehouse A' },
  { id: 'inv7', name: 'Vintage Photo Frames', category: 'Props', totalQuantity: 50, available: 35, reserved: 10, inUse: 5, condition: 'fair', lastUsed: '2024-02-15', value: 25000, location: 'Warehouse C' },
  { id: 'inv8', name: 'Mandap Structure', category: 'Structure', totalQuantity: 6, available: 3, reserved: 2, inUse: 1, condition: 'excellent', lastUsed: '2024-02-20', nextBooking: '2024-03-12', value: 300000, location: 'Warehouse A' },
  { id: 'inv9', name: 'Chiavari Chairs', category: 'Furniture', totalQuantity: 500, available: 300, reserved: 150, inUse: 50, condition: 'good', lastUsed: '2024-02-28', nextBooking: '2024-03-05', value: 250000, location: 'Warehouse B' },
  { id: 'inv10', name: 'Flower Vases (Glass)', category: 'Decor', totalQuantity: 80, available: 50, reserved: 20, inUse: 10, condition: 'good', lastUsed: '2024-02-25', value: 40000, location: 'Warehouse C' },
]

const forecastData = [
  { month: 'Mar', required: 45, available: 60 },
  { month: 'Apr', required: 72, available: 60 },
  { month: 'May', required: 85, available: 65 },
  { month: 'Jun', required: 55, available: 70 },
]

export function Inventory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { canEdit } = useAuth()

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
            <Dialog>
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
                    <Input placeholder="e.g., Crystal Chandelier" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select>
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
                      <Input type="number" placeholder="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Value (₹)</label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Location</label>
                      <Input placeholder="Warehouse A" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Add Item</Button>
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
                          <span className="font-medium">{data.month} 2024</span>
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
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Rent Additional Chairs</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Forecast shows 150 chair shortage for April weddings. Recommend renting from vendor.
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        View Vendors
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Restock LED Lights</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Current stock at 60%. Order 100 more units to meet May demand.
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Create PO
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Repair Vintage Frames</p>
                      <p className="text-sm text-red-700 mt-1">
                        15 frames marked as fair condition. Schedule repair before next event.
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Schedule Repair
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
