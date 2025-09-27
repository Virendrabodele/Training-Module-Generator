
// This file assumes that the SheetJS library (xlsx) is loaded from a CDN.
// The `XLSX` variable is declared globally in App.tsx. We reference it here.
declare const XLSX: any;

/**
 * Converts an array of objects to an Excel file and downloads it.
 * @param jsonData The array of objects to convert.
 * @param fileName The name of the file to be downloaded (e.g., 'data.xlsx').
 */
export function convertJsonToExcel(jsonData: any[], fileName: string): void {
  try {
    // Create a new worksheet from the JSON data
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Write the workbook and trigger the download
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error("Error creating Excel file:", error);
    alert("Could not generate the Excel file. Please check the console for errors.");
  }
}
