<!-- ========================================
// FILE: components/AdminPanel.vue
======================================== -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { FilterData } from '~/scripts/models'

const props = defineProps<{
  backendStatus: any
  error: string | null
}>()

const emit = defineEmits<{
  logout: []
}>()

const filters = ref<FilterData>({
  users: [],
  vendors: []
})

const loading = ref(false)
const pageError = ref<string | null>(null)
const saveSuccess = ref(false)
const testingRecipients = ref(false)
const testResults = ref<any>(null)
const testError = ref<string | null>(null)

onMounted(async () => {
  await loadFilters()
})

async function loadFilters() {
  loading.value = true
  pageError.value = null
  
  try {
    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/admin/filters'
    )
    
    if (!res.ok) {
      throw new Error('Failed to load filters')
    }
    
    const data = await res.json()
    filters.value = {
      users: data.users || [],
      vendors: data.vendors || []
    }
  } catch (err: any) {
    pageError.value = err.message || 'Failed to load filters'
  } finally {
    loading.value = false
  }
}

async function linkAuth() {
  pageError.value = null
  const newWindow = window.open('https://signiflow-procore-backend-net.onrender.com/oauth/start', '_blank');
  if (newWindow) {
    console.log('New window opened for authentication.');
  } else {
    alert('Popup blocked! Please allow popups for this site to continue.');
    pageError.value = 'Popup blocked. Please enable popups to continue.';
  }
}

async function saveFilters() {
  loading.value = true
  pageError.value = null
  saveSuccess.value = false
  
  try {
    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/admin/filters',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters.value)
      }
    )
    
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to save filters')
    }
    
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err: any) {
    pageError.value = err.message || 'Failed to save filters'
  } finally {
    loading.value = false
  }
}

async function testRecipients() {
  testingRecipients.value = true
  testError.value = null
  testResults.value = null
  
  try {
    const testContext = {
      company_id: prompt('Enter Company ID for testing:'),
      project_id: prompt('Enter Project ID for testing:')
    }
    
    if (!testContext.company_id || !testContext.project_id) {
      throw new Error('Company ID and Project ID are required')
    }
    
    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/api/recipients',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: testContext })
      }
    )
    
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to fetch recipients')
    }
    
    const data = await res.json()
    testResults.value = data
  } catch (err: any) {
    testError.value = err.message || 'Failed to test recipients'
  } finally {
    testingRecipients.value = false
  }
}

function closeTestResults() {
  testResults.value = null
  testError.value = null
}
</script>

<template>
  <div class="admin-panel">
    <div class="panel-header">
      <h2>Admin Panel - Filter Management</h2>
      <div class="header-actions">
        <button
          @click="linkAuth"
          :disabled="loading"
          class="btn btn-info"
          >
          Link Procore Account
        </button>
        <button
          @click="testRecipients"
          :disabled="testingRecipients"
          class="btn btn-info"
        >
          {{ testingRecipients ? 'Testing...' : 'Test Recipients' }}
        </button>
        <button @click="emit('logout')" class="btn btn-secondary">
          Logout
        </button>
      </div>
    </div>
    
    <ErrorMessage v-if="pageError" :message="pageError" />
    
    <div v-if="saveSuccess" class="success-message">
      Filters saved successfully!
    </div>
    
    <div v-if="loading && !testingRecipients" class="loading-message">
      Loading filters...
    </div>
    
    <div v-else class="filters-grid">
      <FilterSection
        v-model="filters.users"
        title="User Filters"
        filter-type="user"
      />
      
      <FilterSection
        v-model="filters.vendors"
        title="Vendor Filters"
        filter-type="vendor"
      />
    </div>
    
    <div class="save-section">
      <button
        @click="saveFilters"
        :disabled="loading"
        class="btn btn-primary btn-large"
      >
        {{ loading ? 'Saving...' : 'Save All Filters' }}
      </button>
    </div>
    
    <TestResultsModal
      v-if="testResults || testError"
      :results="testResults"
      :error="testError"
      @close="closeTestResults"
    />
  </div>
</template>

<style scoped>
.admin-panel {
  max-width: 1400px;
  margin: 0 auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.panel-header h2 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-large {
  padding: 0.75rem 2rem;
  font-size: 1rem;
}

.success-message {
  padding: 1rem;
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.loading-message {
  text-align: center;
  padding: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.save-section {
  margin-top: 2rem;
  text-align: center;
}
</style>

<!-- ========================================
// END FILE: components/AdminPanel.vue
======================================== -->