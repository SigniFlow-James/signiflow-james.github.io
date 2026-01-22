<!-- ========================================
// FILE: components/UserView.vue
======================================== -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  procoreContext: any
  backendStatus: any
  error: string | null
}>()

const debugEnabled = ref(false)
const sending = ref(false)
const sendResult = ref<string | null>(null)
const localError = ref<string | null>(null)

const form = ref({
  manager: null,
  recipient: null,
  firstNames: '',
  lastName: '',
  email: '',
  customMessage: ''
})

const isAuthenticated = computed(
  () => props.backendStatus?.authenticated === true
)

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: form.value,
          context: props.procoreContext
        })
      }
    )
    const data = await res.json()
    if (!res.ok) {
      localError.value = `Error sending to backend: HTTP ${res.status}`
      throw new Error(`${data.error ?? `HTTP ${res.status}`}`)
    }

    sendResult.value = 'Sent successfully'
  } catch (err: any) {
    sendResult.value = err.message ?? 'Send failed'
  } finally {
    sending.value = false
  }
}

const displayError = computed(() => props.error || localError.value)
</script>

<template>
  <div>
    <SigniflowHeader />
    <h3>Send contract to recipient via Signiflow.</h3>
    <ErrorMessage v-if="displayError" :message="displayError" />

    <SigniflowForm 
      v-model:form="form" 
      :procore-context="procoreContext" 
      :managers="backendStatus?.managers || []"
      :recipients="backendStatus?.recipients || []"
      :sending="sending" 
      :send-result="sendResult"
      @submit="sendToBackend" 
    />

    <DebugPanel 
      v-model:enabled="debugEnabled" 
      :backend-status="backendStatus" 
      :procore-context="procoreContext"
      :error="displayError" 
    />
  </div>
</template>

<!-- ========================================
// END FILE: components/UserView.vue
======================================== -->