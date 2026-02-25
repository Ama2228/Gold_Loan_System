/**
 * PDF and Excel export utilities for reports
 */
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx'

/**
 * Export report to PDF
 * @param {Object} options
 * @param {string} options.title - Report title
 * @param {string} [options.subtitle] - Report subtitle
 * @param {Array<{label:string, value:string|number}>} [options.summaryRows] - Summary key-value pairs
 * @param {string[]} options.tableHeaders - Column headers
 * @param {Array<string[]>} options.tableData - Row data (array of arrays)
 * @param {string} options.filename - Download filename
 */
export function exportToPdf({ title, subtitle, summaryRows = [], tableHeaders, tableData, filename }) {
  const doc = new jsPDF({ orientation: 'portrait' })
  let y = 15

  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text(title, 14, y)
  y += 8

  if (subtitle) {
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(subtitle, 14, y)
    y += 8
  }

  if (summaryRows.length > 0) {
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text('Summary', 14, y)
    y += 6
    doc.setFont(undefined, 'normal')
    summaryRows.forEach(({ label, value }) => {
      doc.text(`${label}: ${value}`, 14, y)
      y += 5
    })
    y += 4
  }

  if (tableHeaders && tableData && tableData.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [234, 179, 8], textColor: 0 },
      margin: { left: 14 }
    })
  }

  doc.save(filename)
}

/**
 * Export report to Excel
 * @param {Object} options
 * @param {string} options.title - Report title
 * @param {string} [options.subtitle] - Report subtitle
 * @param {Array<{label:string, value:string|number}>} [options.summaryRows] - Summary key-value pairs
 * @param {string[]} options.tableHeaders - Column headers
 * @param {Array<string[]>} options.tableData - Row data (array of arrays)
 * @param {Array<{headers:string[], data:Array<string[]>, sheetName?:string}>} [options.extraSheets] - Additional sheets
 * @param {string} options.filename - Download filename
 */
export function exportToExcel({ title, subtitle, summaryRows = [], tableHeaders, tableData, extraSheets = [], filename }) {
  const wb = XLSX.utils.book_new()

  const mainData = []
  mainData.push([title])
  if (subtitle) mainData.push([subtitle])
  mainData.push([])
  if (summaryRows.length > 0) {
    mainData.push(['Summary'])
    summaryRows.forEach(({ label, value }) => mainData.push([label, value]))
    mainData.push([])
  }
  if (tableHeaders && tableData) {
    mainData.push(tableHeaders)
    tableData.forEach(row => mainData.push(row))
  }

  const ws = XLSX.utils.aoa_to_sheet(mainData)
  XLSX.utils.book_append_sheet(wb, ws, 'Report')

  extraSheets.forEach(({ headers, data, sheetName = 'Sheet' }) => {
    const sheetData = [headers, ...data]
    const sheet = XLSX.utils.aoa_to_sheet(sheetData)
    XLSX.utils.book_append_sheet(wb, sheet, sheetName)
  })

  XLSX.writeFile(wb, filename)
}

/**
 * Format number for export (strip Rs. prefix, return numeric for Excel)
 */
export function formatCurrencyForExport(value) {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const str = String(value).replace(/[Rs.\s,]/g, '')
  return parseFloat(str) || 0
}
