const { Parser } = require('json2csv');

/**
 * Generate CSV from data array
 * @param {Array} data - Array of objects to convert to CSV
 * @param {Array} fields - Field configuration array
 * @returns {string} CSV content
 */
function generateCsv(data, fields) {
  try {
    const opts = {
      fields: fields.map(field => ({
        label: field.title,
        value: field.id
      }))
    };

    const parser = new Parser(opts);
    return parser.parse(data);
  } catch (error) {
    console.error('CSV generation error:', error);
    throw new Error('Failed to generate CSV');
  }
}

/**
 * Generate CSV with custom formatting
 * @param {Array} data - Array of objects
 * @param {Object} options - Formatting options
 * @returns {string} Formatted CSV content
 */
function generateFormattedCsv(data, options = {}) {
  const {
    delimiter = ',',
    quote = '"',
    escape = '"',
    header = true,
    fields = []
  } = options;

  try {
    const opts = {
      delimiter,
      quote,
      escape,
      header,
      fields: fields.length > 0 ? fields.map(field => ({
        label: field.title,
        value: field.id
      })) : undefined
    };

    const parser = new Parser(opts);
    return parser.parse(data);
  } catch (error) {
    console.error('Formatted CSV generation error:', error);
    throw new Error('Failed to generate formatted CSV');
  }
}

module.exports = {
  generateCsv,
  generateFormattedCsv
};