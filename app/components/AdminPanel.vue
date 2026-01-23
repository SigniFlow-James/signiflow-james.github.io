<!-- ========================================
// FILE: components/AdminPanel.vue
======================================== -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { FilterData, ViewerData } from '~/scripts/models'

const props = defineProps<{
  backendStatus: any
  error: string | null
}>()

const emit = defineEmits<{
  logout: []
}>()

const selectedCompanyId = ref<string | null>(null)
const selectedProjectId = ref<string | null>(null)
const filters = ref<FilterData>({
  users: []
})
const viewers = ref<ViewerData>({
  viewers: []
})
const loading = ref(false)
const pageError = ref<string | null>(null)
const saveSuccess = ref(false)
const testingRecipients = ref(false)
const testResults = ref<any>(null)
const testError = ref<string | null>(null)

const canSave = computed(() => {
  return selectedCompanyId.value !== null && !loading.value
})

onMounted(async () => {
  await loadFilters()
  await loadViewers()
})

async function getUserInfo(endpoint: string, query?: URLSearchParams) {
  try {
    const res = await fetch(
      `https://signiflow-procore-backend-net.onrender.com/admin/${endpoint}${query ? '?' + query.toString() : ''}`
    )

    if (!res.ok) {
      throw new Error('Failed to fetch user info')
    }

    const data = await res.json()
    return data.value || []
  } catch (err: any) {
    console.error('Error fetching user info:', err)
    pageError.value = err.message || 'Failed to fetch user info'
    return []
  }
}

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
      users: data.users || []
    }
  } catch (err: any) {
    pageError.value = err.message || 'Failed to load filters'
  } finally {
    loading.value = false
  }
}

async function loadViewers() {
  loading.value = true
  pageError.value = null

  try {
    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/admin/viewers'
    )

    if (!res.ok) {
      throw new Error('Failed to load viewers')
    }

    const data = await res.json()
    viewers.value = {
      viewers: data.viewers || []
    }
  } catch (err: any) {
    pageError.value = err.message || 'Failed to load viewers'
  } finally {
    loading.value = false
  }
}

async function linkAuth() {
  pageError.value = null
  const newWindow = window.open('https://signiflow-procore-backend-net.onrender.com/oauth/start', '_blank')
  if (newWindow) {
    console.log('New window opened for authentication.')
  } else {
    alert('Popup blocked! Please allow popups for this site to continue.')
    pageError.value = 'Popup blocked. Please enable popups to continue.'
  }
}

async function saveFilters() {
  if (!selectedCompanyId.value) {
    pageError.value = 'Please select a company before saving filters'
    return
  }

  loading.value = true
  pageError.value = null
  saveSuccess.value = false

  try {
    // Add company ID to all filters before saving
    const filtersWithCompany = {
      users: filters.value.users.map(f => ({ ...f, companyId: selectedCompanyId.value }))
    }

    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/admin/filters',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filtersWithCompany)
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

async function saveViewers() {
  if (!selectedCompanyId.value) {
    pageError.value = 'Please select a company before saving viewers'
    return
  }

  loading.value = true
  pageError.value = null
  saveSuccess.value = false

  try {
    // Add company ID to all viewers before saving
    const viewersWithCompany = {
      viewers: viewers.value.viewers.map(v => ({ ...v, companyId: selectedCompanyId.value }))
    }

    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/admin/viewers',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(viewersWithCompany)
      }
    )

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to save viewers')
    }

    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err: any) {
    pageError.value = err.message || 'Failed to save viewers'
  } finally {
    loading.value = false
  }
}

async function saveAll() {
  if (!selectedCompanyId.value) {
    pageError.value = 'Please select a company before saving'
    return
  }

  await saveFilters()
  if (!pageError.value) {
    await saveViewers()
  }
}

async function testRecipients() {
  testingRecipients.value = true
  testError.value = null
  testResults.value = null

  try {
    if (!selectedCompanyId.value || !selectedProjectId.value) {
      throw new Error('Please select both a company and project before testing')
    }

    const params = new URLSearchParams({
      company_id: selectedCompanyId.value,
      project_id: selectedProjectId.value,
    })

    const res = await fetch(
      `https://signiflow-procore-backend-net.onrender.com/api/recipients?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
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
    <AdminHeader
      v-model:company-id="selectedCompanyId"
      v-model:project-id="selectedProjectId"
      :loading="loading"
      :testing-recipients="testingRecipients"
      :get-user-info="getUserInfo"
      @link-auth="linkAuth"
      @test-recipients="testRecipients"
      @logout="emit('logout')"
    />

    <ErrorMessage v-if="pageError" :message="pageError" />

    <div v-if="saveSuccess" class="success-message">
      Configuration saved successfully!
    </div>

    <div v-if="!selectedCompanyId" class="warning-message">
      Please select a company to configure filters and viewers
    </div>

    <div v-if="loading && !testingRecipients" class="loading-message">
      Loading configuration...
    </div>

    <div v-else class="filters-grid">
      <FilterSection 
        v-model="filters.users" 
        title="User Filters" 
        :company-id="selectedCompanyId"
        :default-project-id="selectedProjectId"
        :get-user-info="getUserInfo"
      />

      <ViewerSection
        v-model="viewers.viewers"
        :company-id="selectedCompanyId"
        :default-project-id="selectedProjectId"
        :get-user-info="getUserInfo"
      />
    </div>

    <div class="save-section">
      <button 
        @click="saveAll" 
        :disabled="!canSave" 
        class="btn btn-primary btn-large"
        :title="!selectedCompanyId ? 'Select a company first' : ''"
      >
        {{ loading ? 'Saving...' : 'Save All Configuration' }}
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

.warning-message {
  padding: 1rem;
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
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







<!-- ========================================
// FILE: scripts/models.ts
======================================== -->


<!-- ========================================
// END FILE: scripts/models.ts
======================================== -->