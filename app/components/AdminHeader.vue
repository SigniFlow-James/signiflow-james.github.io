<!-- ========================================
// FILE: components/AdminHeader.vue
======================================== -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Company, Project } from '~/scripts/models'

const props = defineProps<{
  companies: Company[]
  projects: Project[]
  company: Company | null
  project: Project | null
  loading: boolean
  testingRecipients: boolean
}>()

const emit = defineEmits<{
  'update:company': [value: Company | null]
  'update:project': [value: Project | null]
  'oauth-complete': []
  linkAuth: []
  testRecipients: []
  logout: []
}>()

const loadingCompanies = ref(false)
const loadingProjects = ref(false)

function updateCompany(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  console.log('Selected company ID:', value)
  console.log('Available companies:', props.companies)
  const tCompany =
    value ? props.companies.find(c => String(c.id) === String(value)) ?? null : null
  console.log('Selected company:', tCompany)
  emit('update:company', tCompany)
}

function updateProject(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  const tProject =
    value ? props.projects.find(p => String(p.id) === String(value)) ?? null : null
  emit('update:project', tProject)
}

// Handle OAuth completion message from popup
function handleOAuthMessage(event: MessageEvent) {
  // Verify the message is from your domain
  if (event.origin !== window.location.origin) return

  if (event.data.type === 'oauth-complete' && event.data.success) {
    console.log('OAuth completed successfully')
    emit('oauth-complete')
  }
}

onMounted(() => {
  window.addEventListener('message', handleOAuthMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleOAuthMessage)
})
</script>

<template>
  <div class="admin-header">
    <div class="header-content">
      <div class="header-left">
        <img src="/logo.png" alt="Signiflow Logo" class="header-logo" />
        <p class="subtitle">
          Procore Integration Admin Panel | Configure contract filters and viewers
        </p>
      </div>

      <div class="header-right">
        <button @click="emit('linkAuth')" :disabled="loading" class="btn btn-outline">
          Link Procore
        </button>
        <button @click="emit('logout')" class="btn btn-ghost">
          Logout
        </button>
      </div>
    </div>

    <div class="controls-bar">
      <div class="control-section">
        <label class="control-label">Company</label>
        <select :value="company?.id || ''" @change="updateCompany" :disabled="loadingCompanies" class="control-input">
          <option value="">
            {{ loadingCompanies ? 'Loading...' : 'All Companies' }}
          </option>
          <option v-for="company in companies" :key="company.id" :value="company.id">
            {{ company.name }}
          </option>
        </select>
      </div>

      <div class="divider"></div>

      <div class="control-section test-section">
        <label class="control-label">Test Recipients</label>
        <div class="test-controls">
          <select :value="project?.id || ''" @change="updateProject" :disabled="!company?.id || loadingProjects"
            class="control-input">
            <option value="">
              {{ loadingProjects ? 'Loading...' : company?.id ? 'Select Project' : 'Select Company First' }}
            </option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>

          <button @click="emit('testRecipients')" :disabled="testingRecipients || !company?.id || !project?.id"
            class="btn btn-primary btn-sm"
            :title="!company?.id || !project?.id ? 'Select company and project first' : ''">
            {{ testingRecipients ? 'Testing...' : 'Run Test' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-header {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.header-logo {
  max-width: 30%;
  height: auto;
  padding: 0.25rem 0;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.3;
}


.header-right {
  display: flex;
  gap: 0.75rem;
}

.controls-bar {
  display: flex;
  align-items: flex-end;
  gap: 2rem;
  padding: 1.5rem 2rem;
}

.control-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.test-section {
  flex: 1.5;
}

.control-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}

.control-input {
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #111827;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.control-input:hover:not(:disabled) {
  border-color: #9ca3af;
}

.control-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.control-input:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.divider {
  width: 1px;
  background: #e5e7eb;
  align-self: stretch;
  margin-top: 1.5rem;
}

.test-controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.test-controls .control-input {
  flex: 1;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  border: none;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
}

.btn-ghost:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-sm {
  padding: 0.625rem 1.25rem;
}

@media (max-width: 1200px) {
  .controls-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .divider {
    display: none;
  }

  .control-section {
    max-width: none;
  }

  .test-controls {
    flex-direction: column;
  }

  .test-controls .control-input {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }

  .controls-bar {
    padding: 1rem;
  }

  .btn {
    font-size: 0.8125rem;
  }
}
</style>

<!-- ========================================
// END FILE: components/AdminHeader.vue
======================================== -->