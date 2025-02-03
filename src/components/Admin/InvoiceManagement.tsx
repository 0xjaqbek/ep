import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  where, 
  writeBatch,
  serverTimestamp, 
  setDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { InvoiceRequest } from '../../types';
import { InvoicePDFService } from '../../services/InvoicePDFService.ts';
import { InvoiceSequenceService } from '../../services/InvoiceSequenceService.ts';
import { InvoiceNotificationService } from '../../services/InvoiceNotificationService.ts';
import { Alert } from '../../components/Alert.tsx';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    processed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const statusText = {
    pending: 'Oczekujące',
    processed: 'Zrealizowane',
    rejected: 'Odrzucone'
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[status]}`}>
      {statusText[status]}
    </span>
  );
};

// Invoice Details Dialog
const InvoiceDetailsDialog = ({ 
  isOpen, 
  onClose, 
  invoice, 
  onStatusChange 
}: { 
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceRequest;
  onStatusChange: (id: string, status: 'processed' | 'rejected', comment?: string) => Promise<void>;
}) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Szczegóły faktury</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Dane nabywcy</h4>
            <p>{invoice.userName}</p>
            <p>{invoice.userEmail}</p>
            {invoice.invoiceData && (
              <>
                <p className="mt-2 font-medium">Dane do faktury:</p>
                <p>{invoice.invoiceData.companyName}</p>
                <p>NIP: {invoice.invoiceData.nip}</p>
                <p>{invoice.invoiceData.companyAddress}</p>
              </>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-2">Kursy</h4>
            <ul className="list-disc pl-5">
              {invoice.courseTitles.map((title, index) => (
                <li key={index}>{title}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Kwota</h4>
            <p className="text-xl font-bold">{invoice.totalAmount.toFixed(2)} PLN</p>
          </div>

          {invoice.status === 'pending' && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block mb-2">Komentarz (opcjonalnie)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={async () => {
                    setLoading(true);
                    await onStatusChange(invoice.id, 'rejected', comment);
                    setLoading(false);
                    onClose();
                  }}
                  disabled={loading}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
                >
                  Odrzuć
                </button>
                <button
                  onClick={async () => {
                    setLoading(true);
                    await onStatusChange(invoice.id, 'processed', comment);
                    setLoading(false);
                    onClose();
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {loading ? 'Przetwarzanie...' : 'Zatwierdź i wystaw fakturę'}
                </button>
              </div>
            </div>
          )}

          {invoice.status !== 'pending' && invoice.comment && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Komentarz</h4>
              <p className="text-gray-600">{invoice.comment}</p>
            </div>
          )}

          {invoice.status === 'processed' && invoice.pdfUrl && (
            <div className="border-t pt-4">
              <a 
                href={invoice.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Pobierz fakturę
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const InvoiceManagement: React.FC = () => {
  const [invoiceRequests, setInvoiceRequests] = useState<InvoiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const pdfService = new InvoicePDFService();
  const sequenceService = new InvoiceSequenceService();
  const notificationService = new InvoiceNotificationService();

  useEffect(() => {
    fetchInvoiceRequests();
  }, []);

  const fetchInvoiceRequests = async () => {
    try {
      const requestsRef = collection(db, 'invoiceRequests');
      const q = query(requestsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as InvoiceRequest[];

      setInvoiceRequests(requests);
    } catch (error) {
      console.error('Error fetching invoice requests:', error);
      setError('Wystąpił błąd podczas ładowania faktur');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    requestId: string, 
    newStatus: 'processed' | 'rejected',
    comment?: string
  ) => {
    try {
      setError(null);
      const request = invoiceRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Invoice request not found');
      }
  
      // Comprehensive validation
      if (newStatus === 'processed') {
        // Validate required data
        if (!request.courseTitles?.length || !request.totalAmount) {
          throw new Error('Invalid invoice data: missing courses or total amount');
        }
  
        // Validate arrays match
        if (request.courseTitles.length !== request.courseIds.length) {
          throw new Error('Invalid invoice data: mismatched course data');
        }
  
        // Validate company data for invoice
        if (!request.invoiceData?.companyName || 
            !request.invoiceData?.nip || 
            !request.invoiceData?.companyAddress) {
          throw new Error('Missing company data for invoice');
        }
  
        // Log request data for debugging
        console.log('Processing invoice request:', {
          courseTitles: request.courseTitles,
          courseIds: request.courseIds,
          courseAmounts: request.courseAmounts,
          totalAmount: request.totalAmount,
          invoiceData: request.invoiceData
        });
      }
  
      const requestRef = doc(db, 'invoiceRequests', requestId);
      const batch = writeBatch(db);
  
      if (newStatus === 'processed') {
        try {
          // Generate invoice number
          const generatedInvoiceNumber = await sequenceService.reserveInvoiceNumber();
          
          // Calculate individual prices safely
          const invoiceItems = request.courseTitles.map((title, index) => {
            // If courseAmounts exists, use it; otherwise calculate from total
            const price = request.courseAmounts?.[index] ?? 
              (request.totalAmount / request.courseTitles.length);
  
            return {
              description: title,
              quantity: 1,
              price: Number(price.toFixed(2)) // Ensure we have a clean number
            };
          });
  
          // Validate total matches sum of individual prices
          const calculatedTotal = invoiceItems.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
          );
  
          if (Math.abs(calculatedTotal - request.totalAmount) > 0.01) { // Allow for small rounding differences
            console.warn('Total amount mismatch:', {
              calculated: calculatedTotal,
              stored: request.totalAmount
            });
          }
  
          // Generate PDF
          const pdfUrl = await pdfService.generateAndSave({
            invoiceNumber: generatedInvoiceNumber,
            userId: request.userId,
            companyDetails: request.invoiceData,
            items: invoiceItems
          });
  
          // Update invoice request
          batch.update(requestRef, {
            status: newStatus,
            processedAt: serverTimestamp(),
            invoiceNumber: generatedInvoiceNumber,
            pdfUrl,
            comment: comment || null
          });
  
          // Update payment records
          const paymentsRef = collection(db, 'payments');
          const q = query(paymentsRef, 
            where('userId', '==', request.userId),
            where('courseId', 'in', request.courseIds)
          );
          const snapshot = await getDocs(q);
          
          if (snapshot.empty) {
            console.warn('No payment records found for courses:', request.courseIds);
          }
  
          snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { 
              invoiceIssued: true,
              invoiceIssuedAt: serverTimestamp(),
              invoiceNumber: generatedInvoiceNumber
            });
          });
  
          await batch.commit();
  
          // Send notification
          await notificationService.sendInvoiceNotification(
            request.userId,
            requestId,
            'processed'
          );
  
          setSuccess('Faktura została wystawiona pomyślnie');
        } catch (error) {
          console.error('Error processing invoice:', error);
          throw new Error(`Failed to process invoice: ${error.message}`);
        }
      } else {
        // Handle rejection
        await updateDoc(requestRef, {
          status: newStatus,
          rejectedAt: serverTimestamp(),
          comment: comment || null
        });
  
        // Send notification
        await notificationService.sendInvoiceNotification(
          request.userId,
          requestId,
          'rejected'
        );
  
        setSuccess('Prośba o fakturę została odrzucona');
      }
  
      await fetchInvoiceRequests();
    } catch (error) {
      console.error('Error updating invoice request:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Wystąpił błąd podczas przetwarzania faktury'
      );
    }
  };

  const initializeSequences = async () => {
    try {
      await setDoc(doc(db, 'sequences', 'invoice_sequence'), {
        currentNumber: 0,
        year: new Date().getFullYear(),
        lastUpdated: serverTimestamp()
      });
      alert('Sequence initialized successfully!');
      console.log('Sequence initialized successfully');
    } catch (error) {
      console.error('Error initializing sequence:', error);
      alert('Error initializing sequence: ' + error);
    }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Prośby o faktury</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Łącznie: {invoiceRequests.length}
          </span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="mb-4 bg-green-50 text-green-800">
          {success}
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Użytkownik</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kursy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kwota</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoiceRequests.map(request => (
              <tr 
                key={request.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedInvoice(request)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.createdAt.toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                  <div className="text-sm text-gray-500">{request.userEmail}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {request.courseTitles.join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {request.totalAmount.toFixed(2)} PLN
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedInvoice(request);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Szczegóły
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Prośby o faktury</h2>
      
      {/* Add this temporary button */}
      <button
        onClick={initializeSequences}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Initialize Invoice Sequence
      </button>
    </div>

      {selectedInvoice && (
        <InvoiceDetailsDialog
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default InvoiceManagement;