<!-- ========================================
// FILE: components/FilterSection.vue
======================================== -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FilterItem, Project } from '~/scripts/models';

const props = defineProps<{
  modelValue: FilterItem[]
  title: string
  companyId: string | null
  defaultProjectId: string | null
  projects: Project[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FilterItem[]]
}>()

const showNewFilter = ref(false)
const newFilter = ref<FilterItem>({
  companyId: null,
  projectId: null,
  type: 0,
  value: '',
  include: true
})

const filterTypes = computed(() => {
  return [
      { value: 0, label: 'Employee ID' },
      { value: 1, label: 'Job Title' },
      { value: 2, label: 'First Name' },
      { value: 3, label: 'Last Name' },
      { value: 4, label: 'Email Address' }
    ]
})

function addFilter() {
  // Set company ID and default project ID when adding
  const filterToAdd = {
    ...newFilter.value,
    companyId: props.companyId,
    projectId: newFilter.value.projectId || props.defaultProjectId
  }
  emit('update:modelValue', [...props.modelValue, filterToAdd])
  resetNewFilter()
  showNewFilter.value = false
}

function deleteFilter(index: number) {
  const updated = [...props.modelValue]
  updated.splice(index, 1)
  emit('update:modelValue', updated)
}

function updateFilter(index: number, field: keyof FilterItem, value: any) {
  const updated = [...props.modelValue]
  updated[index] = { ...updated[index], [field]: value } as FilterItem
  emit('update:modelValue', updated)
}

function resetNewFilter() {
  newFilter.value = {
    companyId: null,
    projectId: null,
    type: 0,
    value: '',
    include: true
  }
}

function toggleNewFilter() {
  if (!showNewFilter.value) {
    // When opening, set default project ID
    newFilter.value.projectId = props.defaultProjectId
  }
  showNewFilter.value = !showNewFilter.value
}
</script>

<template>
  <div class="filter-section">
    <div class="section-header">
      <h3>{{ title }}</h3>
      <button
        @click="toggleNewFilter"
        :disabled="!companyId"
        class="btn btn-success btn-small"
        :title="!companyId ? 'Select a company first' : ''"
      >
        {{ showNewFilter ? 'Cancel' : '+ Add Filter' }}
      </button>
    </div>

    <div class="section-description">
      Filter company users who will be selectable for signing.
    </div>
    
    <NewFilterForm
      v-if="showNewFilter"
      v-model="newFilter"
      :filter-types="filterTypes"
      :company-id="companyId"
      :default-project-id="defaultProjectId"
      :projects="projects"
      @add="addFilter"
    />
    
    <div class="section-list">
      <FilterItem
        v-for="(filter, index) in modelValue"
        :key="index"
        :filter="filter"
        :filter-types="filterTypes"
        :index="index"
        :company-id="companyId"
        :default-project-id="defaultProjectId"
        :projects="projects"
        @update="(field, value) => updateFilter(index, field, value)"
        @delete="deleteFilter(index)"
      />
      
      <div v-if="modelValue.length === 0" class="empty-state">
        No user filters configured
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-section {
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
// END FILE: components/FilterSection.vue
======================================== -->