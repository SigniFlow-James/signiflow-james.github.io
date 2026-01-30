<!-- ========================================
// FILE: components/AdminPanel.vue
======================================== -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import type { FilterData, ViewerData, Company, Project, BackendStatus } from '~/scripts/models'

const props = defineProps<{
  backendStatus: BackendStatus | null
  error: string | null
  authToken: string
}>()

const emit = defineEmits<{
  logout: []
  'update:authToken': [token: string]
}>()

const companies = ref<Company[]>([])
const projects = ref<Project[]>([])
const selectedCompany = ref<Company | null>(null)
const selectedProject = ref<Project | null>(null)
const filters = ref<FilterData>({
  filters: []
})
const viewers = ref<ViewerData>({
  viewers: []
})
const loading = ref(false)
const saving = ref(false)
const pageError = ref<string | null>(null)
const saveSuccess = ref(false)
const authSuccess = ref(false)
const testingRecipients = ref(false)
const testResults = ref<any>(null)
const testError = ref<string | null>(null)

const canSave = computed(() => {
  return !loading.value && !saving.value
})

function updateToken(token?: string) {
  if (token) {
    emit('update:authToken', token)
  }
}

onMounted(async () => {
  companies.value = await getCompanies()
})

watch(() => selectedCompany.value, async (newCompany) => {
  selectedProject.value = null  // Clear project when company changes
  projects.value = []
  if (newCompany) {
    await loadFiltersAndViewers(newCompany.id)
    projects.value = await getProjects(newCompany.id)
  }
  else {
    await loadFiltersAndViewers("all")
  }
})

async function getCompanies() {
  try {
    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/admin/companies',
      {
        method: 'GET',
        headers: {
          'bearer-token': props.authToken
        },
      }
    )

    if (!res.ok) {
      throw new Error('Failed to fetch companies')
    }
    const data = await res.json()
    updateToken(data.token)

    return (data.companies ?? []).map((c: any) => ({
      ...c,
      id: String(c.id),
    }))
  } catch (err: any) {
    console.error('Error fetching companies:', err)
    pageError.value = err.message || 'Failed to fetch companies'
    return []
  }
}

async function getProjects(companyId: string | number) {
  try {
    const res = await fetch(
      `https://signiflow-procore-backend-net.onrender.com/admin/projects`,
      {
        method: 'GET',
        headers: {
          'company-id': String(companyId),
          'bearer-token': props.authToken
        },
      }
    )

    if (!res.ok) {
      throw new Error('Failed to fetch projects')
    }
    const data = await res.json()
    updateToken(data.token)

    return (data.projects ?? []).map(
      (c: any) => ({
        ...c,
        id: String(c.id),
      })
    )
  } catch (err: any) {
    console.error('Error fetching projects:', err)
    pageError.value = err.message || 'Failed to fetch projects'
    return []
  }
}

async function getUserInfo(projectId?: string) {
  try {
    if (!selectedCompany.value?.id) {
      throw new Error('Company ID is required to fetch user info')
    }

    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/admin/users',
      {
        method: 'GET',
        headers: {
          'company-id': String(selectedCompany.value.id),
          'project-id': projectId ? String(projectId) : '',
          'bearer-token': props.authToken
        },
      }
    )

    if (!res.ok) {
      throw new Error('Failed to fetch user info')
    }
    const data = await res.json()
    updateToken(data.token)

    console.log('Fetched user info:', data)
    return data.value || []
  } catch (err: any) {
    console.error('Error fetching user info:', err)
    pageError.value = err.message || 'Failed to fetch user info'
    return []
  }
}

async function loadFiltersAndViewers(companyId: string) {
  loading.value = true
  pageError.value = null

  try {
    const res = await fetch(
      'https://signiflow-procore-backend-net.onrender.com/admin/dashboard',
      {
        method: 'GET',
        headers: {
          'company-id': companyId,
          'bearer-token': props.authToken
        },
      }
    )

    if (!res.ok) {
      throw new Error('Failed to load dashboard data')
    }
    const data = await res.json()
    updateToken(data.token)

    filters.value = {
      filters: data.filters || []
    }
    viewers.value = {
      viewers: data.viewers || []
    }
  } catch (err: any) {
    pageError.value = err.message || 'Failed to load dashboard data'
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

async function handleOAuthComplete() {
  console.log('OAuth completed - refreshing data...')
  pageError.value = null

  // Refresh companies list and reload dashboard data
  companies.value = await getCompanies()
  await loadFiltersAndViewers(selectedCompany.value?.id ?? 'all')

  // Show success message
  authSuccess.value = true
  setTimeout(() => { authSuccess.value = false }, 3000)
}

async function saveDashboardData(target: 'filters' | 'viewers') {
  let companyId = selectedCompany.value?.id ?? 'all'

  loading.value = true
  saving.value = true
  pageError.value = null
  saveSuccess.value = false

  try {
    const payload =
      target === 'filters'
        ? {
          filters: filters.value.filters.map(f => ({
            ...f,
            companyId: String(companyId),
          })),
        }
        : {
          viewers: viewers.value.viewers.map(v => ({
            ...v,
            companyId: String(companyId),
          })),
        }

    const res = await fetch(
      `https://signiflow-procore-backend-net.onrender.com/admin/${target}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'company-id': String(companyId),
          'bearer-token': props.authToken
        },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || `Failed to save ${target}`)
    }
    const data = await res.json()
    updateToken(data.token)

    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  } catch (err: any) {
    pageError.value = err.message || `Failed to save ${target}`
  } finally {
    loading.value = false
    saving.value = false
  }
}

async function saveAll() {
  await saveDashboardData('filters')
  await saveDashboardData('viewers')
}

async function testRecipients() {
  testingRecipients.value = true
  testError.value = null
  testResults.value = null

  try {
    if (!selectedCompany.value || !selectedProject.value) {
      throw new Error('Please select both a company and project before testing')
    }

    const res = await fetch(
      `https://signiflow-procore-backend-net.onrender.com/api/recipients`,
      {
        method: 'GET',
        headers: {
          'company-id': String(selectedCompany.value.id),
          'project-id': String(selectedProject.value.id),
          'bearer-token': props.authToken
        }
      }
    )

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to fetch recipients')
    }
    const data = await res.json()
    updateToken(data.token)

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
    <AdminHeader :companies="companies" :projects="projects" v-model:company="selectedCompany"
      v-model:project="selectedProject" :loading="loading" :testing-recipients="testingRecipients" @link-auth="linkAuth"
      @oauth-complete="handleOAuthComplete" @test-recipients="testRecipients" @logout="emit('logout')" />

    <Transition name="notice">
      <ErrorMessage v-if="pageError" :message="pageError" />
    </Transition>

    <Transition name="notice" appear>
      <div v-if="saveSuccess" class="success-message">
        Configuration saved successfully!
      </div>
    </Transition>

    <Transition name="notice" appear>
      <div v-if="authSuccess" class="success-message">
        Authentication completed successfully!
      </div>
    </Transition>

    <div v-if="loading && !testingRecipients" class="loading-message">
      Loading configuration...
    </div>

    <div v-else class="filters-grid">
      <FilterSection v-model="filters.filters" title="User Filters" :company-id="selectedCompany?.id ? String(selectedCompany.id) : null"
        :default-project-id="selectedProject?.id ? String(selectedProject.id) : null" :projects="projects" />

      <ViewerSection v-model="viewers.viewers" :company-id="selectedCompany?.id ? String(selectedCompany.id) : null"
        :default-project-id="selectedProject?.id ? String(selectedProject.id) : null" :projects="projects" :get-user-info="getUserInfo" />
    </div>

    <div class="save-section">
      <button @click="saveAll" :disabled="!canSave" class="btn btn-primary btn-large"
        :title="!selectedCompany ? 'Select a company first' : ''">
        {{ saving ? 'Saving...' : loading ? 'Loading...' : `Save Configuration for ${selectedCompany?.name ??
          'All Companies'}` }}
      </button>
    </div>

    <TestResultsModal v-if="testResults || testError" :results="testResults" :error="testError"
      @close="closeTestResults" />
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
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 1rem 2rem;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  text-align: center;
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notice-enter-active,
.notice-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.notice-enter-from,
.notice-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.notice-enter-to,
.notice-leave-from {
  opacity: 1;
  transform: translate(-50%, 0);
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