// src/services/payment/p24Service.ts
import { 
  doc, 
  collection, 
  writeBatch, 
  serverTimestamp, 
  getDoc, 
  query, 
  where, 
  getDocs,
  Timestamp, 
  arrayUnion
} from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { 
  P24PaymentData, 
  PaymentResponse, 
  TransactionRecord,
  PaymentRecord,
  CoursePaymentData 
} from '../../types/payment.ts';

export class P24Service {
  private readonly API_URL = process.env.REACT_APP_P24_API_URL;
  private readonly MERCHANT_ID = process.env.REACT_APP_P24_MERCHANT_ID;
  private readonly CRC_KEY = process.env.REACT_APP_P24_CRC_KEY;

  async createOrder(data: P24PaymentData): Promise<PaymentResponse> {
    try {
      const courseTitles = data.courses.map(course => course.courseTitle).join(', ');
      
      const orderData = {
        merchantId: this.MERCHANT_ID,
        sessionId: `${Date.now()}`,
        amount: Math.round(data.finalPrice * 100),
        currency: 'PLN',
        description: `Zakup kursów: ${courseTitles}`,
        email: data.email,
        client: `${data.customerData.firstName} ${data.customerData.lastName}`,
        address: data.customerData.address,
        zip: data.customerData.postal,
        city: data.customerData.city,
        phone: data.customerData.phone,
        country: 'PL',
        language: 'pl',
        urlReturn: `${window.location.origin}/payment/callback`,
        urlStatus: `${process.env.REACT_APP_API_URL}/payment/status`,
        sign: this.generateSignature(data.finalPrice),
        encoding: 'UTF-8',
        method: 0,
        metadata: {
          courses: data.courses,
          userId: data.userId,
          originalPrice: data.originalPrice,
          discountCode: data.discountCode,
          discountAmount: data.discountAmount
        }
      };

      const response = await fetch(`${this.API_URL}/transaction/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const result = await response.json();

      await this.saveTransactionDetails(orderData, data);

      return {
        orderId: result.data.orderId,
        payment_url: result.data.paymentUrl
      };
    } catch (error) {
      console.error('Error creating P24 order:', error);
      throw error;
    }
  }

  private async saveTransactionDetails(orderData: any, paymentData: P24PaymentData) {
    const batch = writeBatch(db);
    
    // Create transaction record
    const transactionRef = doc(collection(db, 'transactions'));
    const transactionRecord: TransactionRecord = {
      userId: paymentData.userId,
      courses: paymentData.courses,
      sessionId: orderData.sessionId,
      amount: paymentData.finalPrice,
      originalAmount: paymentData.originalPrice,
      status: 'pending',
      email: paymentData.email,
      createdAt: Timestamp.now(),
      discountCode: paymentData.discountCode,
      discountAmount: paymentData.discountAmount
    };
    
    batch.set(transactionRef, transactionRecord);

    // Create individual payment records for each course
    paymentData.courses.forEach((course, index) => {
      const paymentRef = doc(collection(db, 'payments'));
      const paymentRecord: PaymentRecord = {
        userId: paymentData.userId,
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        transactionId: transactionRef.id,
        amount: course.amount,
        status: 'pending',
        createdAt: Timestamp.now(),
        discountCode: paymentData.discountCode,
        discountAmount: this.calculateCourseDiscount(
          paymentData.courses.length,
          index,
          paymentData.discountAmount || 0
        )
      };
      
      batch.set(paymentRef, paymentRecord);
    });

    await batch.commit();
  }

  private calculateCourseDiscount(totalCourses: number, index: number, totalDiscount: number): number {
    const baseDiscount = totalDiscount / totalCourses;
    const roundedDiscount = Math.round(baseDiscount * 100) / 100;
    
    if (index === totalCourses - 1) {
      const difference = totalDiscount - (roundedDiscount * (totalCourses - 1));
      return Math.round(difference * 100) / 100;
    }
    
    return roundedDiscount;
  }

  private generateSignature(amount: number): string {
    const data = `${this.MERCHANT_ID}|${Math.round(amount * 100)}|PLN|${this.CRC_KEY}`;
    // Implement proper hashing as per P24 docs
    return 'generated_signature';
  }

  async verifyPayment(orderId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/transaction/verify/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_P24_API_KEY}`
        }
      });

      const result = await response.json();

      if (result.status === 'SUCCESS') {
        await this.handleSuccessfulPayment(orderId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  private async handleSuccessfulPayment(orderId: string) {
    const transactionRef = doc(db, 'transactions', orderId);
    const transactionDoc = await getDoc(transactionRef);

    if (!transactionDoc.exists()) {
      throw new Error('Transaction not found');
    }

    const transaction = transactionDoc.data() as TransactionRecord;
    const batch = writeBatch(db);

    // Update transaction status
    batch.update(transactionRef, {
      status: 'completed',
      completedAt: serverTimestamp()
    });

    // Update payment records
    const paymentsQuery = query(
      collection(db, 'payments'), 
      where('transactionId', '==', orderId)
    );
    const payments = await getDocs(paymentsQuery);

    payments.forEach(payment => {
      batch.update(payment.ref, {
        status: 'completed',
        completedAt: serverTimestamp()
      });
    });

    // Add courses to user's purchased courses
    const userRef = doc(db, 'users', transaction.userId);
    const courseIds = transaction.courses.map(course => course.courseId);
    batch.update(userRef, {
      purchasedCourses: arrayUnion(...courseIds)
    });

    await batch.commit();
  }
}