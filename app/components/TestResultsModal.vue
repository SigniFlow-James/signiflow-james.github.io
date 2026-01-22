<!-- ========================================
// FILE: components/TestResultsModal.vue
======================================== -->
<script setup lang="ts">
const props = defineProps<{
  results: any
  error: string | null
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Test Results</h3>
        <button @click="emit('close')" class="btn btn-secondary">
          Close
        </button>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else-if="results">
        <ResultsTable
          title="Users"
          :items="results.users"
          :columns="[
            { key: 'employee_id', label: 'Employee ID' },
            { key: 'name', label: 'Name', computed: (u) => `${u.first_name} ${u.last_name}` },
            { key: 'job_title', label: 'Job Title' },
            { key: 'email_address', label: 'Email' }
          ]"
        />
        
        <ResultsTable
          title="Vendors"
          :items="results.vendors"
          :columns="[
            { key: 'vendor_id', label: 'Vendor ID' },
            { key: 'vendor_name', label: 'Vendor Name' },
            { key: 'contact', label: 'Primary Contact', computed: (v) => `${v.primary_contact_first_name} ${v.primary_contact_last_name}` },
            { key: 'email_address', label: 'Email' }
          ]"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 90%;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.error-message {
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
</style>

<!-- ========================================
// END FILE: components/TestResultsModal.vue
======================================== -->