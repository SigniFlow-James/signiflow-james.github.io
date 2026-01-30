<!-- ========================================
// FILE: components/RecipientDropdown.vue
======================================== -->
<script setup lang="ts">
import type { Recipient } from '~/scripts/models'
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: Recipient | null
  recipients: Recipient[]
}>();

const emit = defineEmits<{
  'update:modelValue': [Recipient | null]
}>();

const searchQuery = ref('');
const isOpen = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const dropdownStyle = ref({});

// Computed getter/setter for v-model
const selected = computed<Recipient | null>({
  get: () => props.modelValue,
  set: (value: Recipient | null) => emit('update:modelValue', value)
});

function displayName(recipient: Recipient) {
  return `${recipient.firstNames} ${recipient.lastName}`;
}

// Filter recipients based on search query
const filteredRecipients = computed(() => {
  if (!searchQuery.value) return props.recipients;
  
  const query = searchQuery.value.toLowerCase();
  return props.recipients.filter(recipient => 
    displayName(recipient).toLowerCase().includes(query)
  );
});

// Display text in the input
const displayText = computed(() => {
  if (isOpen.value) return searchQuery.value;
  return selected.value ? displayName(selected.value) : '';
});

function selectRecipient(recipient: Recipient) {
  selected.value = recipient;
  searchQuery.value = '';
  isOpen.value = false;
}

function updateDropdownPosition() {
  if (!inputRef.value || !isOpen.value) return;
  
  const rect = inputRef.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const dropdownHeight = 200; // max-height of dropdown
  
  // Check if there's enough space below
  const spaceBelow = viewportHeight - rect.bottom;
  const shouldOpenUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
  
  dropdownStyle.value = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    top: shouldOpenUpward ? 'auto' : `${rect.bottom}px`,
    bottom: shouldOpenUpward ? `${viewportHeight - rect.top}px` : 'auto',
    zIndex: 9999
  };
}

function handleFocus() {
  isOpen.value = true;
  updateDropdownPosition();
}

function handleBlur() {
  // Delay to allow click events on options to fire
  setTimeout(() => {
    isOpen.value = false;
    searchQuery.value = '';
  }, 200);
}

function handleScroll() {
  if (isOpen.value) {
    updateDropdownPosition();
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, true);
  window.addEventListener('resize', updateDropdownPosition);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll, true);
  window.removeEventListener('resize', updateDropdownPosition);
});
</script>

<template>
  <div class="dropdown-container">
    <input
      ref="inputRef"
      v-model="searchQuery"
      type="text"
      class="search-input"
      :class="{ 'has-selection': !!selected }"
      :placeholder="selected ? displayName(selected) : 'Type to search people'"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    
    <Teleport to="body">
      <div v-if="isOpen" class="dropdown-list" :style="dropdownStyle">
        <div
          v-for="recipient in filteredRecipients"
          :key="recipient.email"
          class="dropdown-item"
          @mousedown="selectRecipient(recipient)"
        >
          {{ displayName(recipient) }}
        </div>
        <div v-if="filteredRecipients.length === 0" class="dropdown-item no-results">
          No matches found
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.dropdown-container {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: #ccc;
}

/* When a recipient is selected */
.search-input.has-selection::placeholder {
  color: #111827; /* black */
  opacity: 1;
}


.search-input:focus {
  outline: none;
  border-color: #4a90e2;
}

.dropdown-list {
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  font-family: system-ui;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

.dropdown-item.no-results {
  color: #999;
  cursor: default;
}

.dropdown-item.no-results:hover {
  background-color: transparent;
}
</style>

<!-- ========================================
// END FILE: components/RecipientDropdown.vue
======================================== -->