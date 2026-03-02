import type {
  Activity,
  CostItem,
  CostSheet,
  Deadline,
  Design,
  Event,
  Notification,
  User,
  WorkflowStage,
} from '@/types'

export interface DashboardOverview {
  kpis: Array<{
    label: string
    value: string | number
    change?: number
    changeType?: 'increase' | 'decrease'
  }>
  revenueData: Array<Record<string, string | number>>
  eventStatusData: Array<Record<string, string | number>>
  costVarianceData: Array<Record<string, string | number>>
  materialUsageData: Array<Record<string, string | number>>
  resourceUtilizationData: Array<Record<string, string | number>>
}

export interface DashboardInsightsResponse {
  venueMetrics: Array<{
    venue: string
    events: number
    revenue: number
    utilization: number
  }>
  teamMetrics: Array<{
    name: string
    role: string
    tasks: number
    completed: number
    rating: number
  }>
  pendingApprovals: Array<{
    id: string
    type: string
    event: string
    amount: number
    submittedBy: string
    date: string
  }>
  roleStats: Record<
    string,
    Array<{
      label: string
      value: string | number
      tone: 'default' | 'success' | 'warning'
    }>
  >
}

export interface MaterialEstimationResponse {
  eventId: string
  estimatedTotal: number
  actualTotal: number
  variancePercent: number
  flowers: Array<Record<string, string | number | null>>
  fabrics: Array<Record<string, string | number | null>>
  props: Array<Record<string, string | number | null>>
}

export interface InventoryItemResponse {
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

export interface InventoryForecastResponse {
  month: string
  required: number
  available: number
}

export interface InventoryRecommendationResponse {
  id: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
  actionLabel: string
}

export interface AIFeatureResponse {
  id: string
  title: string
  description: string
  iconKey: string
  status: 'coming_soon' | 'in_development' | 'beta' | 'available'
  progress: number
  benefits: string[]
  expectedDate?: string
}

export interface AIIntegrationResponse {
  id: string
  name: string
  iconKey: string
  status: string
}

export interface AIRoadmapResponse {
  features: AIFeatureResponse[]
  integrations: AIIntegrationResponse[]
}

export interface CostSheetCreatePayload {
  eventId: string
  margin: number
  items: Array<{
    category: string
    name: string
    unit: string
    quantity: number
    unitPrice: number
    notes?: string
  }>
  createdBy: string
  status?: 'draft' | 'pending_approval' | 'approved' | 'rejected'
}

export interface InventoryItemCreatePayload {
  name: string
  category: string
  totalQuantity: number
  value: number
  location: string
  condition?: 'excellent' | 'good' | 'fair' | 'needs_repair'
  nextBooking?: string
}

export interface EstimationTrackerRowResponse {
  id: string
  element?: string
  referencePicture?: string
  material: string
  sizeFt?: string
  qty?: number
  sourceType?: string
  unitPricing?: string
  area?: string
  rate?: number
  comments?: string
  category: string
  computedQuantity: number
  computedUnit: string
  lineTotal: number
}

export interface EstimationTrackerResponse {
  eventId: string
  margin: number
  rowCount: number
  subtotal: number
  marginAmount: number
  total: number
  rows: EstimationTrackerRowResponse[]
  source: 'default_template' | 'saved'
}

export interface EstimationImageUploadResponse {
  referencePicture: string
}

export interface MetaResponse {
  themes: string[]
  venues: string[]
  venueTypes: string[]
  colorPalettes: string[]
  flowerTypes: Array<Record<string, string | number>>
  fabricTypes: Array<Record<string, string | number>>
  propCategories: string[]
}

export interface LoginResponse {
  accessToken: string
  tokenType: 'bearer'
  user: User
  expiresAt: string
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'
let authToken = localStorage.getItem('tiein_access_token')

export function setAuthToken(token: string | null) {
  authToken = token
  if (token) {
    localStorage.setItem('tiein_access_token', token)
  } else {
    localStorage.removeItem('tiein_access_token')
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  requiresAuth = false
): Promise<T> {
  const headers = new Headers(init.headers)
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if ((requiresAuth || authToken) && authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API ${response.status}: ${path} ${text}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getUsers: () => request<User[]>('/users'),
  getEvents: () => request<Event[]>('/events'),
  getWorkflowStages: () => request<WorkflowStage[]>('/workflow/stages'),
  getCostItems: () => request<CostItem[]>('/cost-items'),
  getCostSheets: () => request<CostSheet[]>('/cost-sheets'),
  getActivities: () => request<Activity[]>('/activities'),
  getDeadlines: () => request<Deadline[]>('/deadlines'),
  getNotifications: () => request<Notification[]>('/notifications'),
  getDashboardOverview: () => request<DashboardOverview>('/dashboard/overview'),
  getDashboardInsights: () => request<DashboardInsightsResponse>('/dashboard/insights'),
  getDesigns: () => request<Design[]>('/designs'),
  getMeta: () => request<MetaResponse>('/meta'),
  getMaterialEstimation: (eventId: string) =>
    request<MaterialEstimationResponse>(`/material-estimation/${eventId}`),
  getInventoryItems: () => request<InventoryItemResponse[]>('/inventory/items'),
  getInventoryForecast: () => request<InventoryForecastResponse[]>('/inventory/forecast'),
  getInventoryRecommendations: () =>
    request<InventoryRecommendationResponse[]>('/inventory/recommendations'),
  getAIRoadmap: () => request<AIRoadmapResponse>('/ai/roadmap'),

  createEvent: (payload: unknown) =>
    request<Event>('/events', { method: 'POST', body: JSON.stringify(payload) }, true),
  createCostSheet: (payload: CostSheetCreatePayload) =>
    request<CostSheet>('/cost-sheets', { method: 'POST', body: JSON.stringify(payload) }, true),
  approveCostSheet: (sheetId: string, approvedBy: string, approved = true) =>
    request<CostSheet>(
      `/cost-sheets/${sheetId}/approve`,
      { method: 'POST', body: JSON.stringify({ approvedBy, approved }) },
      true
    ),
  createInventoryItem: (payload: InventoryItemCreatePayload) =>
    request<InventoryItemResponse>('/inventory/items', { method: 'POST', body: JSON.stringify(payload) }, true),
  duplicateDesign: (designId: string) =>
    request<Design>(`/designs/${designId}/duplicate`, { method: 'POST' }, true),
  getEstimationTracker: (eventId: string) =>
    request<EstimationTrackerResponse>(`/estimation-tracker/${eventId}`),
  saveEstimationTracker: (eventId: string, payload: { rows: EstimationTrackerRowResponse[]; margin: number }) =>
    request<EstimationTrackerResponse>(
      `/estimation-tracker/${eventId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      true
    ),
  createCostSheetFromEstimation: (eventId: string, margin: number, createdBy: string) =>
    request<CostSheet>(
      `/estimation-tracker/${eventId}/create-cost-sheet?margin=${encodeURIComponent(margin)}&created_by=${encodeURIComponent(createdBy)}`,
      { method: 'POST' },
      true
    ),
  uploadEstimationRowImage: (eventId: string, rowId: string, file: File) => {
    const form = new FormData()
    form.append('image', file)
    return request<EstimationImageUploadResponse>(
      `/estimation-tracker/${eventId}/rows/${rowId}/image`,
      { method: 'POST', body: form },
      true
    )
  },
  updateEventStatus: (eventId: string, status: string) =>
    request<Event>(
      `/events/${eventId}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      true
    ),
}
