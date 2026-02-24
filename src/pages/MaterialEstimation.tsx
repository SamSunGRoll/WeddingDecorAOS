import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Flower2,
  Scissors,
  Package,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import {
  events,
  flowerEstimations,
  fabricEstimations,
  propEstimations,
  flowerTypes,
  fabricTypes,
} from '@/data/dummy-data'
import { formatCurrency, cn } from '@/lib/utils'

export function MaterialEstimation() {
  const [selectedEvent, setSelectedEvent] = useState(events[0].id)
  const [flowerArea, setFlowerArea] = useState(100)
  const [flowerDensity, setFlowerDensity] = useState<'low' | 'medium' | 'high'>('medium')
  const [fabricWidth, setFabricWidth] = useState(3)
  const [fabricHeight, setFabricHeight] = useState(12)

  const densityMultiplier = { low: 0.5, medium: 1, high: 1.5 }
  const estimatedFlowers = Math.ceil(flowerArea * 0.5 * densityMultiplier[flowerDensity])
  const estimatedFabric = Math.ceil((fabricWidth * fabricHeight) / 1.2)

  const totalEstimated = flowerEstimations.reduce((sum, f) => sum + f.totalPrice, 0) +
    fabricEstimations.reduce((sum, f) => sum + f.totalPrice, 0) +
    propEstimations.reduce((sum, p) => sum + p.totalPrice, 0)

  const totalActual = flowerEstimations.reduce((sum, f) => sum + (f.actualQuantity || f.estimatedQuantity) * f.unitPrice, 0) +
    fabricEstimations.reduce((sum, f) => sum + (f.actualMeters || f.estimatedMeters) * f.unitPrice, 0) +
    propEstimations.reduce((sum, p) => sum + p.totalPrice, 0)

  const variance = ((totalActual - totalEstimated) / totalEstimated) * 100

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Total</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(totalEstimated)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actual Usage</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(totalActual)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Variance</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-2xl font-bold">{variance.toFixed(1)}%</p>
                  {variance > 0 ? (
                    <TrendingUp className="h-5 w-5 text-red-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-emerald-500" />
                  )}
                </div>
              </div>
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl",
                Math.abs(variance) > 10 ? "bg-amber-100" : "bg-emerald-100"
              )}>
                <AlertTriangle className={cn(
                  "h-6 w-6",
                  Math.abs(variance) > 10 ? "text-amber-600" : "text-emerald-600"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calculators */}
      <Tabs defaultValue="flowers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flowers" className="gap-2">
            <Flower2 className="h-4 w-4" />
            Flowers
          </TabsTrigger>
          <TabsTrigger value="fabric" className="gap-2">
            <Scissors className="h-4 w-4" />
            Fabric
          </TabsTrigger>
          <TabsTrigger value="props" className="gap-2">
            <Package className="h-4 w-4" />
            Props
          </TabsTrigger>
        </TabsList>

        {/* Flowers Tab */}
        <TabsContent value="flowers" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr,400px]">
            {/* Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Flower Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Coverage Area (sq ft)</label>
                    <Input
                      type="number"
                      value={flowerArea}
                      onChange={(e) => setFlowerArea(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Density Level</label>
                    <Select value={flowerDensity} onValueChange={(v) => setFlowerDensity(v as 'low' | 'medium' | 'high')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Flower Type</label>
                    <Select defaultValue="roses">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {flowerTypes.map((f) => (
                          <SelectItem key={f.name} value={f.name.toLowerCase()}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="rounded-xl bg-gold-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Estimated Quantity</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Based on {flowerArea} sq ft × {densityMultiplier[flowerDensity]} density factor</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-lg font-bold text-gold-700">{estimatedFlowers} kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estimation Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Estimation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {flowerEstimations.map((item) => {
                    const variancePercent = item.actualQuantity
                      ? ((item.actualQuantity - item.estimatedQuantity) / item.estimatedQuantity) * 100
                      : 0
                    return (
                      <div key={item.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant={Math.abs(variancePercent) > 5 ? 'warning' : 'success'}>
                            {variancePercent > 0 ? '+' : ''}{variancePercent.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Estimated: </span>
                            <span className="font-medium">{item.estimatedQuantity}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Actual: </span>
                            <span className="font-medium">{item.actualQuantity || '—'}</span>
                          </div>
                        </div>
                        <Progress
                          value={item.actualQuantity ? (item.actualQuantity / item.estimatedQuantity) * 100 : 0}
                          className="mt-2 h-1.5"
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fabric Tab */}
        <TabsContent value="fabric" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr,400px]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Fabric Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Width (meters)</label>
                    <Input
                      type="number"
                      value={fabricWidth}
                      onChange={(e) => setFabricWidth(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Height (meters)</label>
                    <Input
                      type="number"
                      value={fabricHeight}
                      onChange={(e) => setFabricHeight(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fabric Type</label>
                    <Select defaultValue="organza">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fabricTypes.map((f) => (
                          <SelectItem key={f.name} value={f.name.toLowerCase()}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="rounded-xl bg-gold-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Estimated Length</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Includes 20% extra for draping and wastage</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-lg font-bold text-gold-700">{estimatedFabric} meters</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Estimation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fabricEstimations.map((item) => {
                    const variancePercent = item.actualMeters
                      ? ((item.actualMeters - item.estimatedMeters) / item.estimatedMeters) * 100
                      : 0
                    return (
                      <div key={item.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant={Math.abs(variancePercent) > 5 ? 'warning' : 'success'}>
                            {variancePercent > 0 ? '+' : ''}{variancePercent.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Estimated: </span>
                            <span className="font-medium">{item.estimatedMeters}m</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Actual: </span>
                            <span className="font-medium">{item.actualMeters ? `${item.actualMeters}m` : '—'}</span>
                          </div>
                        </div>
                        <Progress
                          value={item.actualMeters ? (item.actualMeters / item.estimatedMeters) * 100 : 0}
                          className="mt-2 h-1.5"
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Props Tab */}
        <TabsContent value="props" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Props Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <div className="grid grid-cols-6 gap-4 border-b bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
                  <span>Item</span>
                  <span>Category</span>
                  <span>Required</span>
                  <span>Available</span>
                  <span>To Rent</span>
                  <span>Status</span>
                </div>
                {propEstimations.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-6 items-center gap-4 border-b px-4 py-3 last:border-b-0"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.category}</span>
                    <span className="text-sm">{item.quantity}</span>
                    <span className="text-sm">{item.available}</span>
                    <span className="text-sm">
                      {item.toRent > 0 ? (
                        <span className="text-amber-600">{item.toRent}</span>
                      ) : (
                        '0'
                      )}
                    </span>
                    <Badge variant={item.available >= item.quantity ? 'success' : 'warning'}>
                      {item.available >= item.quantity ? 'In Stock' : 'Rental Needed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
