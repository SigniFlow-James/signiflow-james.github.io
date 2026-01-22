<!-- ========================================
// FILE: components/NewFilterForm.vue
======================================== -->
<script setup lang="ts">
import type { FilterItem, FilterType } from '~/scripts/models';

const props = defineProps<{
  modelValue: FilterItem
  filterTypes: FilterType[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FilterItem]
  add: []
}>()

function updateField(field: keyof FilterItem, value: any) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <div class="new-filter-form">
    <h4>New Filter</h4>
    
    <div class="form-fields">
      <div class="form-group">
        <label>Project ID (leave empty for company-wide filtering)</label>
        <input
          :value="modelValue.projectId"
          @input="updateField('projectId', ($event.target as HTMLInputElement).value || null)"
          type="text"
          placeholder="Optional"
          class="form-input"
        />
      </div>
      
      <div class="form-group">
        <label>Filter Type</label>
        <select
          :value="modelValue.type"
          @change="updateField('type', Number(($event.target as HTMLSelectElement).value))"
          class="form-input"
        >
          <option v-for="type in filterTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Value</label>
        <input
          :value="modelValue.value"
          @input="updateField('value', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Filter value"
          class="form-input"
        />
      </div>
      
      <div class="form-checkbox">
        <input
          :checked="modelValue.include"
          @change="updateField('include', ($event.target as HTMLInputElement).checked)"
          type="checkbox"
          id="newFilterInclude"
        />
        <label for="newFilterInclude">Inclusive? (uncheck to exclude)</label>
      </div>
      
      <button
        @click="emit('add')"
        :disabled="!modelValue.value"
        class="btn btn-success btn-full"
      >
        Add Filter
      </button>
    </div>
  </div>
</template>

<style scoped>
.new-filter-form {
  border: 2px solid #28a745;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
}

.new-filter-form h4 {
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

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-checkbox input {
  margin: 0;
}

.form-checkbox label {
  font-size: 0.9rem;
  margin: 0;
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
// END FILE: components/NewFilterForm.vue
======================================== -->