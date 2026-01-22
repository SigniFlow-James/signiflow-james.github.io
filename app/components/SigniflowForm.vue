<!-- ========================================
// FILE: components/SigniflowForm.vue
======================================== -->
<script setup lang="ts">
import type { Recipient, FormData } from '~/scripts/models'

const props = defineProps<{
  form: FormData
  procoreContext: any
  sending: boolean
  sendResult: string | null
  managers: Recipient[]
}>()

const emit = defineEmits<{
  'update:form': [value: FormData]
  'submit': []
}>()

const formModel = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})

const isDisabled = computed(() =>
  !props.procoreContext ||
  !props.form.manager ||
  !props.form.vendor ||
  props.sending
)
</script>

<template>
  <section style="margin-top: 1rem;">
    <label>
      Manager<br />
      <ManagersDropdown v-model="formModel.manager" :recipients="props.managers" />
    </label>
    
    <label>
      Vendor<br />
      <ManagersDropdown v-model="formModel.vendor" :recipients="props.managers" />
    </label>

    <label style="display: block; margin-top: 1rem;">
      Custom Message<br />
      <textarea v-model="formModel.customMessage" placeholder="Please sign this document." rows="4"
        class="form-textarea" />
    </label>

    <button class="styled-btn" :disabled="isDisabled" @click="emit('submit')">
      {{ sending ? 'Sending…' : 'Send via Signiflow' }}
    </button>

    <p v-if="sendResult" style="margin-top: 0.5rem;">
      {{ sendResult }}
    </p>
  </section>
</template>

<style scoped>
.name-row {
  display: flex;
  gap: 8px;
}

.name-row input {
  flex: 1;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4a90e2;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.styled-btn {
  background-color: #00abeb;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
  text-decoration: none;
  display: inline-block;
}

.styled-btn:hover {
  background-color: #0056b3;
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
}

.styled-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 10px rgba(0, 123, 255, 0.4);
}

.styled-btn:disabled {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  opacity: 0.7;
}

.styled-btn:disabled:hover {
  background-color: #cccccc;
  box-shadow: none;
}
</style>

<!-- ========================================
// END FILE: components/SigniflowForm.vue
======================================== -->