# Overview

This script allows you to run analysis in batch using an Excel file containing multiple URLs.

Each URL will be processed by:

Custom analyzer (cognitive metrics)
or / and
Lighthouse baseline (technical accessibility)

Results are saved as individual JSON files.
# Usage
`node batch-from-excel.js <scriptPath> <excel-file-path> [sheet-name] [output-dir]`
### Basic
`node batch-from-excel.js index.js <excel-file>`

### Advance (example)
`node .\plugin\batch-from-excel.js indexPlus.js .\plugin\example.xlsx "Website Metadata" .\plugin\batch-output`