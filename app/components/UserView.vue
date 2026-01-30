<!-- ========================================
// FILE: components/UserView.vue
======================================== -->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Recipient, BackendStatus } from '~/scripts/models';

const props = defineProps<{
  procoreContext: any
  backendStatus: BackendStatus | null
  error: string | null
}>()

const authToken = ref<string | null>(null)
const debugEnabled = ref(false)
const sending = ref(false)
const loading = ref(true)
const sendResult = ref<string | null>(null)
const localError = ref<string | null>(null)
const generalContractorSigners = ref<Recipient[]>([])

const form = ref({
  generalContractorSigner: null,
  subContractorSigner: null,
  customMessage: ''
})

const isAuthenticated = computed(
  () => props.backendStatus?.authenticated === true
)
const displayError = computed(() => props.error || localError.value)

async function handleInit() {
  localError.value = null
  loading.value = true
  
  if (
    !isAuthenticated.value &&
    (props.backendStatus?.nextExpiresAt ?? new Date() < new Date())
  ) {
    localError.value = 'Not authenticated with backend'
    loading.value = false
    return
  }
  
  try {
    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/api/init',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'company-id': props.procoreContext.company_id,
          'project-id': props.procoreContext.project_id,
          'object-id': props.procoreContext.object_id
        },
      }
    )

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || data.message || 'An error has occurred. Please try again.')
    }

    const data = await res.json()
    if (data.token) {
      authToken.value = data.token
    }
    console.log('Init token:', data.token)
  } catch (err: any) {
    localError.value = err.message || 'An error has occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

async function getRecipients() {
  if (!authToken.value) {
    console.warn('No auth token available, skipping getRecipients')
    return
  }

  localError.value = null
  loading.value = true
  
  if (
    !isAuthenticated.value &&
    (props.backendStatus?.nextExpiresAt ?? new Date() < new Date())
  ) {
    localError.value = 'Not authenticated with backend'
    loading.value = false
    return
  }

  try {
    const res = await fetch(
      `https://signiflow-procore-backend-net.onrender.com/api/recipients`,
      {
        method: 'GET',
        headers: {
          'company-id': props.procoreContext.company_id,
          'project-id': props.procoreContext.project_id,
          'bearer-token': authToken.value
        }
      }
    )
    const data = await res.json()
    
    if (!res.ok) {
      localError.value = `Error fetching recipients: HTTP ${res.status}`
      throw new Error(`${data.error ?? `HTTP ${res.status}`}`)
    }

    if (data.token) {
      authToken.value = data.token
    }

    if (!data.signers) {
      console.error('Invalid recipients data from backend:', data)
      throw new Error('Invalid recipients data from backend')
    }
    
    generalContractorSigners.value = data.signers
    console.log('Loaded recipients:', data.signers.length)
  } catch (err: any) {
    localError.value = err.message ?? 'Failed to load recipients'
  } finally {
    loading.value = false
  }
}

async function sendToBackend() {
  localError.value = null
  sendResult.value = null
  sending.value = true

  if (
    !isAuthenticated.value &&
    (props.backendStatus?.nextExpiresAt ?? new Date() < new Date())
  ) {
    localError.value = 'Not authenticated with backend'
    sending.value = false
    return
  }

  try {
    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/api/send',
      {
        method: 'POST',
        headers: { 
          'bearer-token': authToken.value ?? '' 
        },
        body: JSON.stringify({
          form: form.value,
          context: props.procoreContext,
        })
      }
    )
    const data = await res.json()
    if (!res.ok) {
      localError.value = 'Failed to send document'
      throw new Error(`${data.error ?? `HTTP ${res.status}`}`)
    }

    if (data.token) {
      authToken.value = data.token
    }

    sendResult.value = 'Sent successfully'
  } catch (err: any) {
    sendResult.value = err.message ?? 'Send failed'
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  await handleInit()
  if (authToken.value) getRecipients()
})
</script>

<template>
  <div class="user-view">
    <SigniflowHeader />
    
    <div class="content-container">
      <h3 class="page-title">Send contract to recipient via Signiflow</h3>
      
      <ErrorMessage v-if="displayError" :message="displayError" :duration="5000" />

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>

      <SigniflowForm 
        v-else
        v-model:form="form" 
        :procore-context="procoreContext"
        :general-contractor-signers="generalContractorSigners" 
        :sending="sending" 
        :send-result="sendResult"
        @submit="sendToBackend" 
      />

      <div 
      hidden="false"
      >
        <DebugPanel 
          v-model:enabled="debugEnabled" 
          :backend-status="backendStatus" 
          :procore-context="procoreContext"
          :error="displayError" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-view {
  min-height: 100vh;
}

.content-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}
</style>

<!-- ========================================
// END FILE: components/UserView.vue
======================================== -->