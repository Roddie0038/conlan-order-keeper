
/**
 * Excel file parser utility for importing inventory data
 * Note: In a production app, this would need to be done server-side 
 * or via a Supabase Edge Function to handle large files safely.
 */

import { InventoryItem } from "@/contexts/InventoryContext";

interface ParsedInventoryItem {
  product_number: string;
  description: string;
  quantity: number;
  min_threshold: number;
}

export async function parseExcelFile(file: File): Promise<ParsedInventoryItem[]> {
  // In a real implementation, you would:
  // 1. Either use a library like xlsx.js to parse Excel files in the browser
  // 2. Or upload the file to a server/edge function and parse it there
  
  // This is a mock implementation that returns dummy data
  // In production, replace this with actual Excel parsing logic
  
  return new Promise((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      // Generate random data based on filename
      const items: ParsedInventoryItem[] = [];
      
      // Generate 5-10 random items
      const numItems = 5 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < numItems; i++) {
        items.push({
          product_number: `P${1000 + Math.floor(Math.random() * 9000)}`,
          description: `Product from ${file.name} - Item ${i + 1}`,
          quantity: 10 + Math.floor(Math.random() * 50),
          min_threshold: 5 + Math.floor(Math.random() * 10)
        });
      }
      
      resolve(items);
    }, 1500);
  });
}

/**
 * Parse CSV string to inventory items
 * @param csvString CSV content as string
 */
export function parseCSV(csvString: string): ParsedInventoryItem[] {
  // Split by lines and remove empty lines
  const lines = csvString.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    throw new Error('CSV file must have a header row and at least one data row');
  }
  
  // Extract headers and find the column indices
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const productColIndex = headers.findIndex(h => 
    h.includes('product') || h.includes('sku') || h.includes('part')
  );
  
  const descriptionColIndex = headers.findIndex(h => 
    h.includes('description') || h.includes('name') || h.includes('title')
  );
  
  const quantityColIndex = headers.findIndex(h => 
    h.includes('quantity') || h.includes('qty') || h.includes('count') || h.includes('stock')
  );
  
  const thresholdColIndex = headers.findIndex(h => 
    h.includes('threshold') || h.includes('min') || h.includes('reorder')
  );
  
  if (productColIndex === -1 || descriptionColIndex === -1 || quantityColIndex === -1) {
    throw new Error('CSV must contain product, description, and quantity columns');
  }
  
  // Parse data rows
  const items: ParsedInventoryItem[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    if (values.length <= Math.max(productColIndex, descriptionColIndex, quantityColIndex)) {
      continue; // Skip incomplete rows
    }
    
    const productNumber = values[productColIndex];
    const description = values[descriptionColIndex];
    const quantity = parseInt(values[quantityColIndex]) || 0;
    
    // Use threshold if available, otherwise default to 5
    const minThreshold = thresholdColIndex !== -1 
      ? (parseInt(values[thresholdColIndex]) || 5)
      : 5;
    
    if (productNumber && description) {
      items.push({
        product_number: productNumber,
        description,
        quantity,
        min_threshold: minThreshold
      });
    }
  }
  
  return items;
}
