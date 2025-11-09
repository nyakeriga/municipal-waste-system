<template>
  <div class="btn-group" role="group">
    <button
      type="button"
      class="btn btn-outline-secondary btn-sm dropdown-toggle"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <i class="fas fa-download me-1"></i>Export
    </button>
    <ul class="dropdown-menu">
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click="exportCSV"
        >
          <i class="fas fa-file-csv me-2"></i>Export as CSV
        </a>
      </li>
      <li v-if="showPDF">
        <a
          class="dropdown-item"
          href="#"
          @click="exportPDF"
        >
          <i class="fas fa-file-pdf me-2"></i>Export as PDF
        </a>
      </li>
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click="exportJSON"
        >
          <i class="fas fa-file-code me-2"></i>Export as JSON
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default {
  name: 'ExportButtons',
  props: {
    data: {
      type: Array,
      required: true
    },
    fields: {
      type: Array,
      default: () => []
    },
    filename: {
      type: String,
      default: 'export'
    },
    showPDF: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    exportCSV() {
      try {
        // Convert data to CSV format
        const headers = this.fields.map(field => field.title || field.label || field.key)
        const rows = this.data.map(item =>
          this.fields.map(field => {
            const value = this.getNestedValue(item, field.id || field.key)
            return this.formatValue(value)
          })
        )

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, `${this.filename}.csv`)
      } catch (error) {
        console.error('CSV export error:', error)
        this.$emit('error', 'Failed to export CSV')
      }
    },

    exportPDF() {
      try {
        const doc = new jsPDF()

        // Add title
        doc.setFontSize(16)
        doc.text(this.filename.replace(/_/g, ' ').toUpperCase(), 14, 20)

        // Prepare table data
        const headers = this.fields.map(field => field.title || field.label || field.key)
        const rows = this.data.map(item =>
          this.fields.map(field => {
            const value = this.getNestedValue(item, field.id || field.key)
            return this.formatValue(value)
          })
        )

        // Add table
        doc.autoTable({
          head: [headers],
          body: rows,
          startY: 30,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        })

        doc.save(`${this.filename}.pdf`)
      } catch (error) {
        console.error('PDF export error:', error)
        this.$emit('error', 'Failed to export PDF')
      }
    },

    exportJSON() {
      try {
        const jsonContent = JSON.stringify(this.data, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
        saveAs(blob, `${this.filename}.json`)
      } catch (error) {
        console.error('JSON export error:', error)
        this.$emit('error', 'Failed to export JSON')
      }
    },

    getNestedValue(obj, path) {
      return path.split('.').reduce((current, key) => current?.[key], obj)
    },

    formatValue(value) {
      if (value === null || value === undefined) return ''
      if (typeof value === 'boolean') return value ? 'Yes' : 'No'
      if (value instanceof Date) return value.toLocaleDateString()
      return String(value)
    }
  }
}
</script>

<style scoped>
.btn-group .dropdown-toggle {
  border-radius: 0.375rem 0 0 0.375rem;
}

.dropdown-menu {
  min-width: 160px;
}

.dropdown-item {
  padding: 0.5rem 1rem;
}

.dropdown-item i {
  width: 16px;
}
</style>