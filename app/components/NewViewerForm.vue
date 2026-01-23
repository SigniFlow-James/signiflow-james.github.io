<!-- ========================================
// FILE: components/NewViewerForm.vue
======================================== -->
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { ViewerItem, Project, ProcoreUserRecipient } from '~/scripts/models'

const props = defineProps<{
  modelValue: ViewerItem
  companyId: string | null
  defaultProjectId: string | null
  getUserInfo: (endpoint: string, query?: URLSearchParams) => Promise<any[]>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ViewerItem]
  add: []
}>()

const projects = ref<Project[]>([])
const users = ref<ProcoreUserRecipient[]>([])
const loadingProjects = ref(false)
const loadingUsers = ref(false)

const isManual = computed(() => props.modelValue.type === 'manual')
const isValid = computed(() => {
  if (isManual.value) {
    return !!(props.modelValue.firstName && props.modelValue.lastName && props.modelValue.email)
  } else {
    return !!props.modelValue.userId
  }
})

onMounted(async () => {
  if (props.companyId) {
    await loadProjects()
    if (props.defaultProjectId) {
      await loadUsers(props.defaultProjectId)
    }
  }
})

watch(() => props.companyId, async (newCompanyId) => {
  if (newCompanyId) {
    await loadProjects()
  } else {
    projects.value = []
    users.value = []
  }
})

watch(() => props.modelValue.projectId, async (newProjectId) => {
  if (newProjectId && props.companyId) {
    await loadUsers(newProjectId)
  } else {
    users.value = []
    updateField('userId', null)
  }
})

watch(() => props.modelValue.type, (newType) => {
  // Clear fields when switching types
  if (newType === 'manual') {
    updateField('userId', null)
  } else {
    updateField('firstName', '')
    updateField('lastName', '')
    updateField('email', '')
  }
})

async function loadProjects() {
  if (!props.companyId) return
  
  loadingProjects.value = true
  try {
    const params = new URLSearchParams({ company_id: props.companyId })
    const data = await props.getUserInfo('projects', params)
    projects.value = data
  } finally {
    loadingProjects.value = false
  }
}

async function loadUsers(projectId: string) {
  if (!props.companyId) return
  
  loadingUsers.value = true
  try {
    const params = new URLSearchParams({ 
      company_id: props.companyId,
      project_id: projectId
    })
    const data = await props.getUserInfo('users', params)
    users.value = data
  } finally {
    loadingUsers.value = false
  }
}

function updateField(field: keyof ViewerItem, value: any) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function updateProjectId(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  updateField('projectId', value || null)
}

function updateUserId(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  updateField('userId', value || null)
}
</script>

<template>
  <div class="new-viewer-form">
    <h4>New Viewer</h4>
    
    <div class="form-fields">
      <div class="form-group">
        <label>Viewer Type</label>
        <div class="radio-group">
          <label class="radio-label">
            <input
              type="radio"
              :checked="modelValue.type === 'manual'"
              @change="updateField('type', 'manual')"
            />
            <span>Manual Entry</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              :checked="modelValue.type === 'procore'"
              @change="updateField('type', 'procore')"
            />
            <span>Procore User</span>
          </label>
        </div>
      </div>

      <div v-if="!isManual" class="form-group">
        <label>Project (required for Procore users)</label>
        <select
          :value="modelValue.projectId || ''"
          @change="updateProjectId"
          :disabled="loadingProjects || !companyId"
          class="form-input"
        >
          <option value="">
            {{ loadingProjects ? 'Loading projects...' : 'Select a project' }}
          </option>
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>
      </div>

      <div v-if="!isManual" class="form-group">
        <label>Procore User</label>
        <select
          :value="modelValue.userId || ''"
          @change="updateUserId"
          :disabled="!modelValue.projectId || loadingUsers"
          class="form-input"
        >
          <option value="">
            {{ loadingUsers ? 'Loading users...' : modelValue.projectId ? 'Select a user' : 'Select project first' }}
          </option>
          <option v-for="user in users" :key="user.employee_id" :value="user.employee_id">
            {{ user.first_name }} {{ user.last_name }} ({{ user.email_address }})
          </option>
        </select>
      </div>

      <template v-if="isManual">
        <div class="form-row">
          <div class="form-group">
            <label>First Name</label>
            <input
              :value="modelValue.firstName"
              @input="updateField('firstName', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="First name"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label>Last Name</label>
            <input
              :value="modelValue.lastName"
              @input="updateField('lastName', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="Last name"
              class="form-input"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>Email Address</label>
          <input
            :value="modelValue.email"
            @input="updateField('email', ($event.target as HTMLInputElement).value)"
            type="email"
            placeholder="email@example.com"
            class="form-input"
          />
        </div>
      </template>
      
      <button
        @click="emit('add')"
        :disabled="!isValid"
        class="btn btn-success btn-full"
      >
        Add Viewer
      </button>
    </div>
  </div>
</template>

<style scoped>
.new-viewer-form {
  border: 2px solid #28a745;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
}

.new-viewer-form h4 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal;
}

.radio-label input[type="radio"] {
  margin: 0;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-input:disabled {
  background: #e9ecef;
  cursor: not-allowed;
  color: #6c757d;
}

.btn {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-full {
  width: 100%;
}
</style>

<!-- ========================================
// END FILE: components/NewViewerForm.vue
======================================== -->