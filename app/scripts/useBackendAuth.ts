// ========================================
// FILE: scripts/useBackendAuth.ts
// ========================================
import { ref } from 'vue'

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

export function useBackendAuth() {
  const backendStatus = ref<null | BackendStatus>(null)
  const error = ref<string | null>(null)

  function fetchBackendStatus(): boolean {
    fetch('https://signiflow-procore-backend-net.onrender.com/api/oauth/status')
      .then(res => {
        console.log('auth/status response:', res.status)
        return res.json()
      })
      .then(data => {
        console.log('auth/status payload:', data)
        backendStatus.value = data
      })
      .catch(err => {
        console.error('auth/status error:', err)
        error.value = 'Failed to reach backend'
      })

    if (backendStatus.value?.authenticated) {
      return true
    } else {
      return tryRefreshAuth()
    }
  }

  function tryRefreshAuth(): boolean {
    fetch(
      'https://signiflow-procore-backend-net.onrender.com/api/oauth/refresh',
      { method: 'POST' }
    ).then(res => {
      console.log('oauth/refresh response:', res.status)
      return res.json()
    }).then(data => {
      console.log('oauth/refresh payload:', data)
      if (data.refreshed) {
        console.log('🔁 Auth refreshed')
        backendStatus.value = data.auth
      }
      else if (data.loginRequired) {
        error.value = 'AutoAuth failed, manual authentication login required'
      }
      else {
        error.value = 'Refresh failed, (500) server error'
      }
    }).catch(err => {
      console.error('Refresh failed', err)
      error.value = `Refresh failed: ${err}`
    })

    if (backendStatus.value) {
      return true
    } else {
      return false
    }
  }

  return {
    backendStatus,
    error,
    fetchBackendStatus,
    tryRefreshAuth
  }
}

// ========================================
// END FILE: scripts/useBackendAuth.ts
// ========================================