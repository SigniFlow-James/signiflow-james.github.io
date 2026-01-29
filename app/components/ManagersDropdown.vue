<!-- ========================================
// FILE: components/ManagersDropdown.vue
======================================== -->
<script setup lang="ts">
import type { Recipient } from '~/scripts/models'
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue: Recipient | null
  recipients: Recipient[]
}>();

const emit = defineEmits<{
  'update:modelValue': [Recipient | null]
}>();

const searchQuery = ref('');
const isOpen = ref(false);

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

function handleFocus() {
  isOpen.value = true;
}

function handleBlur() {
  // Delay to allow click events on options to fire
  setTimeout(() => {
    isOpen.value = false;
    searchQuery.value = '';
  }, 200);
}
</script>

<template>
  <div class="dropdown-container">
    <input
      v-model="searchQuery"
      type="text"
      class="search-input"
      :placeholder="selected ? displayName(selected) : 'Type to search people'"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    
    <div v-if="isOpen" class="dropdown-list">
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

.search-input:focus {
  outline: none;
  border-color: #4a90e2;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: -1px;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
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
// END FILE: components/ManagersDropdown.vue
======================================== -->