<script setup lang="ts">
import { ref, onMounted } from 'vue'

const backendStatus = ref<null | {
  authenticated: boolean
  expiresAt: number | null
}>(null)

const error = ref<string | null>(null)
const procoreContext = ref<any>(null)

onMounted(() => {
  // --- Backend auth (unchanged) ---
  fetch('https://signiflow-backend-test.onrender.com/api/auth/status')
    .then(res => res.json())
    .then(data => {
      backendStatus.value = data
    })
    .catch(() => {
      error.value = 'Failed to load backend status'
    })

  // --- Procore context via postMessage ---
  window.addEventListener('message', (event) => {
    // Security check (important)
    if (
      typeof event.origin === 'string' &&
      !event.origin.endsWith('procore.com')
    ) {
      return
    }

    const data = event.data

    if (!data || typeof data !== 'object') return

    if (data.type === 'app.context') {
      console.log('Procore context received:', data.payload)
      procoreContext.value = data.payload
    }
  })
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
