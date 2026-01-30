<!-- ========================================
// FILE: components/UserView.vue
======================================== -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Recipient, BackendStatus } from '~/scripts/models';

const props = defineProps<{
  procoreContext: any
  backendStatus: BackendStatus | null
  error: string | null
}>()

const authToken = ref<string | null>(null)
const debugEnabled = ref(false)
const sending = ref(false)
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
        headers: { 'bearer-token': authToken.value ?? '' },
        body: JSON.stringify({
          form: form.value,
          context: props.procoreContext,
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

async function handleInit() {
  localError.value = null
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
      'https://signiflow-procore-backend-net.onrender.com/api/init',
      {
        method: 'POST',
        headers: {
          'company-id': props.procoreContext.company_id,
          'project-id': props.procoreContext.project_id,
          'object-id': props.procoreContext.object_id
        },
      }
    )

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || data.message || 'An error has occured. Please try again.')
    }

    const data = await res.json()
    if (data.token) {
      authToken.value = data.token
    }
    console.log(data.token)
  } catch (err: any) {
    localError.value = err.message || 'An error has occured. Please try again.'
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  handleInit()
  if (authToken.value) getRecipients()
})

async function getRecipients() {
  localError.value = null
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
      `https://signiflow-procore-backend-net.onrender.com/api/recipients`,
      {
        method: 'GET',
        headers: {
          'company-id': props.procoreContext.company_id,
          'project-id': props.procoreContext.project_id,
          'bearer-token': authToken.value ?? ''
        }
      }
    )
    const data = await res.json()
    if (!res.ok) {
      localError.value = `Error sending to backend: HTTP ${res.status}`
      throw new Error(`${data.error ?? `HTTP ${res.status}`}`)
    }

    if (!data.signers) {
      console.error(["Invalid recipients data from backend:", data])
      throw new Error('Invalid recipients data from backend')
    }
    generalContractorSigners.value = data.signers
  } catch (err: any) {
    localError.value = err.message ?? 'Send failed'
  }
}

const displayError = computed(() => props.error || localError.value)
</script>

<template>
  <div>
    <SigniflowHeader />
    <h3>Send contract to recipient via Signiflow.</h3>
    <ErrorMessage v-if="displayError" :message="displayError" />

    <SigniflowForm v-model:form="form" :procoreContext="procoreContext"
      :generalContractorSigners="generalContractorSigners" :sending="sending" :send-result="sendResult"
      @submit="sendToBackend" />

    <div hidden="true">
      <DebugPanel v-model:enabled="debugEnabled" :backendStatus="backendStatus" :procoreContext="procoreContext"
        :error="displayError" />
    </div>
  </div>
</template>

<!-- ========================================
// END FILE: components/UserView.vue
======================================== -->