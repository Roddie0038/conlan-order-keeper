
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { OrderSummary } from '@/components/order-form/types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportToExcel = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPDF = (data: any[], fileName: string, headers: string[]) => {
  const doc = new jsPDF();
  
  const tableData = data.map(item => 
    headers.map(header => {
      const value = item[header.toLowerCase().replace(/ /g, '')];
      return value?.toString() || '';
    })
  );

  doc.autoTable({
    head: [headers],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`${fileName}.pdf`);
};

// Function to format orders for export
export const formatOrdersForExport = (orders: OrderSummary[]) => {
  return orders.map(order => ({
    'Order ID': order.id,
    'Date': order.dateReceived,
    'Store': order.store,
    'Product Number': order.productNumber,
    'Description': order.description,
    'Quantity': order.quantity,
    'Schedule': order.scheduleArrival,
    'Priority': order.priority || 'Normal',
    'Notes': order.notes,
    'Cross Dock': order.crossDock,
    'Cross Dock Destination': order.crossDockDestination || 'N/A',
    "Manager's Email": order.managersEmail || 'N/A'
  }));
};

// Function to format MTO orders for export
export const formatMTOOrdersForExport = (orders: any[]) => {
  return orders.map(order => ({
    'Date': order.timestamp || new Date().toLocaleString(),
    'Store': order.store || 'N/A',
    'Name': order.name || 'N/A',
    'Product Number': order.productNumber || 'N/A',
    'Tire Size': order.tireSize || 'N/A',
    'Custom Tire Size': order.customTireSize || 'N/A',
    'Casing Grade': Array.isArray(order.casingGrade) ? order.casingGrade.join(', ') : (order.casingGrade || 'N/A'),
    'Tire Tread': order.tireTreadNeeded || 'N/A',
    'Quantity': order.quantity || 'N/A',
    'Schedule': order.scheduleArrival || 'N/A',
    'Priority': order.priority || 'Normal',
    'Notes': order.notes || 'N/A',
    "Manager's Email": order.managerEmail || order.managersEmail || 'N/A'
  }));
};

