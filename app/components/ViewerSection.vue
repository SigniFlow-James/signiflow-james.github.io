<!-- ========================================
// FILE: components/ViewerSection.vue
======================================== -->
<script setup lang="ts">
import { ref } from 'vue'
import type { Project, ViewerItem } from '~/scripts/models'

const props = defineProps<{
  modelValue: ViewerItem[]
  companyId: string | null
  defaultProjectId: string | null
  projects: Project[]
  getUserInfo: (projectId?: string) => Promise<any[]>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ViewerItem[]]
}>()

const showNewViewer = ref(false)
const newViewer = ref<ViewerItem>({
  companyId: null,
  projectId: null,
  type: 'procore',
  recipient: {
    userId: '',
    firstNames: '',
    lastName: '',
    email: ''
  },
  region: null
})

function addViewer() {
  const viewerToAdd = {
    ...newViewer.value,
    companyId: props.companyId,
    projectId: newViewer.value.projectId || null
  }
  emit('update:modelValue', [...props.modelValue, viewerToAdd])
  resetNewViewer()
  showNewViewer.value = false
}

function deleteViewer(index: number) {
  const updated = [...props.modelValue]
  updated.splice(index, 1)
  emit('update:modelValue', updated)
}

function updateViewer(index: number, field: keyof ViewerItem, value: any) {
  const updated = [...props.modelValue]
  updated[index] = { ...updated[index], [field]: value } as ViewerItem
  emit('update:modelValue', updated)
}

function resetNewViewer() {
  newViewer.value = {
    companyId: null,
    projectId: null,
    type: 'procore',
    recipient: {
      userId: '',
      firstNames: '',
      lastName: '',
      email: ''
    },
    region: null
  }
}

function toggleNewViewer() {
  if (!showNewViewer.value) {
    // Don't set default project anymore since it's optional
    newViewer.value.projectId = null
  }
  showNewViewer.value = !showNewViewer.value
}
</script>

<template>
  <div class="viewer-section">
    <div class="section-header">
      <h3>Contract Viewers</h3>
      <button @click="toggleNewViewer" :disabled="!companyId" class="btn btn-success btn-small"
        :title="!companyId ? 'Select a company first' : ''">
        {{ showNewViewer ? 'Cancel' : '+ Add Viewer' }}
      </button>
    </div>

    <div class="section-description">
      Add users who will automatically receive viewer access to contracts.
    </div>

    <NewViewerForm v-if="showNewViewer" v-model="newViewer" :company-id="companyId"
      :default-project-id="defaultProjectId" :projects="projects" :get-user-info="getUserInfo" @add="addViewer" />

    <div class="section-list">
      <ViewerItem v-for="(viewer, index) in modelValue" :key="index" :viewer="viewer" :index="index"
        :company-id="companyId" :default-project-id="defaultProjectId" :projects="projects" :get-user-info="getUserInfo"
        @update="(field: keyof ViewerItem, value: any) => updateViewer(index, field, value)"
        @delete="deleteViewer(index)" />

      <div v-if="modelValue.length === 0" class="empty-state">
        No viewers configured
      </div>
    </div>
  </div>
</template>

<style scoped>
.viewer-section {
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.section-header h3 {
  margin: 0;
}

.section-description {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
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

.btn-small {
  font-size: 0.9rem;
}

.section-list {
  border: 1px solid #ccc;
  border-radius: 4px;
  max-height: 600px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  color: #6c757d;
  padding: 2rem;
}
</style>

<!-- ========================================
// END FILE: components/ViewerSection.vue
======================================== -->