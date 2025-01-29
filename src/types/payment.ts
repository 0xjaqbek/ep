// src/types/payment.ts
import { Timestamp } from 'firebase/firestore';

export interface CustomerData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  postal: string;
  city: string;
}

export interface CoursePaymentData {
  courseId: string;
  courseTitle: string;
  amount: number;
}

export interface P24PaymentData {
  userId: string;
  email: string;
  amount: number;
  originalPrice: number;
  finalPrice: number;
  customerData: CustomerData;
  courses: CoursePaymentData[];
  discountCode?: string;
  discountAmount?: number;
}

export interface PaymentResponse {
  orderId: string;
  payment_url: string;
}

export interface TransactionRecord {
  userId: string;
  courses: CoursePaymentData[];
  sessionId: string;
  amount: number;
  originalAmount: number;
  status: 'pending' | 'completed' | 'failed';
  email: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  discountCode?: string;
  discountAmount?: number;
}

export interface PaymentRecord {
  userId: string;
  courseId: string;
  courseTitle: string;
  transactionId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Timestamp;
  completedAt?: Timestamp;
  discountCode?: string;
  discountAmount?: number;
}