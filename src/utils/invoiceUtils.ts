// src/utils/invoiceUtils.ts

// Generate a unique invoice number based on sequence and timestamp
export const generateInvoiceNumber = (sequenceNumber: number): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = String(sequenceNumber).padStart(5, '0');
    
    return `INV/${year}${month}/${sequence}`;
  };
  
  // Validate VAT number (NIP) using proper algorithm
  export const validateNIP = (nip: string): boolean => {
    if (!/^\d{10}$/.test(nip)) return false;
    
    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    const digits = nip.split('').map(Number);
    const checksum = digits.slice(0, 9).reduce((sum, digit, index) => 
      sum + digit * weights[index], 0) % 11;
      
    return checksum === digits[9];
  };
  
  // Calculate totals including tax
  export const calculateInvoiceTotals = (
    items: Array<{ price: number; quantity: number }>,
    taxRate: number = 0.23 // 23% VAT
  ) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2))
    };
  };
  
  // Generate invoice due date (30 days from issue)
  export const generateDueDate = (issueDate: Date): Date => {
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate;
  };
  
  // Format currency amounts
  export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };
  
  // Validate company details
  export const validateCompanyDetails = (details: {
    companyName: string;
    nip: string;
    companyAddress: string;
  }): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!details.companyName?.trim()) {
      errors.push('Company name is required');
    }
    
    if (!validateNIP(details.nip)) {
      errors.push('Invalid NIP number');
    }
    
    if (!details.companyAddress?.trim()) {
      errors.push('Company address is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };