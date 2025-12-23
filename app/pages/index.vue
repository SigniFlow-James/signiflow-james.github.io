<script setup lang="ts">
import { ref, onMounted } from 'vue'

const backendStatus = ref<null | {
  authenticated: boolean
  expiresAt: number | null
}>(null)

const error = ref<string | null>(null)
const procoreContext = ref<any>(null)

onMounted(() => {
  // 1️⃣ Load backend auth status (fire-and-forget)
  fetch('https://signiflow-backend-test.onrender.com/api/auth/status')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .then(data => {
      backendStatus.value = data
    })
    .catch(err => {
      error.value = err.message ?? 'Failed to load backend status'
    })

  // 2️⃣ Wait for Procore SDK
  const waitForProcore = () => {
    if (window.Procore && typeof window.Procore.on === 'function') {
      console.log('Procore SDK available')

      window.Procore.on('app.context', (context: any) => {
        console.log('Procore context received:', context)
        procoreContext.value = context
      })
    } else {
      // Retry until SDK is injected
      setTimeout(waitForProcore, 100)
    }
  }

  waitForProcore()
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
