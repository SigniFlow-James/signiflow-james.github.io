<!-- ========================================
// FILE: components/FilterSection.vue
======================================== -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FilterItem } from '~/scripts/models';

const props = defineProps<{
  modelValue: FilterItem[]
  title: string
  filterType: 'user' | 'vendor'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FilterItem[]]
}>()

const showNewFilter = ref(false)
const newFilter = ref<FilterItem>({
  projectId: '',
  type: 0,
  value: '',
  include: true
})

const filterTypes = computed(() => {
  if (props.filterType === 'user') {
    return [
      { value: 0, label: 'Employee ID' },
      { value: 1, label: 'Job Title' },
      { value: 2, label: 'First Name' },
      { value: 3, label: 'Last Name' },
      { value: 4, label: 'Email Address' }
    ]
  } else {
    return [
      { value: 0, label: 'Vendor ID' },
      { value: 1, label: 'Vendor Name' },
      { value: 2, label: 'Email Address' },
      { value: 3, label: 'Primary Contact First Name' },
      { value: 4, label: 'Primary Contact Last Name' }
    ]
  }
})

function addFilter() {
  emit('update:modelValue', [...props.modelValue, { ...newFilter.value }])
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
    projectId: '',
    type: 0,
    value: '',
    include: true
  }
}
</script>

<template>
  <div class="filter-section">
    <div class="section-header">
      <h3>{{ title }}</h3>
      <button
        @click="showNewFilter = !showNewFilter"
        class="btn btn-success btn-small"
      >
        {{ showNewFilter ? 'Cancel' : '+ Add Filter' }}
      </button>
    </div>
    
    <NewFilterForm
      v-if="showNewFilter"
      v-model="newFilter"
      :filter-types="filterTypes"
      @add="addFilter"
    />
    
    <div class="filters-list">
      <FilterItem
        v-for="(filter, index) in modelValue"
        :key="index"
        :filter="filter"
        :filter-types="filterTypes"
        :index="index"
        @update="(field, value) => updateFilter(index, field, value)"
        @delete="deleteFilter(index)"
      />
      
      <div v-if="modelValue.length === 0" class="empty-state">
        No {{ filterType }} filters configured
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
  margin-bottom: 1rem;
}

.section-header h3 {
  margin: 0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-small {
  font-size: 0.9rem;
}

.filters-list {
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