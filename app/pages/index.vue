<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

/* -----------------------------
   State
----------------------------- */
const backendStatus = ref<null | {
  authenticated: boolean
  expiresAt: number | null
}>(null)

const error = ref<string | null>(null)
const procoreContext = ref<any>(null)

/* UI state */
const debugEnabled = ref(false)
const sending = ref(false)
const sendResult = ref<string | null>(null)

/* Example form fields */
const form = ref({
  name: '',
  email: '',
  customMessage: ''
})

/* Derived helpers */
const isAuthenticated = computed(
  () => backendStatus.value?.authenticated === true
)

/* -----------------------------
   Lifecycle
----------------------------- */
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

  console.log('window.Procore exists:', Boolean((window as any).Procore))
  console.log('window.Procore value:', (window as any).Procore)

  // Backend auth status
  fetch('https://signiflow-backend-test.onrender.com/api/auth/status')
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

  // Procore context listener
  window.addEventListener('procore-message', (msg) => {
    const e = msg as CustomEvent<{
      detail: MessageEvent
    }>
    const event = e.detail.detail
    
    if (event.source === window.self) {
      console.log('⛔ Ignoring self-sent message')
      return
    }
    console.group('📨 postMessage received')
    console.log('origin:', event.origin)
    console.log('source === window.parent:', event.source === window.parent)
    console.log('raw data:', event.data)
    console.groupEnd()

    if (
      event.data?.type === 'context' ||
      event.data?.type === 'app.context'
    ) {
      console.log('✅ Procore context detected')
      procoreContext.value = event.data.context ?? event.data.payload ?? event.data
    }
  })
  console.log('--- message listener attached ---')
})

/* -----------------------------
   Actions
----------------------------- */

async function sendToBackend() {
  sendResult.value = null
  sending.value = true

  try {
    const res = await fetch(
      'https://signiflow-backend-test.onrender.com/api/demo/send',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: form.value,
          context: procoreContext.value
        })
      }
    )

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
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
    <img src="/logo.png" alt="Signiflow Logo" style="max-width: 100%; height: auto;" />
    <h3>Send contract to recipient via Signiflow.</h3>
    <!-- Error -->
    <p v-if="error" style="color: red;">
      {{ error }}
    </p>

    <!-- Main demo UI -->
    <section style="margin-top: 1rem;">
      <label>
        Name<br />
        <input
          v-model="form.name"
          type="text"
          style="width: 100%;"
        />
      </label>

      <label>
        Email<br />
        <input
          v-model="form.email"
          type="text"
          style="width: 100%;"
        />
      </label>

      <label style="display: block; margin-top: 1rem;">
        Custom Message<br />
        <textarea
          v-model="form.customMessage"
          rows="4"
          style="width: 100%;"
        />
      </label>

      <button
        style="margin-top: 1rem;"
        :disabled="!isAuthenticated || !procoreContext || sending"
        @click="sendToBackend"
      >
        {{ sending ? 'Sending…' : 'Send' }}
      </button>

      <p v-if="sendResult" style="margin-top: 0.5rem;">
        {{ sendResult }}
      </p>
    </section>

    <!-- Debug toggle -->
    <section style="margin-top: 2rem;">
      <label>
        <input type="checkbox" v-model="debugEnabled" />
        Show debug info
      </label>
    </section>

    <!-- Debug info -->
    <section v-if="debugEnabled" style="margin-top: 1rem;">
      <h3>Backend Auth Status</h3>
      <pre v-if="backendStatus">{{ backendStatus }}</pre>
      <pre v-else>{{ error }}</pre>
      <h3>Procore Context</h3>
      <pre v-if="procoreContext">{{ procoreContext }}</pre>
      <pre v-else>No Procore context received yet.</pre>
    </section>
  </main>
</template>
