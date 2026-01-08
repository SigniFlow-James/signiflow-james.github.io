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
  fetch('https://signiflow-procore-backend-net.onrender.com/api/auth/status')
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

  if (!document.referrer) {
    console.warn('No document.referrer; cannot open mesage listener')
    procoreContext.value = "App not loaded inside Procore iframe"
    return
  }
  
  // Procore context listener
  window.addEventListener('message', (event) => {
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
      event.data?.type === 'setup'
    ) {
      console.log('✅ Procore context detected')
      procoreContext.value = event.data.context ?? event.data.payload ?? event.data
    }
  })
  console.log('--- message listener attached ---')
  console.log(`--- sending initialiser to ${document.referrer} ---`)
  window.parent.postMessage(
    { type: 'initialize' },
    document.referrer
  )
})

/* -----------------------------
   Actions
----------------------------- */

async function sendToBackend() {
  sendResult.value = null
  sending.value = true

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
        <input v-model="form.name" type="text" style="width: 100%;" />
      </label>

      <label>
        Email<br />
        <input v-model="form.email" type="text" style="width: 100%;" />
      </label>

      <label style="display: block; margin-top: 1rem;">
        Custom Message<br />
        <textarea v-model="form.customMessage" rows="4" style="width: 100%;" />
      </label>

      <button class="styled-btn"
        :disabled="!isAuthenticated || !procoreContext || form.name.length <= 0 || form.email.length <= 0 || sending"
        @click="sendToBackend">
        {{ sending ? 'Sending…' : 'Send via Signiflow' }}
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


<style scoped>
.styled-btn {
  background-color: #00abeb;
  /* A nice, primary blue color */
  color: white;
  /* White text for contrast */
  border: none;
  /* Remove default browser border */
  padding: 15px 30px;
  /* Ample padding for a comfortable click area */
  font-size: 16px;
  /* Readable font size */
  font-weight: bold;
  /* Bold text */
  border-radius: 8px;
  /* Rounded corners for a modern look */
  cursor: pointer;
  /* Changes cursor to a hand icon on hover */
  transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease;
  /* Smooth transitions for effects */
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
  /* Subtle initial shadow */
  text-decoration: none;
  /* Ensure no underline if using <a> tag */
  display: inline-block;
  /* Allows padding and margin to work correctly */
}

/* Style for when a user hovers over the button */
.styled-btn:hover {
  background-color: #0056b3;
  /* Darker blue on hover */
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
  /* Slightly larger shadow on hover */
}

/* Style for when the button is actively being pressed down */
.styled-btn:active {
  transform: translateY(2px);
  /* Moves the button down slightly to simulate a press */
  box-shadow: 0 2px 10px rgba(0, 123, 255, 0.4);
  /* Reduces the shadow to enhance the pressed look */
}

/* Style for when the button has the disabled attribute */
.styled-btn:disabled {
  background-color: #cccccc;
  /* Gray background */
  color: #666666;
  /* Darker gray text for readability */
  cursor: not-allowed;
  /* Shows a 'no entry' sign instead of a hand */
  box-shadow: none;
  /* Removes the shadow */
  transform: none;
  /* Prevents the 'active' press movement */
  opacity: 0.7;
  /* Optional: adds a slight transparency */
}

/* Ensure hover effects don't trigger when disabled */
.styled-btn:disabled:hover {
  background-color: #cccccc;
  box-shadow: none;
}
</style>