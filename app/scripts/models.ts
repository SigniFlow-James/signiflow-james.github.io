interface OAuthInfo {
  authenticated: boolean;
  expiresAt?: Date;
}

export interface BackendStatus {
  procore?: OAuthInfo;
  signiflow?: OAuthInfo;
  authenticated?: boolean;
  nextExpiresAt?: Date;
  error?: string;
}

export interface FilterItem {
  projectId: string
  type: number
  value: any
  include: boolean
}

export interface FilterData {
  users: FilterItem[]
  vendors: FilterItem[]
}

export interface Recipient {
  First: string;
  Last: string;
  Email: string;
}

export interface FormData {
  manager: Recipient | null
  vendor: Recipient | null
  customMessage: string
}

export interface Column {
  key: string
  label: string
  computed?: (item: any) => string
}

export interface FilterType {
  value: number
  label: string
}