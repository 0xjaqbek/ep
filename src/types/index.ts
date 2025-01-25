// File: src/types/index.ts
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