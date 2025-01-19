// File: src/types/index.ts
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
    completedCourses: string[];
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
    id: string;
    userId: string;
    courseId: string;
    completionDate: Date;
    score: number;
    pdfUrl: string;
  }