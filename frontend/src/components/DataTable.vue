<template>
  <div class="data-table-container">
    <div class="table-header d-flex justify-content-between align-items-center mb-3">
      <div>
        <h5 class="mb-0">{{ title }}</h5>
        <small class="text-muted" v-if="items.length > 0">
          Showing {{ startIndex + 1 }}-{{ Math.min(endIndex, items.length) }} of {{ items.length }} entries
        </small>
      </div>
      <div class="d-flex gap-2">
        <input
          type="text"
          class="form-control form-control-sm"
          placeholder="Search..."
          v-model="searchQuery"
          style="width: 200px;"
        />
        <ExportButtons
          v-if="exportable"
          :data="filteredItems"
          :fields="columns"
          :filename="title.toLowerCase().replace(/\s+/g, '_')"
        />
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="{ 'sortable': column.sortable }"
              @click="column.sortable && sortBy(column.key)"
            >
              {{ column.label }}
              <i
                v-if="column.sortable"
                class="fas ms-1"
                :class="getSortIcon(column.key)"
              ></i>
            </th>
            <th v-if="actions && actions.length > 0">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length + (actions ? 1 : 0)" class="text-center py-4">
              <div class="spinner-border spinner-border-sm me-2" role="status"></div>
              Loading...
            </td>
          </tr>
          <tr v-else-if="filteredItems.length === 0">
            <td :colspan="columns.length + (actions ? 1 : 0)" class="text-center py-4 text-muted">
              <i class="fas fa-inbox fa-2x mb-2"></i>
              <br>
              No data available
            </td>
          </tr>
          <tr
            v-else
            v-for="item in paginatedItems"
            :key="item.id || item"
            @click="rowClickable && $emit('row-click', item)"
            :class="{ 'table-active': rowClickable }"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="column.class"
            >
              <slot
                :name="`column-${column.key}`"
                :item="item"
                :value="getNestedValue(item, column.key)"
              >
                {{ formatValue(getNestedValue(item, column.key), column) }}
              </slot>
            </td>
            <td v-if="actions && actions.length > 0">
              <div class="btn-group btn-group-sm" role="group">
                <button
                  v-for="action in actions"
                  :key="action.key"
                  :class="`btn btn-${action.variant || 'outline-primary'}`"
                  @click.stop="$emit(action.event, item)"
                  :title="action.label"
                >
                  <i :class="action.icon"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <nav v-if="showPagination && totalPages > 1" class="mt-3">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">
            <i class="fas fa-chevron-left"></i>
          </a>
        </li>
        <li
          v-for="page in visiblePages"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
        >
          <a class="page-link" href="#" @click.prevent="goToPage(page)">
            {{ page }}
          </a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">
            <i class="fas fa-chevron-right"></i>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import ExportButtons from './ExportButtons.vue'

export default {
  name: 'DataTable',
  components: {
    ExportButtons
  },
  props: {
    title: {
      type: String,
      default: 'Data Table'
    },
    items: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      required: true
    },
    actions: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    pageSize: {
      type: Number,
      default: 10
    },
    exportable: {
      type: Boolean,
      default: true
    },
    rowClickable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['row-click', 'edit', 'delete', 'view'],
  setup(props) {
    const searchQuery = ref('')
    const sortKey = ref('')
    const sortOrder = ref('asc') // 'asc' or 'desc'
    const currentPage = ref(1)

    const filteredItems = computed(() => {
      let items = [...props.items]

      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        items = items.filter(item =>
          props.columns.some(column => {
            const value = getNestedValue(item, column.key)
            return String(value).toLowerCase().includes(query)
          })
        )
      }

      // Apply sorting
      if (sortKey.value) {
        items.sort((a, b) => {
          const aVal = getNestedValue(a, sortKey.value)
          const bVal = getNestedValue(b, sortKey.value)

          let result = 0
          if (aVal < bVal) result = -1
          if (aVal > bVal) result = 1

          return sortOrder.value === 'desc' ? -result : result
        })
      }

      return items
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredItems.value.length / props.pageSize)
    })

    const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * props.pageSize
      const end = start + props.pageSize
      return filteredItems.value.slice(start, end)
    })

    const startIndex = computed(() => {
      return (currentPage.value - 1) * props.pageSize
    })

    const endIndex = computed(() => {
      return startIndex.value + paginatedItems.value.length
    })

    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value
      const delta = 2

      for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
        pages.push(i)
      }

      return pages
    })

    const showPagination = computed(() => {
      return filteredItems.value.length > props.pageSize
    })

    const sortBy = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortKey.value = key
        sortOrder.value = 'asc'
      }
    }

    const getSortIcon = (key) => {
      if (sortKey.value !== key) return 'fa-sort'
      return sortOrder.value === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((current, key) => current?.[key], obj)
    }

    const formatValue = (value, column) => {
      if (value === null || value === undefined) return ''

      if (column.formatter) {
        return column.formatter(value)
      }

      if (column.type === 'date') {
        return new Date(value).toLocaleDateString()
      }

      if (column.type === 'datetime') {
        return new Date(value).toLocaleString()
      }

      if (column.type === 'number') {
        return Number(value).toLocaleString()
      }

      if (column.type === 'boolean') {
        return value ? 'Yes' : 'No'
      }

      return String(value)
    }

    // Reset to first page when search changes
    watch(searchQuery, () => {
      currentPage.value = 1
    })

    // Reset to first page when items change
    watch(() => props.items, () => {
      currentPage.value = 1
    })

    return {
      searchQuery,
      sortKey,
      sortOrder,
      currentPage,
      filteredItems,
      totalPages,
      paginatedItems,
      startIndex,
      endIndex,
      visiblePages,
      showPagination,
      sortBy,
      getSortIcon,
      goToPage,
      getNestedValue,
      formatValue
    }
  }
}
</script>

<style scoped>
.data-table-container {
  background: white;
  border-radius: 0.375rem;
  padding: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.table-responsive {
  max-height: 600px;
  overflow-y: auto;
}

.table-active {
  cursor: pointer;
}

.table-active:hover {
  background-color: rgba(0, 123, 255, 0.1) !important;
}

.pagination .page-link {
  color: #0d6efd;
}

.pagination .page-link:hover {
  color: #0a58ca;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>