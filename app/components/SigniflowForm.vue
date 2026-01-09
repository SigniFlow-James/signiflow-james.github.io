<!-- ========================================
// FILE: components/SigniflowForm.vue
======================================== -->
<script setup lang="ts">
interface FormData {
  name: string
  email: string
  customMessage: string
}

const props = defineProps<{
  form: FormData
  procoreContext: any
  sending: boolean
  sendResult: string | null
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
  props.form.name.length <= 0 || 
  props.form.email.length <= 0 || 
  props.sending
)
</script>

<template>
  <section style="margin-top: 1rem;">
    <label>
      Name<br />
      <input 
        v-model="formModel.name" 
        type="text" 
        style="width: 100%;" 
      />
    </label>

    <label>
      Email<br />
      <input 
        v-model="formModel.email" 
        type="text" 
        style="width: 100%;" 
      />
    </label>

    <label style="display: block; margin-top: 1rem;">
      Custom Message<br />
      <textarea 
        v-model="formModel.customMessage" 
        rows="4" 
        style="width: 100%;" 
      />
    </label>

    <button 
      class="styled-btn"
      :disabled="isDisabled"
      @click="emit('submit')"
    >
      {{ sending ? 'Sending…' : 'Send via Signiflow' }}
    </button>

    <p v-if="sendResult" style="margin-top: 0.5rem;">
      {{ sendResult }}
    </p>
  </section>
</template>

<style scoped>
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