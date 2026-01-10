<!-- ========================================
// FILE: pages/index.vue
======================================== -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useProcoreContext } from '~/scripts/useProcoreContext'
import { useBackendAuth } from '~/scripts/useBackendAuth'

const { procoreContext, initializeProcoreListener } = useProcoreContext()
const { backendStatus, error, fetchBackendStatus } = useBackendAuth()

const debugEnabled = ref(false)
const sending = ref(false)
const sendResult = ref<string | null>(null)

const form = ref({
  name: '',
  email: '',
  customMessage: ''
})

const isAuthenticated = computed(
  () => backendStatus.value?.authenticated === true
)

onMounted(() => {
  console.log('--- Signiflow side panel mounted ---')

  // Environment diagnostics
  console.log('window.location.href:', window.location.href)
  console.log('window.self === window.top:', window.self === window.top)
  console.log('window.self === window.parent:', window.self === window.parent)

  try {
    console.log('window.parent.location:', window.parent.location.href)
  } catch {
    console.log('window.parent.location: [blocked by browser]')
  }

  fetchBackendStatus()
  initializeProcoreListener()
})

async function sendToBackend() {
  error.value = null
  sendResult.value = null
  sending.value = true

  if (!isAuthenticated.value && !fetchBackendStatus()) {
    error.value = 'Not authenticated with backend'
    sending.value = false
    return
  }

  try {
    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/api/send',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: form.value,
          context: procoreContext.value
        })
      }
    )
    const data = await res.json()
    if (!res.ok) {
      error.value = `Error sending to backend: HTTP ${res.status}}`
      throw new Error(`${data.error ?? `HTTP ${res.status}`}`)
    }

    sendResult.value = 'Sent successfully'
  } catch (err: any) {
    sendResult.value = err.message ?? 'Send failed'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <main style="padding: 1rem; font-family: system-ui;">
    <SigniflowHeader />

    <ErrorMessage v-if="error" :message="error" />

    <SigniflowForm v-model:form="form" :procore-context="procoreContext" :sending="sending" :send-result="sendResult"
      @submit="sendToBackend" />

    <DebugPanel v-model:enabled="debugEnabled" :backend-status="backendStatus" :procore-context="procoreContext"
      :error="error" />
  </main>
</template>

<!-- ========================================
// END FILE: pages/index.vue
======================================== -->