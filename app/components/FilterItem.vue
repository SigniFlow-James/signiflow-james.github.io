<!-- ========================================
// FILE: components/FilterItem.vue
======================================== -->
<script setup lang="ts">
import { ref } from 'vue'
import type { FilterItem, FilterType, Project } from '~/scripts/models'

const props = defineProps<{
  filter: FilterItem
  filterTypes: FilterType[]
  index: number
  companyId: string | null
  defaultProjectId: string | null
  projects: Project[]
}>()

const emit = defineEmits<{
  update: [field: keyof FilterItem, value: any]
  delete: []
}>()

const loadingProjects = ref(false)

function updateProjectId(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update', 'projectId', value || null)
}
</script>

<template>
  <div class="filter-item">
    <div class="filter-content">
      <div class="filter-row">
        <div class="filter-field">
          <label>Project</label>
          <select
            :value="filter.projectId || ''"
            @change="updateProjectId"
            :disabled="loadingProjects || !companyId"
            class="input-small"
          >
            <option value="">
              {{ loadingProjects ? 'Loading...' : 'Company-wide' }}
            </option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-field">
          <label>Type</label>
          <select
            :value="filter.type"
            @change="emit('update', 'type', Number(($event.target as HTMLSelectElement).value))"
            class="input-small"
          >
            <option v-for="type in filterTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="filter-field">
        <label>Value</label>
        <input
          :value="filter.value"
          @input="emit('update', 'value', ($event.target as HTMLInputElement).value)"
          type="text"
          class="input-small"
        />
      </div>
      
      <div class="filter-checkbox">
        <input
          :checked="filter.include"
          @change="emit('update', 'include', ($event.target as HTMLInputElement).checked)"
          type="checkbox"
          :id="`filterInclude${index}`"
        />
        <label :for="`filterInclude${index}`">
          {{ filter.include ? 'Include' : 'Exclude' }}
        </label>
      </div>
    </div>
    
    <button @click="emit('delete')" class="btn btn-danger btn-small">
      Delete
    </button>
  </div>
</template>

<style scoped>
.filter-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
}

.filter-content {
  flex: 1;
}

.filter-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.filter-field {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.filter-field label {
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

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.filter-checkbox input {
  margin: 0;
}

.filter-checkbox label {
  font-size: 0.85rem;
  margin: 0;
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
// END FILE: components/FilterItem.vue
======================================== -->