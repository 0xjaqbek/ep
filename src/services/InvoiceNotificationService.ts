// src/services/InvoiceNotificationService.ts
import { 
    collection,
    addDoc,
    serverTimestamp,
    doc,
    getDoc
  } from 'firebase/firestore';
  import { db } from '../firebase/config.ts';
  
  export class InvoiceNotificationService {
    private readonly NOTIFICATIONS_COLLECTION = 'notifications';
  
    async sendInvoiceNotification(
      userId: string,
      invoiceId: string,
      type: 'created' | 'processed' | 'rejected'
    ): Promise<void> {
      try {
        // Get user data
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('User not found');
        }
  
        const userData = userDoc.data();
  
        // Get invoice data
        const invoiceRef = doc(db, 'invoiceRequests', invoiceId);
        const invoiceDoc = await getDoc(invoiceRef);
        
        if (!invoiceDoc.exists()) {
          throw new Error('Invoice not found');
        }
  
        const invoiceData = invoiceDoc.data();
  
        // Create notification content based on type
        const notificationContent = this.getNotificationContent(
          type,
          invoiceData.invoiceNumber,
          userData.displayName
        );
  
        // Add notification to collection
        await addDoc(collection(db, this.NOTIFICATIONS_COLLECTION), {
          userId,
          type: `invoice_${type}`,
          invoiceId,
          title: notificationContent.title,
          message: notificationContent.message,
          read: false,
          createdAt: serverTimestamp(),
          metadata: {
            invoiceNumber: invoiceData.invoiceNumber,
            amount: invoiceData.totalAmount,
            courseTitles: invoiceData.courseTitles
          }
        });
  
        // Send email notification (you would implement this based on your email service)
        await this.sendEmail(
          userData.email,
          notificationContent.title,
          notificationContent.message,
          {
            invoiceNumber: invoiceData.invoiceNumber,
            amount: invoiceData.totalAmount,
            downloadUrl: invoiceData.pdfUrl || null
          }
        );
  
      } catch (error) {
        console.error('Error sending invoice notification:', error);
        throw error;
      }
    }
  
    private getNotificationContent(
      type: 'created' | 'processed' | 'rejected',
      invoiceNumber: string,
      userName: string
    ) {
      switch (type) {
        case 'created':
          return {
            title: 'Nowa prośba o fakturę',
            message: `Twoja prośba o fakturę ${invoiceNumber} została przyjęta do realizacji.`
          };
        case 'processed':
          return {
            title: 'Faktura gotowa',
            message: `Twoja faktura ${invoiceNumber} została wystawiona i jest gotowa do pobrania.`
          };
        case 'rejected':
          return {
            title: 'Prośba o fakturę odrzucona',
            message: `Przepraszamy, ale Twoja prośba o fakturę ${invoiceNumber} została odrzucona. Skontaktuj się z nami, aby uzyskać więcej informacji.`
          };
      }
    }
  
    private async sendEmail(
      to: string,
      subject: string,
      message: string,
      metadata: {
        invoiceNumber: string;
        amount: number;
        downloadUrl: string | null;
      }
    ): Promise<void> {
      // This would be implemented based on your email service provider
      // For example, using Firebase Cloud Functions with Sendgrid or other email service
      
      // Example implementation placeholder:
      const emailData = {
        to,
        subject,
        text: message,
        html: this.generateEmailTemplate(message, metadata),
        from: 'faktury@progress999.pl',
        replyTo: 'kontakt@progress999.pl'
      };
  
      // Send email using your preferred service
      // await sendEmail(emailData);
    }
  
    private generateEmailTemplate(
      message: string,
      metadata: {
        invoiceNumber: string;
        amount: number;
        downloadUrl: string | null;
      }
    ): string {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 20px; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
              .button { 
                display: inline-block;
                padding: 10px 20px;
                background: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Progress999</h1>
              </div>
              <div class="content">
                <p>${message}</p>
                <p><strong>Numer faktury:</strong> ${metadata.invoiceNumber}</p>
                <p><strong>Kwota:</strong> ${metadata.amount.toFixed(2)} PLN</p>
                ${metadata.downloadUrl ? `
                  <p>
                    <a href="${metadata.downloadUrl}" class="button">
                      Pobierz fakturę
                    </a>
                  </p>
                ` : ''}
                <p>
                  W razie pytań, prosimy o kontakt na adres
                  <a href="mailto:kontakt@progress999.pl">kontakt@progress999.pl</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `;
    }
  }