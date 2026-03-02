import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { api, type EstimationTrackerRowResponse, type EstimationTrackerResponse } from '@/lib/api'
import type { Event } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useSearchParams } from 'react-router-dom'

export function MaterialEstimation() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [tracker, setTracker] = useState<EstimationTrackerResponse | null>(null)
  const [margin, setMargin] = useState(25)
  const [saving, setSaving] = useState(false)
  const [uploadingRowId, setUploadingRowId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    void api
      .getEvents()
      .then((eventRows) => {
        setEvents(eventRows)
        const eventFromQuery = searchParams.get('event')
        const matched = eventRows.find((event) => event.id === eventFromQuery)
        if (matched) {
          setSelectedEvent(matched.id)
        } else if (eventRows.length > 0) {
          setSelectedEvent(eventRows[0].id)
        }
      })
      .catch(() => setEvents([]))
  }, [searchParams])

  useEffect(() => {
    if (!selectedEvent) return
    void api
      .getEstimationTracker(selectedEvent)
      .then((data) => {
        setTracker(data)
        setMargin(data.margin)
      })
      .catch(() => {
        setTracker(null)
      })
  }, [selectedEvent])

  const updateRow = (id: string, field: keyof EstimationTrackerRowResponse, value: string) => {
    if (!tracker) return
    const nextRows = tracker.rows.map((row) => {
      if (row.id !== id) return row
      if (field === 'qty' || field === 'rate') {
        const numericValue = value === '' ? undefined : Number(value)
        return { ...row, [field]: Number.isFinite(numericValue) ? numericValue : undefined }
      }
      return { ...row, [field]: value }
    })
    setTracker({ ...tracker, rows: nextRows })
  }

  const handleImageUpload = async (rowId: string, file: File | null) => {
    if (!selectedEvent || !tracker || !file) return
    setUploadingRowId(rowId)
    setMessage('')
    try {
      const uploaded = await api.uploadEstimationRowImage(selectedEvent, rowId, file)
      const nextRows = tracker.rows.map((row) =>
        row.id === rowId ? { ...row, referencePicture: uploaded.referencePicture } : row
      )
      setTracker({ ...tracker, rows: nextRows })
      setMessage('Reference picture uploaded.')
    } catch {
      setMessage('Could not upload reference picture.')
    } finally {
      setUploadingRowId(null)
    }
  }

  const recomputedTotals = useMemo(() => {
    if (!tracker) return { subtotal: 0, marginAmount: 0, total: 0 }
    const subtotal = tracker.rows.reduce((sum, row) => sum + Number(row.lineTotal || 0), 0)
    const marginAmount = subtotal * (margin / 100)
    return {
      subtotal,
      marginAmount,
      total: subtotal + marginAmount,
    }
  }, [tracker, margin])

  const handleSave = async () => {
    if (!selectedEvent || !tracker) return
    setSaving(true)
    setMessage('')
    try {
      const saved = await api.saveEstimationTracker(selectedEvent, { rows: tracker.rows, margin })
      setTracker(saved)
      setMargin(saved.margin)
      setMessage('Estimation tracker saved.')
    } catch {
      setMessage('Could not save tracker.')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateDraft = async () => {
    if (!selectedEvent || !user) return
    setSaving(true)
    setMessage('')
    try {
      await api.createCostSheetFromEstimation(selectedEvent, margin, user.name)
      setMessage('Draft cost sheet generated from estimation tracker.')
    } catch {
      setMessage('Could not generate draft cost sheet.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-[320px]">
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

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Margin %</label>
          <Input
            type="number"
            className="w-24"
            min={0}
            max={100}
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value) || 0)}
          />
          <Button variant="outline" onClick={() => void handleSave()} disabled={saving || !tracker}>
            {saving ? 'Saving...' : 'Save Tracker'}
          </Button>
          <Button onClick={() => void handleGenerateDraft()} disabled={saving || !tracker || !user}>
            Generate Draft Sheet
          </Button>
        </div>
      </div>

      {tracker && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Estimation Tracker</CardTitle>
              <Badge variant="secondary" className="capitalize">{tracker.source.replace('_', ' ')}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left">Elements</th>
                    <th className="px-3 py-2 text-left">Reference Picture</th>
                    <th className="px-3 py-2 text-left">Material</th>
                    <th className="px-3 py-2 text-left">Size- ft</th>
                    <th className="px-3 py-2 text-left">Qty</th>
                    <th className="px-3 py-2 text-left">Inventory/Production</th>
                    <th className="px-3 py-2 text-left">Unit Pricing</th>
                    <th className="px-3 py-2 text-left">Area</th>
                    <th className="px-3 py-2 text-left">Rate</th>
                    <th className="px-3 py-2 text-left">Comments</th>
                    <th className="px-3 py-2 text-left">Computed Qty</th>
                    <th className="px-3 py-2 text-left">Unit</th>
                    <th className="px-3 py-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {tracker.rows.map((row) => (
                    <tr key={row.id} className="border-b border-border/50">
                      <td className="px-3 py-2">
                        <Input value={row.element ?? ''} onChange={(e) => updateRow(row.id, 'element', e.target.value)} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex min-w-[180px] flex-col gap-2">
                          {row.referencePicture ? (
                            <img
                              src={row.referencePicture}
                              alt="Reference"
                              className="h-16 w-24 rounded-md border object-cover"
                            />
                          ) : (
                            <div className="h-16 w-24 rounded-md border bg-muted/30" />
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            disabled={saving || uploadingRowId === row.id}
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null
                              void handleImageUpload(row.id, file)
                              e.currentTarget.value = ''
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Input value={row.material ?? ''} onChange={(e) => updateRow(row.id, 'material', e.target.value)} />
                      </td>
                      <td className="px-3 py-2">
                        <Input value={row.sizeFt ?? ''} onChange={(e) => updateRow(row.id, 'sizeFt', e.target.value)} />
                      </td>
                      <td className="px-3 py-2 w-24">
                        <Input type="number" value={row.qty ?? ''} onChange={(e) => updateRow(row.id, 'qty', e.target.value)} />
                      </td>
                      <td className="px-3 py-2">
                        <Input value={row.sourceType ?? ''} onChange={(e) => updateRow(row.id, 'sourceType', e.target.value)} />
                      </td>
                      <td className="px-3 py-2">
                        <Input value={row.unitPricing ?? ''} onChange={(e) => updateRow(row.id, 'unitPricing', e.target.value)} />
                      </td>
                      <td className="px-3 py-2">
                        <Input value={row.area ?? ''} onChange={(e) => updateRow(row.id, 'area', e.target.value)} />
                      </td>
                      <td className="px-3 py-2 w-28">
                        <Input type="number" value={row.rate ?? ''} onChange={(e) => updateRow(row.id, 'rate', e.target.value)} />
                      </td>
                      <td className="px-3 py-2">
                        <Input value={row.comments ?? ''} onChange={(e) => updateRow(row.id, 'comments', e.target.value)} />
                      </td>
                      <td className="px-3 py-2">{row.computedQuantity}</td>
                      <td className="px-3 py-2">{row.computedUnit}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(row.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Subtotal</p>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(recomputedTotals.subtotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Margin Amount</p>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(recomputedTotals.marginAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="mt-1 text-2xl font-bold text-gold-600">{formatCurrency(recomputedTotals.total)}</p>
          </CardContent>
        </Card>
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}
