import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  Trash2,
  Download,
  History,
  CheckCircle,
  Clock,
  FileText,
  ChevronRight,
  Save,
  Send,
} from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import type { CostItem, CostCategory, CostSheet, Event } from '@/types'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

const categories: { value: CostCategory; label: string }[] = [
  { value: 'flowers', label: 'Flowers' },
  { value: 'fabric', label: 'Fabric' },
  { value: 'props', label: 'Props' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'labour', label: 'Labour' },
  { value: 'transport', label: 'Transport' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
]

const statusConfig = {
  draft: { label: 'Draft', variant: 'secondary' as const, icon: FileText },
  pending_approval: { label: 'Pending Approval', variant: 'warning' as const, icon: Clock },
  approved: { label: 'Approved', variant: 'success' as const, icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'error' as const, icon: Trash2 },
}

export function CostingEngine() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [costItems, setCostItems] = useState<CostItem[]>([])
  const [costSheets, setCostSheets] = useState<CostSheet[]>([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [items, setItems] = useState<CostItem[]>([])
  const [margin, setMargin] = useState(25)
  const [showHistory, setShowHistory] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({
    category: '' as CostCategory | '',
    name: '',
    unit: '',
    quantity: 0,
    unitPrice: 0,
  })

  useEffect(() => {
    void Promise.all([api.getEvents(), api.getCostItems(), api.getCostSheets()])
      .then(([eventsData, costItemsData, costSheetsData]) => {
        setEvents(eventsData)
        setCostItems(costItemsData)
        setCostSheets(costSheetsData)
        const eventFromQuery = searchParams.get('event')
        const matchedEvent = eventsData.find((event) => event.id === eventFromQuery)
        if (matchedEvent) {
          setSelectedEvent(matchedEvent.id)
        } else if (eventsData.length > 0) {
          setSelectedEvent(eventsData[0].id)
        }
      })
      .catch(() => {
        setEvents([])
        setCostItems([])
        setCostSheets([])
      })
  }, [searchParams])

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const marginAmount = (subtotal * margin) / 100
  const total = subtotal + marginAmount

  const handleQuantityChange = (id: string, quantity: number) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
          : item
      )
    )
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const currentSheet = useMemo(
    () => costSheets.find((cs) => cs.eventId === selectedEvent),
    [costSheets, selectedEvent]
  )
  const eventSheetHistory = useMemo(
    () =>
      costSheets
        .filter((sheet) => sheet.eventId === selectedEvent)
        .sort((a, b) => b.version - a.version),
    [costSheets, selectedEvent]
  )

  useEffect(() => {
    if (!selectedEvent) return
    if (currentSheet) {
      setItems(currentSheet.items)
      setMargin(currentSheet.margin)
      return
    }
    setItems(costItems.slice(0, 10))
    setMargin(25)
  }, [selectedEvent, currentSheet, costItems])

  const status = currentSheet?.status || 'draft'
  const StatusIcon = statusConfig[status].icon

  const refreshCostSheets = async () => {
    const latest = await api.getCostSheets()
    setCostSheets(latest)
  }

  const persistCostSheet = async (targetStatus: 'draft' | 'pending_approval') => {
    if (!selectedEvent || items.length === 0 || !user) return
    setSaving(true)
    setSaveMessage('')
    try {
      await api.createCostSheet({
        eventId: selectedEvent,
        margin,
        items: items.map((item) => ({
          category: item.category,
          name: item.name,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes,
        })),
        createdBy: user.name,
        status: targetStatus,
      })
      await refreshCostSheets()
      setSaveMessage(targetStatus === 'draft' ? 'Draft saved successfully.' : 'Submitted for approval.')
    } catch {
      setSaveMessage('Could not save cost sheet. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const downloadBlob = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    const rows = [
      ['Category', 'Item', 'Unit', 'Quantity', 'Unit Price', 'Total'],
      ...items.map((item) => [
        item.category,
        item.name,
        item.unit,
        String(item.quantity),
        String(item.unitPrice),
        String(item.totalPrice),
      ]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
    downloadBlob(csv, `cost-sheet-${selectedEvent || 'event'}.csv`, 'text/csv;charset=utf-8;')
  }

  const handleAddItem = () => {
    if (!addForm.category || !addForm.name || !addForm.unit || addForm.quantity <= 0 || addForm.unitPrice <= 0) {
      setSaveMessage('Please provide valid values to add an item.')
      return
    }
    setItems((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        category: addForm.category as CostCategory,
        name: addForm.name,
        unit: addForm.unit,
        quantity: addForm.quantity,
        unitPrice: addForm.unitPrice,
        totalPrice: addForm.quantity * addForm.unitPrice,
      },
    ])
    setAddForm({ category: '', name: '', unit: '', quantity: 0, unitPrice: 0 })
    setSaveMessage('')
    setAddOpen(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
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
          <Badge variant={statusConfig[status].variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusConfig[status].label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
            <History className="mr-2 h-4 w-4" />
            Version History
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Cost Sheet */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Cost Sheet Builder</CardTitle>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Cost Item</DialogTitle>
                    <DialogDescription>
                      Add a new item to the cost sheet
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select value={addForm.category} onValueChange={(value) => setAddForm((prev) => ({ ...prev, category: value as CostCategory }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Item Name</label>
                      <Input placeholder="e.g., Red Roses" value={addForm.name} onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Unit</label>
                        <Input placeholder="kg" value={addForm.unit} onChange={(e) => setAddForm((prev) => ({ ...prev, unit: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Quantity</label>
                        <Input type="number" placeholder="0" value={addForm.quantity || ''} onChange={(e) => setAddForm((prev) => ({ ...prev, quantity: Number(e.target.value) || 0 }))} />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Unit Price</label>
                        <Input type="number" placeholder="0" value={addForm.unitPrice || ''} onChange={(e) => setAddForm((prev) => ({ ...prev, unitPrice: Number(e.target.value) || 0 }))} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAddItem}>Add Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Table using HTML table for proper layout */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-24">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-28">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground w-28">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground w-32">Total</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => {
                    const categoryItems = items.filter((item) => item.category === category.value)
                    if (categoryItems.length === 0) return null

                    return (
                      <>
                        <tr key={category.value} className="bg-muted/30">
                          <td colSpan={6} className="px-4 py-2">
                            <span className="text-sm font-semibold text-foreground">
                              {category.label}
                            </span>
                          </td>
                        </tr>
                        {categoryItems.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-border/50 transition-colors hover:bg-muted/30"
                          >
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium">{item.name}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-muted-foreground">{item.unit}</span>
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(item.id, parseInt(e.target.value) || 0)
                                }
                                className="h-8 w-20"
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm text-muted-foreground">
                                {formatCurrency(item.unitPrice)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-medium">
                                {formatCurrency(item.totalPrice)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </>
                    )
                  })}
                </tbody>
                {items.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/50">
                      <td colSpan={4} className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold">Subtotal</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold">{formatCurrency(subtotal)}</span>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">No items added</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start building your cost sheet by adding items
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Margin</span>
                  <Select
                    value={margin.toString()}
                    onValueChange={(v) => setMargin(parseInt(v))}
                  >
                    <SelectTrigger className="h-7 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[15, 20, 22, 25, 30, 35].map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          {m}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-sm font-medium">{formatCurrency(marginAmount)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-gold-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" disabled={saving || !user || items.length === 0} onClick={() => void persistCostSheet('draft')}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button className="w-full" variant="gold" disabled={saving || !user || items.length === 0} onClick={() => void persistCostSheet('pending_approval')}>
                <Send className="mr-2 h-4 w-4" />
                Submit for Approval
              </Button>
            </CardContent>
          </Card>

          {/* Version History Sidebar */}
          <Card className={cn(!showHistory && 'hidden')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Version History</CardTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowHistory(false)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {eventSheetHistory.map((sheet) => (
                <div
                  key={sheet.id}
                  className={cn(
                    'rounded-lg border p-3 transition-colors cursor-pointer',
                    sheet.id === currentSheet?.id ? 'border-gold-300 bg-gold-50' : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Version {sheet.version}</span>
                    {sheet.id === currentSheet?.id && (
                      <Badge variant="gold" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {statusConfig[sheet.status].label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(sheet.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {eventSheetHistory.length === 0 && (
                <p className="text-xs text-muted-foreground">No cost sheet versions found for this event.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
