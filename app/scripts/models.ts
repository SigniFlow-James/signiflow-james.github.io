// ========================================
// FILE: scripts/models.ts
// ========================================

// Auth / Backend status
export interface OAuthInfo {
  authenticated: boolean
  expiresAt?: Date
}

export interface ProcoreContext {
  company_id: number,
  id: number,
  object_id: number,
  procore_api_base_url: string,
  project_id: number,
  route: string,
  view: string
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
  userId: string,
  firstNames: string
  lastName: string
  email: string
}

export interface FormData {
  generalContractorSigner: Recipient | null
  subContractorSigner: Recipient | null
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
  projectId: string | null  // Now optional - null means all projects
  type: 'manual' | 'procore'
  recipient?: Recipient
  region: string | null  // New field for Australian states: NSW, VIC, QLD, SA, WA, TAS, NT, ACT
}

export interface ViewerData {
  viewers: ViewerItem[]
}

export interface FilterType {
  value: number
  label: string
}

export interface ProcoreUserRecipient {
  id: string
  employee_id: string
  job_title: string
  first_name: string
  last_name: string
  email_address: string
}

export type AustralianRegion = 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT'

export interface Project {
  id: string
  name: string
}

// ========================================
// END FILE: scripts/models.ts
// ========================================