<!-- ========================================
// FILE: components/AdminView.vue
======================================== -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { BackendStatus } from '~/scripts/models';

const props = defineProps<{
  backendStatus: BackendStatus | null
  error: string | null
}>()

const authToken = ref<string>('')
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
      'https://signiflow-procore-backend-net.onrender.com/admin/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm.value)
      }
    )

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Login failed')
    }
    
    const token = res.headers.get('token')
    if (token) {
      authToken.value = token
    }

    isLoggedIn.value = true
  } catch (err: any) {
    loginError.value = err.message || 'Login failed'
  } finally {
    loggingIn.value = false
  }
}

async function handleTokenLogin() {
  if (!authToken.value) {
    return
  }
  
  loginError.value = null
  loggingIn.value = true

  try {
    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/admin/token',
      {
        method: 'POST',
        headers: { 
          'bearer-token': authToken.value
        },
      }
    )

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Login failed')
    }
    
    const token = res.headers.get('token')
    if (token) {
      authToken.value = token
    }

    isLoggedIn.value = true
  } catch (err: any) {
    loginError.value = err.message || 'Login failed'
    authToken.value = ''
  } finally {
    loggingIn.value = false
  }
}

function handleLogout() {
  isLoggedIn.value = false
  authToken.value = ''
  loginForm.value = { username: '', password: '' }
}

onMounted(async () => {
  // Try to login with existing token if available
  await handleTokenLogin()
})
</script>

<template>
  <div>
    <div v-if="!isLoggedIn" style="max-width: 400px; margin: 2rem auto;">
      <SigniflowHeader />
      <h2 style="margin-bottom: 1.5rem; text-align: center;">Procore Integration Admin Portal</h2>

      <ErrorMessage v-if="loginError" :message="loginError" />

      <form @submit.prevent="handleLogin">
        <div>
          <label for="username">
            Username
          </label>
          <input id="username" v-model="loginForm.username" type="text" required class="form-input" />
        </div>

        <div>
          <label for="password">
            Password
          </label>
          <input id="password" v-model="loginForm.password" type="password" required class="form-input" />
        </div>
        <div>
          <button type="submit" :disabled="loggingIn || !loginForm.username || !loginForm.password" class="styled-btn">
            {{ loggingIn ? 'Logging in...' : 'Login' }}
          </button>
        </div>
      </form>
    </div>

    <AdminPanel 
      v-else 
      :backend-status="backendStatus" 
      :error="error" 
      v-model:auth-token="authToken" 
      @logout="handleLogout" 
    />
  </div>
</template>

<style scoped>
.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4a90e2;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.styled-btn {
  width: 100%;
  margin-top: 0.5rem;
  background-color: #00abeb;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
  text-decoration: none;
  display: inline-block;
}

.styled-btn:hover {
  background-color: #0056b3;
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
}

.styled-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 10px rgba(0, 123, 255, 0.4);
}

.styled-btn:disabled {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  opacity: 0.7;
}

.styled-btn:disabled:hover {
  background-color: #cccccc;
  box-shadow: none;
}
</style>
<!-- ========================================
// END FILE: components/AdminView.vue
======================================== -->