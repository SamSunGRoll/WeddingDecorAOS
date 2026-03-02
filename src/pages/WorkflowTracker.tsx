import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  MapPin,
  User,
  IndianRupee,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { formatCurrency, formatDate, getInitials, cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import type { User as AppUser } from '@/types'
import type { Event, EventStatus, WorkflowStage } from '@/types'

const stageConfig: Record<EventStatus, { name: string; color: string }> = {
  design: { name: 'Design', color: 'bg-purple-500' },
  costing: { name: 'Costing', color: 'bg-blue-500' },
  procurement: { name: 'Procurement', color: 'bg-amber-500' },
  production: { name: 'Production', color: 'bg-orange-500' },
  setup: { name: 'Setup', color: 'bg-emerald-500' },
  completed: { name: 'Completed', color: 'bg-slate-500' },
}



export function WorkflowTracker() {
  const navigate = useNavigate()
  const [stages, setStages] = useState<WorkflowStage[]>([])
  const [users, setUsers] = useState<AppUser[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [syncError, setSyncError] = useState('')
  const { canEdit } = useAuth()
  const canMoveEvents = canEdit('workflow')

  useEffect(() => {
    void Promise.all([api.getWorkflowStages(), api.getUsers()])
      .then(([stagesData, usersData]) => {
        setStages(stagesData)
        setUsers(usersData)
      })
      .catch(() => {
        setStages([])
        setUsers([])
      })
  }, [])

  const handleDragEnd = async (result: DropResult) => {
    if (!canMoveEvents) return
    const { source, destination } = result

    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const previousStages = stages.map((stage) => ({
      ...stage,
      events: stage.events.map((event) => ({ ...event })),
    }))

    const sourceStageIndex = stages.findIndex((s) => s.id === source.droppableId)
    const destStageIndex = stages.findIndex((s) => s.id === destination.droppableId)
    if (sourceStageIndex < 0 || destStageIndex < 0) return

    const sourceStage = previousStages[sourceStageIndex]
    const destStage = previousStages[destStageIndex]
    const sourceEvents = [...sourceStage.events]
    const [movedEvent] = sourceEvents.splice(source.index, 1)
    if (!movedEvent) return

    const updatedEvent = { ...movedEvent, status: destination.droppableId as EventStatus }
    const destinationEvents = [...destStage.events]
    destinationEvents.splice(destination.index, 0, updatedEvent)

    const newStages = previousStages.map((stage, index) => {
      if (index === sourceStageIndex) return { ...stage, events: sourceEvents }
      if (index === destStageIndex) return { ...stage, events: destinationEvents }
      return stage
    })

    setSyncError('')
    setStages(newStages)
    if (selectedEvent?.id === movedEvent.id) {
      setSelectedEvent(updatedEvent)
    }

    try {
      await api.updateEventStatus(updatedEvent.id, updatedEvent.status)
    } catch {
      setStages(previousStages)
      if (selectedEvent?.id === movedEvent.id) {
        setSelectedEvent(movedEvent)
      }
      setSyncError('Could not save status update. Your change was rolled back.')
    }
  }

  const getDaysUntilEvent = (date: string) => {
    const eventDate = new Date(date)
    const today = new Date()
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getRiskLevel = (event: Event) => {
    const days = getDaysUntilEvent(event.date)
    if (days < 7 && event.status !== 'completed' && event.status !== 'setup') return 'high'
    if (days < 14 && event.status !== 'completed' && event.status !== 'setup' && event.status !== 'production') return 'medium'
    return 'low'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {syncError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {syncError}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500" />
          <span className="text-sm text-muted-foreground">High Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-amber-500" />
          <span className="text-sm text-muted-foreground">Medium Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500" />
          <span className="text-sm text-muted-foreground">On Track</span>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <div key={stage.id} className="w-80 shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 rounded-full', stageConfig[stage.id].color)} />
                  <h3 className="font-semibold">{stage.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {stage.events.length}
                  </Badge>
                </div>
              </div>

              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'min-h-[500px] rounded-2xl border-2 border-dashed p-2 transition-colors',
                      snapshot.isDraggingOver ? 'border-gold-400 bg-gold-50' : 'border-transparent bg-muted/30'
                    )}
                  >
                    {stage.events.map((event, index) => {
                      const riskLevel = getRiskLevel(event)
                      const daysLeft = getDaysUntilEvent(event.date)
                      const assignedUser = users.find((u) => u.name === event.assignedTo)

                      return (
                        <Draggable
                          key={event.id}
                          draggableId={event.id}
                          index={index}
                          isDragDisabled={!canMoveEvents}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                'mb-2 cursor-grab transition-all',
                                snapshot.isDragging && 'rotate-2 shadow-xl',
                                'hover:shadow-md'
                              )}
                              onClick={() => setSelectedEvent(event)}
                            >
                              <CardContent className="p-4">
                                {/* Risk Indicator */}
                                {riskLevel !== 'low' && (
                                  <div className={cn(
                                    'mb-2 flex items-center gap-1 text-xs font-medium',
                                    riskLevel === 'high' ? 'text-red-600' : 'text-amber-600'
                                  )}>
                                    <AlertTriangle className="h-3 w-3" />
                                    {riskLevel === 'high' ? 'Urgent' : 'At Risk'}
                                  </div>
                                )}

                                <h4 className="font-semibold leading-tight">{event.name}</h4>
                                <p className="mt-1 text-sm text-muted-foreground">{event.client}</p>

                                <div className="mt-3 space-y-2">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{event.venue}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(event.date)}</span>
                                    {daysLeft > 0 && (
                                      <Badge
                                        variant={daysLeft < 7 ? 'error' : daysLeft < 14 ? 'warning' : 'secondary'}
                                        className="ml-auto text-[10px]"
                                      >
                                        {daysLeft}d left
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <Separator className="my-3" />

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={assignedUser?.avatar} />
                                      <AvatarFallback className="text-[10px]">
                                        {getInitials(event.assignedTo)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">
                                      {event.assignedTo.split(' ')[0]}
                                    </span>
                                  </div>
                                  <Badge variant="gold" className="text-[10px]">
                                    {event.theme}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}

                    {stage.events.length === 0 && (
                      <div className="flex h-32 flex-col items-center justify-center text-center">
                        <CheckCircle className="h-8 w-8 text-muted-foreground/40" />
                        <p className="mt-2 text-sm text-muted-foreground">No events</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="gold">{selectedEvent.theme}</Badge>
                  <Badge variant="secondary">{stageConfig[selectedEvent.status].name}</Badge>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">{selectedEvent.client}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Venue</p>
                      <p className="font-medium">{selectedEvent.venue}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Event Date</p>
                      <p className="font-medium">{formatDate(selectedEvent.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <IndianRupee className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium">{formatCurrency(selectedEvent.budget)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{selectedEvent.assignedTo}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" onClick={() => navigate(`/costing?event=${selectedEvent.id}`)}>
                    View Cost Sheet
                  </Button>
                  <Button className="flex-1" variant="gold" onClick={() => navigate(`/materials?event=${selectedEvent.id}`)}>
                    View Details
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
