declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface UserOptions {
    head?: any[][];
    body?: any[][];
    startY?: number;
    styles?: any;
    headStyles?: any;
    bodyStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: any;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    tableWidth?: number | 'auto' | 'wrap';
    showHead?: boolean | 'everyPage' | 'firstPage' | 'never';
    showFoot?: boolean | 'everyPage' | 'lastPage' | 'never';
    theme?: 'striped' | 'grid' | 'plain';
    horizontalPageBreak?: boolean;
    horizontalPageBreakRepeat?: number | number[];
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    tableLineColor?: number | number[];
    tableLineWidth?: number;
  }

  interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
    previousAutoTable?: {
      finalY: number;
    };
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): jsPDF;
}


