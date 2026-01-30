<!-- ========================================
// FILE: components/SigniflowForm.vue
======================================== -->
<script setup lang="ts">
import { computed } from 'vue'
import type { Recipient, FormData } from '~/scripts/models'

const props = defineProps<{
  form: FormData
  procoreContext: any
  sending: boolean
  sendResult: string | null
  generalContractorSigners: Recipient[]
}>()

const emit = defineEmits<{
  'update:form': [value: FormData]
  'submit': []
}>()

const formModel = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})

// Sub-contractor manual entry
const subContractorFirstName = computed({
  get: () => props.form.subContractorSigner?.firstNames || '',
  set: (value: string) => {
    emit('update:form', {
      ...props.form,
      subContractorSigner: {
        ...props.form.subContractorSigner,
        userId: '',
        firstNames: value,
        lastName: props.form.subContractorSigner?.lastName || '',
        email: props.form.subContractorSigner?.email || ''
      }
    })
  }
})

const subContractorLastName = computed({
  get: () => props.form.subContractorSigner?.lastName || '',
  set: (value: string) => {
    emit('update:form', {
      ...props.form,
      subContractorSigner: {
        ...props.form.subContractorSigner,
        userId: '',
        firstNames: props.form.subContractorSigner?.firstNames || '',
        lastName: value,
        email: props.form.subContractorSigner?.email || ''
      }
    })
  }
})

const subContractorEmail = computed({
  get: () => props.form.subContractorSigner?.email || '',
  set: (value: string) => {
    emit('update:form', {
      ...props.form,
      subContractorSigner: {
        ...props.form.subContractorSigner,
        userId: '',
        firstNames: props.form.subContractorSigner?.firstNames || '',
        lastName: props.form.subContractorSigner?.lastName || '',
        email: value
      }
    })
  }
})

const isDisabled = computed(() =>
  !props.procoreContext ||
  !props.form.generalContractorSigner ||
  !props.form.subContractorSigner?.firstNames ||
  !props.form.subContractorSigner?.lastName ||
  !props.form.subContractorSigner?.email ||
  props.sending
)
</script>

<template>
  <section class="signiflow-form">
    <div class="form-group">
      <label class="form-label">
        General Contractor Signer
        <span class="required">*</span>
      </label>
      <RecipientDropdown 
        v-model="formModel.generalContractorSigner" 
        :recipients="generalContractorSigners" 
      />
    </div>
    
    <div class="form-group">
      <label class="form-label">
        Sub-Contractor Signer
        <span class="required">*</span>
      </label>
      <div class="name-row">
        <input
          v-model="subContractorFirstName"
          type="text"
          placeholder="First name"
          class="form-input"
          required
        />
        <input
          v-model="subContractorLastName"
          type="text"
          placeholder="Last name"
          class="form-input"
          required
        />
      </div>
      <input
        v-model="subContractorEmail"
        type="email"
        placeholder="Email address"
        class="form-input"
        style="margin-top: 0.5rem;"
        required
      />
    </div>

    <div class="form-group">
      <label class="form-label">
        Custom Message
      </label>
      <textarea 
        v-model="formModel.customMessage" 
        placeholder="Please sign this document." 
        rows="4"
        class="form-textarea" 
      />
    </div>

    <button 
      class="styled-btn" 
      :disabled="isDisabled" 
      @click="emit('submit')"
    >
      {{ sending ? 'Sending...' : 'Send via Signiflow' }}
    </button>

    <Transition name="fade">
      <div v-if="sendResult" class="result-message" :class="{ 'success': sendResult.includes('success') }">
        {{ sendResult }}
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.signiflow-form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.required {
  color: #ef4444;
}

.name-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.styled-btn {
  width: 100%;
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #00abeb 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 171, 235, 0.3);
}

.styled-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 171, 235, 0.4);
}

.styled-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 171, 235, 0.3);
}

.styled-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.result-message {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.result-message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<!-- ========================================
// END FILE: components/SigniflowForm.vue
======================================== -->