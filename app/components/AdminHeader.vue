<!-- ========================================
// FILE: components/AdminHeader.vue
======================================== -->
<script setup lang="ts">
import { ref } from 'vue'
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
    value ? props.companies.find(c => c.id === value) ?? null : null
  console.log('Selected company:', tCompany)
  emit('update:company', tCompany)
}


function updateProject(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  const tProject =
    value ? props.projects.find(p => p.id === value) ?? null : null
  emit('update:project', tProject)
}

</script>

<template>
  <div class="admin-header">
    <div class="header-left">
      <h2>Admin Panel - Filter Management</h2>
      <div class="selection-toolbar">
        <div class="select-group">
          <label for="company-select">Company:</label>
          <select
            id="company-select"
            :value="company?.id || ''"
            @change="updateCompany"
            :disabled="loadingCompanies"
            class="toolbar-select"
          >
            <option value="">
              {{ loadingCompanies ? 'Loading companies...' : 'All companies and projects' }}
            </option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </div>

        <div class="select-group">
          <label for="project-select">Project:</label>
          <select
            id="project-select"
            :value="project?.id || ''"
            @change="updateProject"
            :disabled="!company?.id || loadingProjects"
            class="toolbar-select"
          >
            <option value="">
              {{ loadingProjects ? 'Loading projects...' : company?.id ? 'Select a project' : 'Select company first' }}
            </option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="header-actions">
      <button @click="emit('linkAuth')" :disabled="loading" class="btn btn-info">
        Link Procore Account
      </button>
      <button 
        @click="emit('testRecipients')" 
        :disabled="testingRecipients || !company?.id || !project?.id" 
        class="btn btn-info"
        :title="!company?.id || !project?.id ? 'Select company and project first' : ''"
      >
        {{ testingRecipients ? 'Testing...' : 'Test Recipients' }}
      </button>
      <button @click="emit('logout')" class="btn btn-secondary">
        Logout
      </button>
    </div>
  </div>
</template>

<style scoped>
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-left {
  flex: 1;
}

.header-left h2 {
  margin: 0 0 1rem 0;
}

.selection-toolbar {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.select-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
  white-space: nowrap;
}

.toolbar-select {
  padding: 0.4rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  font-size: 0.9rem;
  min-width: 200px;
  cursor: pointer;
}

.toolbar-select:disabled {
  background: #e9ecef;
  cursor: not-allowed;
  color: #6c757d;
}

.toolbar-select:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

@media (max-width: 1200px) {
  .admin-header {
    flex-direction: column;
    align-items: stretch;
  }

  .selection-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .select-group {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-select {
    width: 100%;
  }

  .header-actions {
    justify-content: flex-end;
  }
}
</style>

<!-- ========================================
// END FILE: components/AdminHeader.vue
======================================== -->