<!-- ========================================
// FILE: components/ViewerItem.vue
======================================== -->
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { ViewerItem, Project, ProcoreUserRecipient, Recipient } from '~/scripts/models'

const props = defineProps<{
  viewer: ViewerItem
  index: number
  companyId: string | null
  defaultProjectId: string | null
  projects: Project[]
  getUserInfo: (projectId?: string) => Promise<any[]>
}>()

const emit = defineEmits<{
  update: [field: keyof ViewerItem, value: any]
  delete: []
}>()

const users = ref<ProcoreUserRecipient[]>([])
const loadingUsers = ref(false)

// Australian states and territories
const australianRegions = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'NT', label: 'Northern Territory' },
  { value: 'ACT', label: 'Australian Capital Territory' }
]

const isManual = computed(() => props.viewer.type === 'manual')

// Convert ProcoreUserRecipient[] to Recipient[] for the dropdown
const recipientsList = computed<Recipient[]>(() => {
  return users.value.map(user => ({
    userId: user.id,
    firstNames: user.first_name,
    lastName: user.last_name,
    email: user.email_address
  }))
})

// Convert current recipient to Recipient | null for v-model
const selectedRecipient = computed<Recipient | null>({
  get: () => {
    if (!props.viewer.recipient?.userId) return null
    return {
      userId: props.viewer.recipient.userId,
      firstNames: props.viewer.recipient.firstNames || '',
      lastName: props.viewer.recipient.lastName || '',
      email: props.viewer.recipient.email || ''
    }
  },
  set: (recipient: Recipient | null) => {
    if (recipient) {
      emit('update', 'recipient', {
        userId: recipient.userId,
        firstNames: recipient.firstNames,
        lastName: recipient.lastName,
        email: recipient.email
      })
    } else {
      emit('update', 'recipient', { userId: '', firstNames: '', lastName: '', email: '' })
    }
  }
})

onMounted(async () => {
  if (props.companyId) {
    await loadUsers(props.viewer.projectId ?? undefined)
  }
})

watch(() => props.companyId, async (newCompanyId) => {
  if (!newCompanyId) {
    users.value = []
  }
})

watch(() => props.viewer.projectId, async (newProjectId) => {
  if (props.companyId) {
    await loadUsers(newProjectId ?? undefined)
  } else {
    users.value = []
  }
})

async function loadUsers(projectId?: string) {
  if (!props.companyId) return
  
  loadingUsers.value = true
  try {
    const data = await props.getUserInfo(projectId)
    users.value = data
  } catch (error) {
    console.error('Error loading users:', error)
    users.value = []
  } finally {
    loadingUsers.value = false
  }
}

function updateProjectId(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update', 'projectId', value || null)
}

function updateRegion(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update', 'region', value || null)
}

function updateRecipientField(field: 'firstNames' | 'lastName' | 'email', value: string) {
  const currentRecipient = props.viewer.recipient || { userId: '', firstNames: '', lastName: '', email: '' }
  emit('update', 'recipient', {
    ...currentRecipient,
    [field]: value
  })
}
</script>

<template>
  <div class="viewer-item">
    <div class="viewer-content">
      <div class="viewer-type-badge">
        <span :class="['badge', isManual ? 'badge-manual' : 'badge-procore']">
          {{ isManual ? 'Manual Entry' : 'Procore User' }}
        </span>
        <span v-if="!viewer.projectId" class="badge badge-all-projects">
          All Projects
        </span>
        <span v-if="viewer.region" class="badge badge-region">
          {{ viewer.region }}
        </span>
      </div>

      <!-- Region selector for all viewers -->
      <div class="viewer-field">
        <label>Region</label>
        <select
          :value="viewer.region || ''"
          @change="updateRegion"
          class="input-small"
        >
          <option value="">All Regions</option>
          <option v-for="region in australianRegions" :key="region.value" :value="region.value">
            {{ region.label }}
          </option>
        </select>
      </div>

      <template v-if="!isManual">
        <div class="viewer-field">
          <label>Project</label>
          <select
            :value="viewer.projectId || ''"
            @change="updateProjectId"
            :disabled="!companyId"
            class="input-small"
          >
            <option value="">All Projects</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>

        <div class="viewer-field">
          <label>Procore User</label>
          <div v-if="loadingUsers" class="loading-state">
            Loading...
          </div>
          <RecipientDropdown 
            v-else
            v-model="selectedRecipient"
            :recipients="recipientsList"
          />
        </div>
      </template>

      <template v-else>
        <div class="viewer-row">
          <div class="viewer-field">
            <label>First Name</label>
            <input
              :value="viewer.recipient?.firstNames || ''"
              @input="updateRecipientField('firstNames', ($event.target as HTMLInputElement).value)"
              type="text"
              class="input-small"
            />
          </div>
          
          <div class="viewer-field">
            <label>Last Name</label>
            <input
              :value="viewer.recipient?.lastName || ''"
              @input="updateRecipientField('lastName', ($event.target as HTMLInputElement).value)"
              type="text"
              class="input-small"
            />
          </div>
        </div>
        
        <div class="viewer-field">
          <label>Email Address</label>
          <input
            :value="viewer.recipient?.email || ''"
            @input="updateRecipientField('email', ($event.target as HTMLInputElement).value)"
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.viewer-type-badge {
  margin-bottom: 0.25rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.badge-all-projects {
  background: #fff3e0;
  color: #ef6c00;
}

.badge-region {
  background: #e8f5e9;
  color: #2e7d32;
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

.loading-state {
  padding: 0.4rem;
  color: #6c757d;
  font-style: italic;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f8f9fa;
  font-size: 0.85rem;
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