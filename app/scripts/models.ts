// ========================================
// FILE: scripts/models.ts
// ========================================

// Auth / Backend status
export interface OAuthInfo {
  authenticated: boolean
  expiresAt?: Date
}

export interface BackendStatus {
  procore?: OAuthInfo
  signiflow?: OAuthInfo
  authenticated?: boolean
  nextExpiresAt?: Date
  error?: string
}

// Filters
export interface FilterItem {
  companyId: string | null
  projectId: string | null
  type: number
  value: any
  include: boolean
}

export interface FilterData {
  filters: FilterItem[]
}

export interface FilterType {
  value: number
  label: string
}

// Recipients / Forms
export interface Recipient {
  First: string
  Last: string
  Email: string
}

export interface FormData {
  manager: Recipient | null
  vendor: Recipient | null
  customMessage: string
}


// UI / Tables
export interface Column<T = any> {
  key: string
  label: string
  computed?: (item: T) => string
}

// Procore entities
export interface Company {
  id: string
  name: string
}

export interface Project {
  id: string
  name: string
}

export interface FilterItem {
  companyId: string | null
  projectId: string | null
  type: number
  value: any
  include: boolean
}

export interface FilterData {
  filters: FilterItem[]
}

export interface ViewerItem {
  companyId: string | null
  projectId: string | null
  type: 'manual' | 'procore'
  userId: string | null  // For Procore users
  firstName: string      // For manual entry
  lastName: string       // For manual entry
  email: string          // For manual entry
}

export interface ViewerData {
  viewers: ViewerItem[]
}

export interface FilterType {
  value: number
  label: string
}

export interface Company {
  id: string
  name: string
}

export interface Project {
  id: string
  name: string
}

export interface ProcoreUserRecipient {
  employee_id: string
  job_title: string
  first_name: string
  last_name: string
  email_address: string
}
// ========================================
// END FILE: scripts/models.ts
// ========================================