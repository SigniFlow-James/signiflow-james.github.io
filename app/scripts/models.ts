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
