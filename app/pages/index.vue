<script setup lang="ts">
import { onMounted, ref } from 'vue'

const queryParams = ref<Record<string, string>>({})
const procoreContext = ref<any>(null)

onMounted(() => {
  // 1. Read query params (always available)
  const params = new URLSearchParams(window.location.search)
  const entries: Record<string, string> = {}

  for (const [key, value] of params.entries()) {
    entries[key] = value
  }

  queryParams.value = entries

  // 2. Listen for Procore context
  const waitForProcore = () => {
    if (window.Procore?.on) {
      window.Procore.on('app.context', (context: any) => {
        procoreContext.value = context
      })
    } else {
      setTimeout(waitForProcore, 100)
    }
  }

  waitForProcore()
})
</script>

<template>
  <main style="padding: 1rem; font-family: system-ui;">
    <h1>Procore Side Panel (Nuxt 4)</h1>

    <h2>Query Parameters</h2>
    <pre>{{ queryParams }}</pre>

    <h2>Procore Context</h2>
    <pre v-if="procoreContext">{{ procoreContext }}</pre>
    <p v-else>Waiting for Procore context…</p>
  </main>
</template>
