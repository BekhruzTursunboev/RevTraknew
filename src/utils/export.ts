import { Transaction, Task, Client } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportService = {
  exportToCSV(data: { transactions?: Transaction[]; tasks?: Task[]; clients?: Client[] }, filename: string): void {
    let csvContent = '';
    
    if (data.transactions) {
      csvContent += 'Transactions\n';
      csvContent += 'ID,Date,Amount,Category,Status,Notes\n';
      data.transactions.forEach(t => {
        csvContent += `${t.id},${t.date},${t.amount},${t.category},${t.status},"${t.notes.replace(/"/g, '""')}"\n`;
      });
      csvContent += '\n';
    }
    
    if (data.tasks) {
      csvContent += 'Tasks\n';
      csvContent += 'ID,Title,Description,Due Date,Priority,Status,Client ID,Milestone\n';
      data.tasks.forEach(t => {
        csvContent += `${t.id},"${t.title.replace(/"/g, '""')}","${t.description.replace(/"/g, '""')}",${t.dueDate},${t.priority},${t.status},${t.clientId || ''},"${(t.milestone || '').replace(/"/g, '""')}"\n`;
      });
      csvContent += '\n';
    }
    
    if (data.clients) {
      csvContent += 'Clients\n';
      csvContent += 'ID,Name,Phone Number,Amount,Payment Status,Due Date,Description\n';
      data.clients.forEach(c => {
        csvContent += `${c.id},"${c.name.replace(/"/g, '""')}",${c.phoneNumber},${c.amount},${c.paymentStatus},${c.dueDate},"${c.description.replace(/"/g, '""')}"\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToPDF(data: { transactions?: Transaction[]; tasks?: Task[]; clients?: Client[] }, filename: string): void {
    const doc = new jsPDF();
    let yPos = 20;
    
    doc.setFontSize(20);
    doc.text('RevTrak Report', 14, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPos);
    yPos += 15;
    
    if (data.transactions && data.transactions.length > 0) {
      doc.setFontSize(16);
      doc.text('Transactions', 14, yPos);
      yPos += 10;
      
      const transTable = data.transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        `$${t.amount.toFixed(2)}`,
        t.category,
        t.status,
        t.notes.substring(0, 30),
      ]);
      
      (doc as any).autoTable({
        head: [['Date', 'Amount', 'Category', 'Status', 'Notes']],
        body: transTable,
        startY: yPos,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 121, 230] },
      });
      
      yPos = (doc as any).lastAutoTable?.finalY || yPos + 15;
    }
    
    if (data.tasks && data.tasks.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(16);
      doc.text('Tasks', 14, yPos);
      yPos += 10;
      
      const taskTable = data.tasks.map(t => [
        t.title.substring(0, 25),
        new Date(t.dueDate).toLocaleDateString(),
        t.priority,
        t.status,
        t.milestone || '-',
      ]);
      
      (doc as any).autoTable({
        head: [['Title', 'Due Date', 'Priority', 'Status', 'Milestone']],
        body: taskTable,
        startY: yPos,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 121, 230] },
      });
      
      yPos = (doc as any).lastAutoTable?.finalY || yPos + 15;
    }
    
    if (data.clients && data.clients.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(16);
      doc.text('Clients', 14, yPos);
      yPos += 10;
      
      const clientTable = data.clients.map(c => [
        c.name.substring(0, 20),
        c.phoneNumber,
        `$${c.amount.toFixed(2)}`,
        c.paymentStatus,
        new Date(c.dueDate).toLocaleDateString(),
      ]);
      
      (doc as any).autoTable({
        head: [['Name', 'Phone', 'Amount', 'Status', 'Due Date']],
        body: clientTable,
        startY: yPos,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 121, 230] },
      });
    }
    
    doc.save(`${filename}.pdf`);
  },
};

