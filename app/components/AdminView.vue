<!-- ========================================
// FILE: components/AdminView.vue
======================================== -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  backendStatus: any
  error: string | null
}>()

const isLoggedIn = ref(false)
const loginForm = ref({
  username: '',
  password: ''
})
const loginError = ref<string | null>(null)
const loggingIn = ref(false)

async function handleLogin() {
  loginError.value = null
  loggingIn.value = true

  try {
    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/api/admin/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm.value)
      }
    )

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Login failed')
    }

    isLoggedIn.value = true
  } catch (err: any) {
    loginError.value = err.message || 'Login failed'
  } finally {
    loggingIn.value = false
  }
}

function handleLogout() {
  isLoggedIn.value = false
  loginForm.value = { username: '', password: '' }
}
</script>

<template>
  <div>
    <SigniflowHeader />
    
    <div v-if="!isLoggedIn" style="max-width: 400px; margin: 2rem auto;">
      <h2 style="margin-bottom: 1.5rem; text-align: center;">Procore Integration Admin Portal</h2>
      
      <ErrorMessage v-if="loginError" :message="loginError" />
      
      <form @submit.prevent="handleLogin" style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <label for="username" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
            Username
          </label>
          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            required
            style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;"
          />
        </div>
        
        <div>
          <label for="password" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
            Password
          </label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            required
            style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;"
          />
        </div>
        
        <button
          type="submit"
          :disabled="loggingIn"
          style="padding: 0.75rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;"
        >
          {{ loggingIn ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
    
    <AdminPanel 
      v-else
      :backend-status="backendStatus"
      :error="error"
      @logout="handleLogout"
    />
  </div>
</template>

<!-- ========================================
// END FILE: components/AdminView.vue
======================================== -->