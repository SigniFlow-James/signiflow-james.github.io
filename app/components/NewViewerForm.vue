<!-- ========================================
// FILE: components/NewViewerForm.vue
======================================== -->
<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import type { ViewerItem, Project, ProcoreUserRecipient, Recipient } from '~/scripts/models'

const props = defineProps<{
  modelValue: ViewerItem
  companyId: string | null
  defaultProjectId: string | null
  projects: Project[]
  getUserInfo: (projectId?: string) => Promise<any[]>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ViewerItem]
  add: []
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

const isManual = computed(() => props.modelValue.type === 'manual')

const isValid = computed(() => {
  if (isManual.value) {
    return !!(
      props.modelValue.recipient?.firstNames && 
      props.modelValue.recipient?.lastName && 
      props.modelValue.recipient?.email
    )
  } else {
    return !!props.modelValue.recipient?.firstNames
  }
})

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
    if (!props.modelValue.recipient?.userId) return null
    return {
      userId: props.modelValue.recipient.userId,
      firstNames: props.modelValue.recipient.firstNames || '',
      lastName: props.modelValue.recipient.lastName || '',
      email: props.modelValue.recipient.email || ''
    }
  },
  set: (recipient: Recipient | null) => {
    if (recipient) {
      updateField('recipient', {
        userId: recipient.userId,
        firstNames: recipient.firstNames,
        lastName: recipient.lastName,
        email: recipient.email
      })
    } else {
      updateField('recipient', { userId: '', firstNames: '', lastName: '', email: '' })
    }
  }
})

onMounted(async () => {
  // If no company ID, force manual type
  if (!props.companyId && props.modelValue.type === 'procore') {
    updateField('type', 'manual')
  }
  
  if (props.companyId) {
    await loadUsers()
  }
})

watch(() => props.modelValue.projectId, async (newProjectId) => {
  console.log('Project ID changed to:', newProjectId)
  if (props.companyId) {
    await loadUsers(newProjectId ?? undefined)
  }
})

watch(() => props.modelValue.type, (_) => {
  updateField('recipient', { userId: '', firstNames: '', lastName: '', email: '' })
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

function updateField(field: keyof ViewerItem, value: any) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function updateProjectId(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  updateField('projectId', value || null)
}

function updateRegion(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  updateField('region', value || null)
}
</script>

<template>
  <div class="new-viewer-form">
    <h4>New Viewer</h4>
    
    <div class="form-fields">
      <div class="form-group">
        <label>Viewer Type</label>
        <div class="radio-group">
          <label 
            class="radio-label" 
            :class="{ 'radio-disabled': companyId === null }"
            :title="companyId === null ? 'Select a company to add Procore users' : ''"
          >
            <input
              type="radio"
              :checked="modelValue.type === 'procore'"
              :disabled="companyId === null"
              @change="updateField('type', 'procore')"
            />
            <span>Procore User</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              :checked="modelValue.type === 'manual'"
              @change="updateField('type', 'manual')"
            />
            <span>Manual Entry</span>
          </label>
        </div>
        <div v-if="companyId === null" class="helper-text">
          Select a company to add Procore users
        </div>
      </div>

      <!-- Region dropdown - for all viewer types -->
      <div class="form-group">
        <label>Region</label>
        <select
          :value="modelValue.region || ''"
          @change="updateRegion"
          class="form-input"
        >
          <option value="">All Regions</option>
          <option v-for="region in australianRegions" :key="region.value" :value="region.value">
            {{ region.label }}
          </option>
        </select>
      </div>

      <div v-if="!isManual" class="form-group">
        <label>Project</label>
        <select
          :value="modelValue.projectId || ''"
          @change="updateProjectId"
          :disabled="!companyId"
          class="form-input"
        >
          <option value="">All Projects</option>
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>
      </div>

      <div v-if="!isManual" class="form-group">
        <label>Procore User</label>
        <div v-if="loadingUsers" class="loading-state">
          Loading users...
        </div>
        <RecipientDropdown 
          v-else
          v-model="selectedRecipient"
          :recipients="recipientsList"
        />
      </div>

      <template v-if="isManual">
        <div class="form-row">
          <div class="form-group">
            <label>First Name</label>
            <input
              :value="modelValue.recipient?.firstNames || ''"
              @input="updateField('recipient', { 
                ...modelValue.recipient, 
                firstNames: ($event.target as HTMLInputElement).value 
              })"
              type="text"
              placeholder="First name"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label>Last Name</label>
            <input
              :value="modelValue.recipient?.lastName || ''"
              @input="updateField('recipient', { 
                ...modelValue.recipient, 
                lastName: ($event.target as HTMLInputElement).value 
              })"
              type="text"
              placeholder="Last name"
              class="form-input"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>Email Address</label>
          <input
            :value="modelValue.recipient?.email || ''"
            @input="updateField('recipient', { 
              ...modelValue.recipient, 
              email: ($event.target as HTMLInputElement).value 
            })"
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

.loading-state {
  padding: 0.5rem;
  color: #6c757d;
  font-style: italic;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f8f9fa;
}

.helper-text {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #856404;
  font-style: italic;
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

.radio-label.radio-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.radio-label input[type="radio"] {
  margin: 0;
}

.radio-label input[type="radio"]:disabled {
  cursor: not-allowed;
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