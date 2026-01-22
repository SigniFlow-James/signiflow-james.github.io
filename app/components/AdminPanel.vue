<!-- ========================================
// FILE: components/AdminPanel.vue
======================================== -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  backendStatus: any
  error: string | null
}>()

const emit = defineEmits<{
  logout: []
}>()

const managers = ref<any[]>([])
const recipients = ref<any[]>([])
const loading = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)

onMounted(async () => {
  await loadFilters()
})

async function loadFilters() {
  loading.value = true
  saveError.value = null
  
  try {
    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/api/admin/filters'
    )
    
    if (!res.ok) {
      throw new Error('Failed to load filters')
    }
    
    const data = await res.json()
    managers.value = data.managers || []
    recipients.value = data.recipients || []
  } catch (err: any) {
    saveError.value = err.message || 'Failed to load filters'
  } finally {
    loading.value = false
  }
}

function toggleManager(manager: any) {
  manager.visible = !manager.visible
}

function toggleRecipient(recipient: any) {
  recipient.visible = !recipient.visible
}

async function saveFilters() {
  loading.value = true
  saveError.value = null
  saveSuccess.value = false
  
  try {
    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/api/admin/filters',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managers: managers.value,
          recipients: recipients.value
        })
      }
    )
    
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to save filters')
    }
    
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err: any) {
    saveError.value = err.message || 'Failed to save filters'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div style="max-width: 1200px; margin: 0 auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h2>Admin Panel - Filter Management</h2>
      <button
        @click="emit('logout')"
        style="padding: 0.5rem 1rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Logout
      </button>
    </div>
    
    <ErrorMessage v-if="saveError" :message="saveError" />
    
    <div v-if="saveSuccess" style="padding: 1rem; background: #d4edda; color: #155724; border: 1px solid #c3e6cb; border-radius: 4px; margin-bottom: 1rem;">
      Filters saved successfully!
    </div>
    
    <div v-if="loading" style="text-align: center; padding: 2rem;">
      Loading filters...
    </div>
    
    <div v-else style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <div>
        <h3 style="margin-bottom: 1rem;">Managers</h3>
        <div style="border: 1px solid #ccc; border-radius: 4px; padding: 1rem; max-height: 500px; overflow-y: auto;">
          <div
            v-for="manager in managers"
            :key="manager.id"
            style="display: flex; align-items: center; padding: 0.5rem; border-bottom: 1px solid #eee;"
          >
            <input
              type="checkbox"
              :checked="manager.visible"
              @change="toggleManager(manager)"
              style="margin-right: 0.75rem;"
            />
            <span>{{ manager.name }}</span>
          </div>
          <div v-if="managers.length === 0" style="text-align: center; color: #6c757d; padding: 2rem;">
            No managers available
          </div>
        </div>
      </div>
      
      <div>
        <h3 style="margin-bottom: 1rem;">Recipients</h3>
        <div style="border: 1px solid #ccc; border-radius: 4px; padding: 1rem; max-height: 500px; overflow-y: auto;">
          <div
            v-for="recipient in recipients"
            :key="recipient.id"
            style="display: flex; align-items: center; padding: 0.5rem; border-bottom: 1px solid #eee;"
          >
            <input
              type="checkbox"
              :checked="recipient.visible"
              @change="toggleRecipient(recipient)"
              style="margin-right: 0.75rem;"
            />
            <span>{{ recipient.name }}</span>
          </div>
          <div v-if="recipients.length === 0" style="text-align: center; color: #6c757d; padding: 2rem;">
            No recipients available
          </div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 2rem; text-align: center;">
      <button
        @click="saveFilters"
        :disabled="loading"
        style="padding: 0.75rem 2rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 1rem;"
      >
        {{ loading ? 'Saving...' : 'Save Filters' }}
      </button>
    </div>
  </div>
</template>

<!-- ========================================
// END FILE: components/AdminPanel.vue
======================================== -->