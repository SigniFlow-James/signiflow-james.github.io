<!-- ========================================
// FILE: components/ResultsTable.vue
======================================== -->
<script setup lang="ts">
    import type { Column } from '~/scripts/models'

const props = defineProps<{
  title: string
  items: any[]
  columns: Column[]
}>()

function getCellValue(item: any, column: Column) {
  if (column.computed) {
    return column.computed(item)
  }
  return item[column.key]
}
</script>

<template>
  <div class="results-table">
    <h4>{{ title }} ({{ items?.length || 0 }})</h4>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.employee_id || item.vendor_id">
            <td v-for="column in columns" :key="column.key">
              {{ getCellValue(item, column) }}
            </td>
          </tr>
          <tr v-if="!items || items.length === 0">
            <td :colspan="columns.length" class="empty-cell">
              No {{ title.toLowerCase() }} found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.results-table {
  margin-bottom: 2rem;
}

.results-table:last-child {
  margin-bottom: 0;
}

.results-table h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.table-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  position: sticky;
  top: 0;
  background: #f8f9fa;
}

th {
  padding: 0.5rem;
  border-bottom: 2px solid #dee2e6;
  text-align: left;
  font-weight: 600;
}

td {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.empty-cell {
  padding: 1rem;
  text-align: center;
  color: #6c757d;
}

tbody tr:last-child td {
  border-bottom: none;
}
</style>

<!-- ========================================
// END FILE: components/ResultsTable.vue
======================================== -->