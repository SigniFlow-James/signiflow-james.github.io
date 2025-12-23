<script setup lang="ts">
import { ref, onMounted } from 'vue'

const backendStatus = ref<null | {
  authenticated: boolean
  expiresAt: number | null
}>(null)

const error = ref<string | null>(null)

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
})
</script>

<template>
  <main style="padding: 1rem; font-family: system-ui;">
    <h1>Signiflow – Procore Side Panel</h1>

    <section>
      <h2>Backend Auth Status</h2>

      <p v-if="error" style="color: red;">
        {{ error }}
      </p>

      <pre v-else-if="backendStatus">
{{ backendStatus }}
      </pre>

      <p v-else>Loading…</p>
    </section>

    <section style="margin-top: 2rem;">
      <h2>Procore Context</h2>
      <p>(Not wired yet)</p>
    </section>
  </main>
</template>
