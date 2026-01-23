<!-- ========================================
// FILE: components/ViewerItem.vue
======================================== -->
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { ViewerItem, Project, ProcoreUserRecipient } from '~/scripts/models'

const props = defineProps<{
  viewer: ViewerItem
  index: number
  companyId: string | null
  defaultProjectId: string | null
  getUserInfo: (endpoint: string, query?: URLSearchParams) => Promise<any[]>
}>()

const emit = defineEmits<{
  update: [field: keyof ViewerItem, value: any]
  delete: []
}>()

const projects = ref<Project[]>([])
const users = ref<ProcoreUserRecipient[]>([])
const loadingProjects = ref(false)
const loadingUsers = ref(false)

const isManual = computed(() => props.viewer.type === 'manual')

onMounted(async () => {
  if (props.companyId) {
    await loadProjects()
    if (props.viewer.projectId) {
      await loadUsers(props.viewer.projectId)
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

watch(() => props.viewer.projectId, async (newProjectId) => {
  if (newProjectId && props.companyId) {
    await loadUsers(newProjectId)
  } else {
    users.value = []
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

function updateProjectId(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update', 'projectId', value || null)
}

function updateUserId(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update', 'userId', value || null)
}
</script>

<template>
  <div class="viewer-item">
    <div class="viewer-content">
      <div class="viewer-type-badge">
        <span :class="['badge', isManual ? 'badge-manual' : 'badge-procore']">
          {{ isManual ? 'Manual Entry' : 'Procore User' }}
        </span>
      </div>

      <template v-if="!isManual">
        <div class="viewer-field">
          <label>Project</label>
          <select
            :value="viewer.projectId || ''"
            @change="updateProjectId"
            :disabled="loadingProjects || !companyId"
            class="input-small"
          >
            <option value="">Select a project</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>

        <div class="viewer-field">
          <label>Procore User</label>
          <select
            :value="viewer.userId || ''"
            @change="updateUserId"
            :disabled="!viewer.projectId || loadingUsers"
            class="input-small"
          >
            <option value="">
              {{ loadingUsers ? 'Loading...' : viewer.projectId ? 'Select a user' : 'Select project first' }}
            </option>
            <option v-for="user in users" :key="user.employee_id" :value="user.employee_id">
              {{ user.first_name }} {{ user.last_name }} ({{ user.email_address }})
            </option>
          </select>
        </div>
      </template>

      <template v-else>
        <div class="viewer-row">
          <div class="viewer-field">
            <label>First Name</label>
            <input
              :value="viewer.firstName"
              @input="emit('update', 'firstName', ($event.target as HTMLInputElement).value)"
              type="text"
              class="input-small"
            />
          </div>
          
          <div class="viewer-field">
            <label>Last Name</label>
            <input
              :value="viewer.lastName"
              @input="emit('update', 'lastName', ($event.target as HTMLInputElement).value)"
              type="text"
              class="input-small"
            />
          </div>
        </div>
        
        <div class="viewer-field">
          <label>Email Address</label>
          <input
            :value="viewer.email"
            @input="emit('update', 'email', ($event.target as HTMLInputElement).value)"
            type="email"
            class="input-small"
          />
        </div>
      </template>
    </div>
    
    <button @click="emit('delete')" class="btn btn-danger btn-small">
      Delete
    </button>
  </div>
</template>

<style scoped>
.viewer-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
}

.viewer-content {
  flex: 1;
  display
  : flex;
  flex-direction: column;
  gap: 0.5rem;
}

.viewer-type-badge {
  margin-bottom: 0.25rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-manual {
  background: #e3f2fd;
  color: #1976d2;
}

.badge-procore {
  background: #f3e5f5;
  color: #7b1fa2;
}

.viewer-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.viewer-field {
  display: flex;
  flex-direction: column;
}

.viewer-field label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  color: #6c757d;
}

.input-small {
  width: 100%;
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

.input-small:disabled {
  background: #e9ecef;
  cursor: not-allowed;
  color: #6c757d;
}

.btn {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-small {
  font-size: 0.85rem;
}
</style>

<!-- ========================================
// END FILE: components/ViewerItem.vue
======================================== -->