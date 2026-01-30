<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
// Import clear, named components instead of messy path strings
import { AlertCircle, X } from 'lucide-vue-next'

const props = defineProps<{ 
  message: string 
  duration?: number 
  persistent?: boolean
}>()

const emit = defineEmits<{ dismiss: [] }>()
const visible = ref(true)
const timerId = ref<number | null>(null)

function dismiss() {
  visible.value = false
  setTimeout(() => emit('dismiss'), 300)
}

function startTimer() {
  if (props.duration && props.duration > 0) {
    timerId.value = window.setTimeout(() => dismiss(), props.duration)
  }
}

function clearTimer() {
  if (timerId.value) {
    clearTimeout(timerId.value)
    timerId.value = null
  }
}

watch(() => props.message, () => {
  visible.value = true
  clearTimer()
  startTimer()
})

onMounted(() => startTimer())
</script>

<template>
  <!-- Teleport ensures the toast isn't cut off by parent overflow:hidden -->
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" class="error-toast" @mouseenter="clearTimer" @mouseleave="startTimer">
        <div class="error-content">
          <div class="error-icon">
            <!-- Simply use the component name with a size prop -->
            <AlertCircle :size="20" stroke-width="2.5" />
          </div>
          
          <div class="error-text">{{ message }}</div>
          
          <button 
            v-if="persistent == false" 
            @click="dismiss" 
            class="dismiss-btn" 
            aria-label="Dismiss"
          >
            <X :size="16" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* All existing styles remain the same */
.error-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  min-width: 300px;
  background: white;
  border: 1px solid #fecaca;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  
}
.error-content { display: flex; align-items: flex-start; gap: 0.75rem; padding: 1rem; }
.error-icon { flex-shrink: 0; color: #ef4444; margin-top: 0.125rem; }
.error-text { flex: 1; color: #991b1b; font-size: 0.875rem; line-height: 1.5; font-weight: 500; font-family: system-ui;}
.dismiss-btn { 
  flex-shrink: 0; background: none; border: none; color: #9ca3af; 
  cursor: pointer; display: flex; align-items: center; justify-content: center; 
}
/* Toast animation classes omitted for brevity */
</style>
