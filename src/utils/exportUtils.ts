/**
 * Utility functions for exporting data
 */

export const exportToCSV = (data: any[], filename: string) => {
  // Convert data to CSV format
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  // Get headers from the first object's keys
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Headers row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        // Handle special cases like arrays
        let cellValue = row[header];
        
        // Convert arrays to comma-separated string
        if (Array.isArray(cellValue)) {
          cellValue = cellValue.join(' | ');
        }
        
        // Handle values that may contain commas by wrapping in quotes
        if (typeof cellValue === 'string' && (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n'))) {
          return `"${cellValue.replace(/"/g, '""')}"`;
        }
        
        return cellValue !== undefined && cellValue !== null ? String(cellValue) : '';
      }).join(',')
    )
  ].join('\n');
  
  // Create a blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Setup link properties
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.display = 'none';
  
  // Add to document, trigger download, and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Helper function to transform data for export if needed
export const prepareOrderDataForExport = (orders: any[]) => {
  return orders.map(order => {
    // Create a clean copy of the order without internal/unnecessary fields
    const exportOrder = { ...order };
    
    // Remove any fields that shouldn't be exported
    delete exportOrder.selected;
    
    // Format fields if needed
    if (exportOrder.timestamp) {
      try {
        // Ensure consistent date format
        const date = new Date(exportOrder.timestamp);
        exportOrder.timestamp = date.toLocaleString();
      } catch (e) {
        // Keep original if parsing fails
      }
    }
    
    return exportOrder;
  });
};

// Function to export all order data
export const exportAllOrderData = () => {
  try {
    // Get all different types of orders
    const regularOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    const mtoOrders = JSON.parse(localStorage.getItem('mtoOrders') || '[]');
    
    // Prepare for export
    const preparedRegularOrders = prepareOrderDataForExport(regularOrders);
    const preparedMTOOrders = prepareOrderDataForExport(mtoOrders);
    
    // Export each type with appropriate filename
    if (preparedRegularOrders.length > 0) {
      exportToCSV(preparedRegularOrders, 'regular-orders');
    }
    
    if (preparedMTOOrders.length > 0) {
      exportToCSV(preparedMTOOrders, 'mto-orders');
    }
    
    if (preparedRegularOrders.length === 0 && preparedMTOOrders.length === 0) {
      return { success: false, message: 'No orders found to export' };
    }
    
    return { 
      success: true, 
      message: 'Orders exported successfully',
      counts: {
        regular: preparedRegularOrders.length,
        mto: preparedMTOOrders.length
      }
    };
  } catch (error) {
    console.error('Error exporting orders:', error);
    return { success: false, message: 'Failed to export orders' };
  }
};
