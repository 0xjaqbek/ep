// src/services/InvoiceSequenceService.ts
import { 
    doc, 
    runTransaction,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs
  } from 'firebase/firestore';
  import { db } from '../firebase/config.ts';
  
  export class InvoiceSequenceService {
    private readonly SEQUENCE_DOC = 'invoice_sequence';
    private readonly COLLECTION = 'invoices';
  
    async getNextInvoiceNumber(): Promise<string> {
      try {
        const sequenceRef = doc(db, 'sequences', this.SEQUENCE_DOC);
        
        const newNumber = await runTransaction(db, async (transaction) => {
          const sequenceDoc = await transaction.get(sequenceRef);
          
          if (!sequenceDoc.exists()) {
            // Initialize sequence if it doesn't exist
            transaction.set(sequenceRef, {
              currentNumber: 1,
              year: new Date().getFullYear(),
              lastUpdated: serverTimestamp()
            });
            return 1;
          }
  
          const data = sequenceDoc.data();
          const currentYear = new Date().getFullYear();
  
          // Reset sequence for new year
          if (data.year !== currentYear) {
            transaction.set(sequenceRef, {
              currentNumber: 1,
              year: currentYear,
              lastUpdated: serverTimestamp()
            });
            return 1;
          }
  
          // Increment sequence
          const nextNumber = data.currentNumber + 1;
          transaction.update(sequenceRef, {
            currentNumber: nextNumber,
            lastUpdated: serverTimestamp()
          });
  
          return nextNumber;
        });
  
        // Format invoice number
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        return `FV/${year}/${month}/${newNumber.toString().padStart(5, '0')}`;
      } catch (error) {
        console.error('Error generating invoice number:', error);
        throw error;
      }
    }
  
    async validateInvoiceNumber(invoiceNumber: string): Promise<boolean> {
      try {
        // Check if invoice number already exists
        const invoicesRef = collection(db, this.COLLECTION);
        const q = query(invoicesRef, where('invoiceNumber', '==', invoiceNumber));
        const snapshot = await getDocs(q);
        
        return snapshot.empty;
      } catch (error) {
        console.error('Error validating invoice number:', error);
        throw error;
      }
    }
  
    async reserveInvoiceNumber(): Promise<string> {
      const invoiceNumber = await this.getNextInvoiceNumber();
      
      // Validate uniqueness
      const isValid = await this.validateInvoiceNumber(invoiceNumber);
      if (!isValid) {
        throw new Error('Invoice number collision detected');
      }
  
      return invoiceNumber;
    }
  }