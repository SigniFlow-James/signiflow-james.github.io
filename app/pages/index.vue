<script setup lang="ts">
import { ref, onMounted } from 'vue'

const backendStatus = ref<null | {
  authenticated: boolean
  expiresAt: number | null
}>(null)

const error = ref<string | null>(null)
const procoreContext = ref<any>(null)

onMounted(async () => {
  try {
    const res = await fetch(
      'https://signiflow-backend-test.onrender.com/api/auth/status'
    )

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    backendStatus.value = await res.json()
  } catch (err: any) {
    error.value = err.message ?? 'Failed to load backend status'
  }

  if (!window.Procore) {
    error.value = 'Procore SDK not available'
    return
  }

  // Listen for context updates
  window.Procore.on('app.context', (context: any) => {
    console.log('Procore context received:', context)
    procoreContext.value = context
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
