interface OAuthInfo {
  authenticated: boolean;
  expiresAt?: Date;
}

export interface Recipient {
  First: string;
  Last: string;
  Email: string;
}

export interface UserInfo {
  procoreUserID?: string; 
  middleManToken?: string;
}

export interface BackendStatus {
  procore?: OAuthInfo;
  signiflow?: OAuthInfo;
  authenticated?: boolean;
  nextExpiresAt?: Date;
  managers?: Recipient[];
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

export interface FormData {
  manager: Recipient | null
  firstNames: string
  lastName: string
  email: string
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