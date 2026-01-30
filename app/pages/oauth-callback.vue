<!-- ========================================
// FILE: pages/oauth-callback.vue
======================================== -->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const route = useRoute()

const AUTO_CLOSE_SECONDS = 0
const remaining = ref(AUTO_CLOSE_SECONDS)
let timer: number | undefined

const isSuccess = computed(() => route.query.success === 'true')
const errorMessage = computed(() => route.query.error as string | undefined)

function closeWindow() {
  window.close()
}

onMounted(() => {
  // Notify opener
  if (window.opener) {
    window.opener.postMessage(
      {
        type: 'oauth-complete',
        success: isSuccess.value,
        error: errorMessage.value
      },
      window.location.origin
    )
  }

  if (AUTO_CLOSE_SECONDS <= 0) {
    closeWindow()
    return
  }
  // Countdown + auto close
  timer = window.setInterval(() => {
    remaining.value--
    if (remaining.value <= 0) {
      clearInterval(timer)
      closeWindow()
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="oauth-callback">
    <div class="callback-card" :class="{ success: isSuccess, error: !isSuccess }">
      <div class="icon-wrap">
        <div v-if="isSuccess" class="icon success">✓</div>
        <div v-else class="icon error">✕</div>
      </div>

      <h1>{{ isSuccess ? 'Connected' : 'Connection Failed' }}</h1>

      <p v-if="isSuccess">
        Your Procore account has been successfully linked.
      </p>
      <p v-else>
        {{ errorMessage || 'Unable to connect your Procore account.' }}
      </p>

      <div class="countdown" v-if="isSuccess">
        Closing in <strong>{{ remaining }}</strong>s
        <div class="progress">
          <div
            class="progress-bar"
            :style="{ width: ((AUTO_CLOSE_SECONDS - remaining) / AUTO_CLOSE_SECONDS) * 100 + '%' }"
          />
        </div>
      </div>

      <button v-if="!isSuccess" class="btn-close" @click="closeWindow">
        Close Window
      </button>
    </div>
  </div>
</template>

<style scoped>
.oauth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background:
    radial-gradient(1200px circle at top right, rgba(255,255,255,0.08), transparent 40%),
    linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.callback-card {
  width: 100%;
  max-width: 460px;
  background: #ffffff;
  border-radius: 20px;
  padding: 3rem 2.5rem 2.5rem;
  text-align: center;
  box-shadow:
    0 30px 80px rgba(0,0,0,0.25),
    inset 0 1px 0 rgba(255,255,255,0.6);
  animation: fadeUp 0.5s ease-out;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
}

.icon.success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.icon.error {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

h1 {
  margin: 0 0 0.75rem;
  font-size: 1.9rem;
  letter-spacing: -0.01em;
}

p {
  margin: 0 0 1.5rem;
  color: #6b7280;
  font-size: 1.05rem;
}

.countdown {
  margin-top: 1.25rem;
  font-size: 0.95rem;
  color: #6b7280;
}

.progress {
  margin-top: 0.75rem;
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  transition: width 0.4s ease;
}

.btn-close {
  margin-top: 1.5rem;
  padding: 0.7rem 2rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(79,70,229,0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-close:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(79,70,229,0.45);
}

.btn-close:active {
  transform: translateY(0);
}
</style>

<!-- ========================================
// END FILE: pages/oauth-callback.vue
======================================== -->