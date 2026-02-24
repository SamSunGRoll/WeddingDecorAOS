export interface Event {
  id: string
  name: string
  client: string
  venue: string
  date: string
  budget: number
  status: EventStatus
  theme: string
  assignedTo: string
  createdAt: string
  updatedAt: string
}

export type EventStatus =
  | 'design'
  | 'costing'
  | 'procurement'
  | 'production'
  | 'setup'
  | 'completed'

export interface CostItem {
  id: string
  category: CostCategory
  name: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
}

export type CostCategory =
  | 'flowers'
  | 'fabric'
  | 'props'
  | 'furniture'
  | 'lighting'
  | 'labour'
  | 'transport'
  | 'miscellaneous'

export interface CostSheet {
  id: string
  eventId: string
  version: number
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  items: CostItem[]
  subtotal: number
  margin: number
  marginAmount: number
  total: number
  createdBy: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string
}

export interface MaterialEstimation {
  id: string
  eventId: string
  flowers: FlowerEstimation[]
  fabrics: FabricEstimation[]
  props: PropEstimation[]
  estimatedTotal: number
  actualTotal?: number
  variance?: number
}

export interface FlowerEstimation {
  id: string
  name: string
  type: 'coverage' | 'garland' | 'arrangement'
  area?: number
  length?: number
  density: 'low' | 'medium' | 'high'
  estimatedQuantity: number
  actualQuantity?: number
  unitPrice: number
  totalPrice: number
}

export interface FabricEstimation {
  id: string
  name: string
  type: 'drape' | 'backdrop' | 'ceiling' | 'table'
  width: number
  height: number
  estimatedMeters: number
  actualMeters?: number
  unitPrice: number
  totalPrice: number
}

export interface PropEstimation {
  id: string
  name: string
  category: string
  quantity: number
  available: number
  toRent: number
  rentalPrice: number
  totalPrice: number
}

export interface Design {
  id: string
  name: string
  imageUrl: string
  tags: string[]
  theme: string
  colors: string[]
  venueType: string
  budget: number
  usageCount: number
  lastUsed?: string
  createdAt: string
  linkedCostSheetId?: string
}

export interface Activity {
  id: string
  type: 'event' | 'costing' | 'approval' | 'material' | 'design'
  title: string
  description: string
  timestamp: string
  user: string
  userAvatar?: string
}

export interface Deadline {
  id: string
  eventId: string
  eventName: string
  task: string
  dueDate: string
  status: 'on_track' | 'at_risk' | 'overdue'
  assignedTo: string
}

export interface KPIData {
  label: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease'
  icon?: string
}

export interface ChartData {
  name: string
  value?: number
  [key: string]: string | number | undefined
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export type UserRole =
  | 'admin'
  | 'designer'
  | 'production_manager'
  | 'procurement'
  | 'sales'
  | 'finance'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  read: boolean
  timestamp: string
}

export interface WorkflowStage {
  id: EventStatus
  name: string
  events: Event[]
}
