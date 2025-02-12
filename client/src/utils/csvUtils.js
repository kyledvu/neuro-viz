import * as Papa from 'papaparse';

// Parse a CSV file and return structured data
export function parseCsvFile(file, setFeatures, setGridRows, setGridColumns, setError) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      const rows = result.data.map((row, index) => ({ id: index + 1, ...row }));
      const columns = Object.keys(result.data[0] || {}).map((field) => ({
        field,
        headerName: field,
        width: 150,
      }));
      const features = Object.keys(result.data[0] || {}).filter((field) => field.trim() !== "");

      setFeatures(features);
      setGridRows(rows);
      setGridColumns(columns);
    },
    error: (error) => {
      console.error("Error parsing CSV:", error);
      setError("Error parsing CSV file");
    },
  });
}
