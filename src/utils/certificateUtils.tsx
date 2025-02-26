// src/utils/certificateUtils.tsx
import logoImage from '../assets/logoEP.webp';

export interface CertificateData {
  userName: string | null;
  courseName: string;
  certificateNumber: string;
  completionDate: Date;
}

export const generateCertificateNumber = (courseId: string, userId: string) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  const dateStr = `${year}${month}${day}-${hours}${minutes}`;
  const userPrefix = userId.substring(0, 3);
  
  return `CERT-${courseId.substring(0, 4)}-${dateStr}-${userPrefix}`;
};

export const generateAndDownloadPDF = async (data: CertificateData) => {
  // Use dynamic import to load jsPDF only when needed
  const { jsPDF } = await import('jspdf');
  const pdfDoc = new jsPDF('landscape', 'mm', 'a4');

  pdfDoc.setFillColor(240, 240, 240);
  pdfDoc.rect(0, 0, 297, 210, 'F');
  pdfDoc.setDrawColor(0);
  pdfDoc.setLineWidth(5);
  pdfDoc.rect(10, 10, 277, 190);

  try {
    pdfDoc.addImage(logoImage, 'PNG', 20, 15, 50, 50);
  } catch (error) {
    console.warn('Error adding logo:', error);
  }

  // Title
  pdfDoc.setFont('helvetica', 'bold');
  pdfDoc.setFontSize(30);
  pdfDoc.text('Certyfikat Ukończenia', 148.5, 40, { align: 'center' });

  // Course name
  pdfDoc.setFontSize(20);
  pdfDoc.text(data.courseName, 148.5, 60, { align: 'center' });

  // Certificate details
  pdfDoc.setFontSize(16);
  pdfDoc.text('Certyfikat wystawiony dla:', 148.5, 80, { align: 'center' });
  pdfDoc.setFont('helvetica', 'bold');
  pdfDoc.text(data.userName || 'Użytkownik', 148.5, 90, { align: 'center' });

  pdfDoc.setFont('helvetica', 'normal');
  pdfDoc.setFontSize(14);
  pdfDoc.text(`Wynik testu: 100%`, 148.5, 110, { align: 'center' });

  pdfDoc.setFontSize(12);
  pdfDoc.text(`Numer certyfikatu: ${data.certificateNumber}`, 148.5, 130, { align: 'center' });
  pdfDoc.text(`Data wystawienia: ${data.completionDate.toLocaleDateString('pl-PL')}`, 148.5, 140, { align: 'center' });

  // Signatures
  pdfDoc.setDrawColor(100);
  pdfDoc.setLineWidth(0.5);
  pdfDoc.line(50, 170, 120, 170);
  pdfDoc.line(177, 170, 247, 170);

  pdfDoc.setFontSize(10);
  pdfDoc.text('Podpis Instruktora', 85, 180, { align: 'center' });
  pdfDoc.text('Dyrektor Platformy', 212, 180, { align: 'center' });

  pdfDoc.save(`Certyfikat_${data.courseName}_${data.completionDate.toISOString().split('T')[0]}.pdf`);
};