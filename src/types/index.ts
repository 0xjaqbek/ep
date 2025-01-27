// File: src/types/index.ts
import { UserCredential } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
// CompletedCourse interface for use in User interface
export interface CompletedCourse {
  courseId: string;
  completedAt: Timestamp;  // Changed from Date to Timestamp
  certificateNumber: string;
  certificatePdfUrl: string;
  score: number;
}

export interface User {
  uid?: string;
  email: string;
  displayName: string;
  role: 'student' | 'admin';
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  invoiceData?: {
    companyName: string;
    nip: string;
    companyAddress: string;
  };
  purchasedCourses: string[];
  completedCourses: CompletedCourse[];
  createdAt?: Date;
  referralCode: string;
  referredBy: string | null;
  referralPoints: number;
  referrals: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  points: number; // New field
  videoUrl?: string;
  thumbnail?: string;
  testQuestions?: TestQuestion[];
  isPublished?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  certificateNumber: string;
  createdAt: Timestamp;  // Changed from Date to Timestamp
  score: number;
  pdfUrl: string;
  status: 'active' | 'revoked' | 'replaced';
  revokedAt?: Timestamp;      // Changed from Date to Timestamp
  replacedAt?: Timestamp;     // Changed from Date to Timestamp
}

export interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  userId: string;
  userName: string;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export interface DiscountCode {
  id: string;
  code: string;
  discountPercent: number;
  validFrom: Date;
  validTo: Date | null;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
}

// Update Payment interface
export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentDate: Date;
  userEmail: string;
  courseName: string;
  transactionId: string;
  invoiceIssued?: boolean;
  invoiceIssuedAt?: Date;
  invoiceNumber?: string;
  invoiceUrl?: string;
  originalPrice?: number;
  finalPrice?: number;
  discountCode?: string;
  discountAmount?: number;
}

export interface InvoiceRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseIds: string[];
  courseTitles: string[];
  totalAmount: number;
  status: 'pending' | 'processed' | 'rejected';
  createdAt: Date;
  processedAt?: Date;
  rejectedAt?: Date;
  invoiceData: {
    companyName: string;
    nip: string;
    companyAddress: string;
  };
  invoiceNumber?: string;
  invoiceUrl?: string;
  comment?: string;
}

export interface InvoiceCounter {
  currentNumber: number;
}