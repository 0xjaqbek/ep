// src/components/Courses/CourseTest.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  addDoc, 
  collection,
  getFirestore 
} from 'firebase/firestore';
import { 
  getStorage,
  ref, 
  uploadString, 
  getDownloadURL 
} from 'firebase/storage';
import { getApp } from 'firebase/app';
import { useAuth } from '../Auth/AuthProvider.tsx';
import jsPDF from 'jspdf';

// Initialize Firebase services
const db = getFirestore(getApp());
const storage = getStorage(getApp());

interface CourseTestProps {
  courseId: string;
  courseName: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  onClose: () => void;
}

export const CourseTest: React.FC<CourseTestProps> = ({ courseId, courseName, questions, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const generateCertificateNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CERT-${courseId.substring(0, 4)}-${timestamp}-${random}`;
  };

  const generateCertificatePDF = async (certificateNumber: string, score: number): Promise<string> => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add certificate styling
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 297, 210, 'F');
    doc.setDrawColor(0);
    doc.setLineWidth(5);
    doc.rect(10, 10, 277, 190);

    // Add title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.text('Certyfikat Ukończenia', 148.5, 40, { align: 'center' });

    // Add course name
    doc.setFontSize(20);
    doc.text(`${courseName}`, 148.5, 60, { align: 'center' });

    // Add user info
    doc.setFontSize(16);
    doc.text('Certyfikat wystawiony dla:', 148.5, 80, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(`${currentUser?.displayName}`, 148.5, 90, { align: 'center' });

    // Add score
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`Wynik testu: ${score}%`, 148.5, 110, { align: 'center' });

    // Add certificate number and date
    doc.setFontSize(12);
    doc.text(`Numer certyfikatu: ${certificateNumber}`, 148.5, 130, { align: 'center' });
    doc.text(`Data wystawienia: ${new Date().toLocaleDateString()}`, 148.5, 140, { align: 'center' });

    // Add signature lines
    doc.setDrawColor(100);
    doc.setLineWidth(0.5);
    doc.line(50, 170, 120, 170);
    doc.line(177, 170, 247, 170);

    doc.setFontSize(10);
    doc.text('Podpis Instruktora', 85, 180, { align: 'center' });
    doc.text('Dyrektor Platformy', 212, 180, { align: 'center' });

    // Convert to base64
    return doc.output('datauristring');
  };

  const handleAnswer = async (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const finalScore = calculateScore(newAnswers);
      setScore(finalScore);
      setShowResults(true);

      if (finalScore >= 70) {
        await handleCourseCompletion(finalScore);
      }
    }
  };

  const calculateScore = (finalAnswers: number[]): number => {
    const correctAnswers = finalAnswers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const handleCourseCompletion = async (finalScore: number) => {
    setLoading(true);
    setError(null);

    try {
      if (!currentUser?.uid) {
        throw new Error('Nie znaleziono użytkownika');
      }

      const certificateNumber = generateCertificateNumber();
      const pdfData = await generateCertificatePDF(certificateNumber, finalScore);

      // Upload PDF to Storage
      const pdfRef = ref(storage, `certificates/${currentUser.uid}/${certificateNumber}.pdf`);
      await uploadString(pdfRef, pdfData, 'data_url');
      const pdfUrl = await getDownloadURL(pdfRef);

      // Add certificate to 'certificates' collection
      await addDoc(collection(db, 'certificates'), {
        courseId,
        userId: currentUser.uid,
        certificateNumber,
        completionDate: new Date(),
        score: finalScore,
        pdfUrl,
        status: 'active'
      });

      // Update user document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        completedCourses: arrayUnion({
            courseId: courseId,
          completedAt: new Date(),
          certificateNumber,
          certificatePdfUrl: pdfUrl,
          score: finalScore
        })
      });

      console.log('Course completion handled successfully');
    } catch (error) {
      console.error('Error handling course completion:', error);
      setError('Wystąpił błąd podczas generowania certyfikatu. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };

  if (showResults) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Wynik testu</h2>
        <p className="text-lg mb-4">
          Twój wynik: {score.toFixed(1)}%
        </p>
        {score >= 70 ? (
          <div className="space-y-4">
            <div className="text-green-600 p-4 bg-green-50 rounded-lg">
              <p className="font-semibold">Gratulacje! Test zaliczony!</p>
              <p>Kurs został oznaczony jako ukończony.</p>
              {loading && (
                <p className="text-sm mt-2">
                  Trwa generowanie certyfikatu...
                </p>
              )}
              {error && (
                <p className="text-red-600 text-sm mt-2">
                  {error}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Wróć do kursu
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Lista kursów
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-red-600 p-4 bg-red-50 rounded-lg">
              <p className="font-semibold">Niestety, test nie został zaliczony.</p>
              <p>Wymagane jest minimum 70% poprawnych odpowiedzi.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setShowResults(false);
                }}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Spróbuj ponownie
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Wróć do kursu
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Pytanie {currentQuestion + 1} z {questions.length}
        </h2>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-lg mb-6">{questions[currentQuestion].question}</p>
        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="w-full text-left p-4 rounded border hover:bg-blue-50 hover:border-blue-500 transition-colors duration-200"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};