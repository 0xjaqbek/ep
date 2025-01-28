import { jsPDF } from 'jspdf';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config.ts';
import { formatCurrency } from '../utils/invoiceUtils.ts';

interface InvoiceData {
  invoiceNumber: string;
  userId: string;
  companyDetails: {
    companyName: string;
    nip: string;
    companyAddress: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
}

export class InvoicePDFService {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  async generateAndSave(data: InvoiceData): Promise<string> {
    try {
      // Generate the PDF content
      this.addHeader(data.invoiceNumber);
      this.addCompanyDetails(data.companyDetails);
      this.addItems(data.items);
      this.addSummary(data.items);
      this.addFooter();
      this.addWatermark();

      // Upload to Firebase Storage
      const pdfBlob = this.doc.output('blob');
      const storageRef = ref(storage, `invoices/${data.userId}/${data.invoiceNumber}.pdf`);
      await uploadBytes(storageRef, pdfBlob);

      // Get and return the download URL
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error generating and saving PDF:', error);
      throw new Error('Failed to generate and save invoice PDF');
    }
  }

  private addHeader(invoiceNumber: string): void {
    this.doc.setFontSize(20);
    this.doc.text('FAKTURA VAT', 105, 20, { align: 'center' });
    
    this.doc.setFontSize(12);
    this.doc.text(`Numer: ${invoiceNumber}`, 20, 35);
    this.doc.text(`Data wystawienia: ${new Date().toLocaleDateString('pl-PL')}`, 20, 42);
  }

  private addCompanyDetails(details: InvoiceData['companyDetails']): void {
    // Seller details
    this.doc.text('Sprzedawca:', 20, 60);
    this.doc.text('Progress999', 20, 67);
    this.doc.text('ul. Przykładowa 1/2', 20, 74);
    this.doc.text('00-001 Warszawa', 20, 81);
    this.doc.text('NIP: 0000000000', 20, 88);

    // Buyer details
    this.doc.text('Nabywca:', 105, 60);
    this.doc.text(details.companyName, 105, 67);
    this.doc.text(details.companyAddress, 105, 74);
    this.doc.text(`NIP: ${details.nip}`, 105, 81);
  }

  private addItems(items: InvoiceData['items']): void {
    const startY = 100;
    
    // Headers
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(20, startY, 170, 8, 'F');
    this.doc.text('Nazwa', 25, startY + 6);
    this.doc.text('Ilość', 130, startY + 6);
    this.doc.text('Cena', 150, startY + 6);
    this.doc.text('Wartość', 175, startY + 6);

    // Items
    let y = startY + 15;
    items.forEach(item => {
      this.doc.text(item.description, 25, y);
      this.doc.text(item.quantity.toString(), 130, y);
      this.doc.text(formatCurrency(item.price), 150, y);
      this.doc.text(formatCurrency(item.quantity * item.price), 175, y);
      y += 8;
    });
  }

  private addSummary(items: InvoiceData['items']): void {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = total * 0.23; // 23% VAT
    
    const y = 200;
    this.doc.text('Podsumowanie:', 130, y);
    this.doc.text(`Wartość netto: ${formatCurrency(total)}`, 130, y + 7);
    this.doc.text(`VAT (23%): ${formatCurrency(vat)}`, 130, y + 14);
    this.doc.text(`Wartość brutto: ${formatCurrency(total + vat)}`, 130, y + 21);
  }

  private addFooter(): void {
    const y = 240;
    this.doc.setFontSize(10);
    this.doc.text('Forma płatności: przelew', 20, y);
    this.doc.text('Nr konta: 00 0000 0000 0000 0000 0000 0000', 20, y + 7);
    this.doc.text('Bank: Example Bank', 20, y + 14);
    
    this.doc.setFontSize(8);
    this.doc.text('Dokument wygenerowany elektronicznie', 105, 280, { align: 'center' });
  }

  private addWatermark(): void {
    this.doc.setFontSize(40);
    this.doc.setTextColor(230, 230, 230);
    this.doc.text('Progress999', 105, 140, {
      align: 'center',
      angle: 45
    });
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(12);
  }
}