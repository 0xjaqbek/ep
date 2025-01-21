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
  videoUrl: string;
  duration: number;
  testQuestions: TestQuestion[];
  thumbnail: string;
  isPublished: boolean;
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
  userId: string;
  courseId: string;
  certificateNumber: string;
  createdAt: Timestamp;
  pdfUrl: string;
  status: 'active' | 'revoked';
}