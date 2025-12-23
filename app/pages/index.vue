<script setup lang="ts">
import { ref, onMounted } from 'vue'

const backendStatus = ref<null | {
  authenticated: boolean
  expiresAt: number | null
}>(null)

const error = ref<string | null>(null)
const procoreContext = ref<any>(null)

onMounted(() => {
  console.log('--- Signiflow side panel mounted ---')

  // 1️⃣ Environment diagnostics
  console.log('window.location.href:', window.location.href)
  console.log('window.self === window.top:', window.self === window.top)

  try {
    console.log('window.parent.location:', window.parent.location.href)
  } catch (e) {
    console.log('window.parent.location: [blocked by browser]')
  }

  console.log('window.Procore exists:', Boolean((window as any).Procore))
  console.log('window.Procore value:', (window as any).Procore)

  // 2️⃣ Backend auth check (just to confirm nothing blocks execution)
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
    })

  // 3️⃣ Global message listener (VERY IMPORTANT)
  window.addEventListener('message', (event) => {
    console.group('📨 postMessage received')
    console.log('origin:', event.origin)
    console.log('source === window.parent:', event.source === window.parent)
    console.log('raw data:', event.data)
    console.groupEnd()

    // Capture EVERYTHING for now
    try {
      if (typeof event.data === 'string') {
        // Sometimes JSON comes through as string
        const parsed = JSON.parse(event.data)
        console.log('parsed string data:', parsed)
      }
    } catch (_) {}

    // Try common Procore patterns
    if (event.data?.type) {
      console.log('message type:', event.data.type)
    }

    if (event.data?.payload) {
      console.log('message payload:', event.data.payload)
    }

    // Tentative context capture
    if (
      event.data?.type === 'app.context' ||
      event.data?.type === 'context'
    ) {
      console.log('✅ Procore context detected')
      procoreContext.value = event.data.payload ?? event.data
    }
  })

  console.log('--- message listener attached ---')
})

</script>

<template>
  <main style="padding: 1rem; font-family: system-ui;">
    <h1>Signiflow – Procore Side Panel</h1>
    <p v-if="error" style="color: red;">
        {{ error }}
      </p>

    <section>
      <h2>Backend Auth Status</h2>
      <pre v-if="backendStatus">
{{ backendStatus }}
      </pre>

      <p v-else>Loading…</p>
    </section>

    <section style="margin-top: 2rem;">
      <h2>Procore Context</h2>

      <pre v-if="procoreContext">
    {{ procoreContext }}
      </pre>

      <p v-else>
        Waiting for Procore context…
      </p>
    </section>
  </main>
</template>
