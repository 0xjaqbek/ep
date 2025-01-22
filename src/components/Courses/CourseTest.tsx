// src/components/Courses/CourseTest.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  doc as firestoreDoc,   
  updateDoc, 
  arrayUnion, 
  addDoc, 
  collection,
  getFirestore,
  Timestamp
} from 'firebase/firestore';
import { 
  getStorage,
  ref, 
  uploadString, 
  getDownloadURL 
} from 'firebase/storage';
import { getApp } from 'firebase/app';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { jsPDF } from 'jspdf';
import { generateAndDownloadPDF, CertificateData } from '../../utils/certificateUtils.tsx';
import { LoadingSpinner } from '../Loading/LoadingSpinner.tsx';

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
  const [certificateNumber, setCertificateNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', {
        state: {
          redirectAfterLogin: `/course/${courseId}/learn`,
          message: 'Zaloguj się, aby kontynuować kurs'
        }
      });
    }
  }, [currentUser, courseId, navigate]);

  const generateCertificateNumber = (userId: string) => {
    const now = new Date();
    
    // Format date as YYYYMMDD-HHMM
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const dateStr = `${year}${month}${day}-${hours}${minutes}`;
    const userPrefix = userId.substring(0, 3); // First 3 characters of user ID
    
    return `CERT-${courseId.substring(0, 4)}-${dateStr}-${userPrefix}`;
  };

  const generateCertificatePDF = async (certificateNumber: string, score: number): Promise<string> => {
    const pdfDoc = new jsPDF('landscape', 'mm', 'a4');

    pdfDoc.setFillColor(240, 240, 240);
    pdfDoc.rect(0, 0, 297, 210, 'F');
    pdfDoc.setDrawColor(0);
    pdfDoc.setLineWidth(5);
    pdfDoc.rect(10, 10, 277, 190);

    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(30);
    pdfDoc.text('Certyfikat Ukończenia', 148.5, 40, { align: 'center' });

    pdfDoc.setFontSize(20);
    pdfDoc.text(`${courseName}`, 148.5, 60, { align: 'center' });

    pdfDoc.setFontSize(16);
    pdfDoc.text('Certyfikat wystawiony dla:', 148.5, 80, { align: 'center' });
    pdfDoc.setFont('helvetica', 'bold');
    if (currentUser?.displayName) {
      pdfDoc.text(currentUser.displayName, 148.5, 90, { align: 'center' });
    }

    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(14);
    pdfDoc.text(`Wynik testu: ${score}%`, 148.5, 110, { align: 'center' });

    pdfDoc.setFontSize(12);
    pdfDoc.text(`Numer certyfikatu: ${certificateNumber}`, 148.5, 130, { align: 'center' });
    pdfDoc.text(`Data wystawienia: ${new Date().toLocaleDateString()}`, 148.5, 140, { align: 'center' });

    pdfDoc.setDrawColor(100);
    pdfDoc.setLineWidth(0.5);
    pdfDoc.line(50, 170, 120, 170);
    pdfDoc.line(177, 170, 247, 170);

    pdfDoc.setFontSize(10);
    pdfDoc.text('Podpis Instruktora', 85, 180, { align: 'center' });
    pdfDoc.text('Dyrektor Platformy', 212, 180, { align: 'center' });

    return pdfDoc.output('datauristring');
  };

  const handleCertificateDownload = () => {
    if (currentUser && certificateNumber) {
      generateAndDownloadPDF({
        userName: currentUser.displayName,
        courseName: courseName,
        certificateNumber: certificateNumber,
        completionDate: new Date()
      });
    }
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

    if (!currentUser?.uid) {
      setError('Musisz być zalogowany, aby zapisać postęp kursu.');
      setLoading(false);
      return;
    }

    const userId = currentUser.uid;

    try {
      const certificateNumber = generateCertificateNumber(userId);
      setCertificateNumber(certificateNumber);
      const pdfData = await generateCertificatePDF(certificateNumber, finalScore);

      // Upload PDF to Storage
      const pdfRef = ref(storage, `certificates/${userId}/${certificateNumber}.pdf`);
      await uploadString(pdfRef, pdfData, 'data_url');
      const pdfUrl = await getDownloadURL(pdfRef);

      const now = Timestamp.now();

      // Create certificate
      await addDoc(collection(db, 'certificates'), {
        courseId,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        certificateNumber,
        completionDate: now,
        score: finalScore,
        pdfUrl,
        status: 'active'
      });

      // Update user's completed courses
      const userDocRef = firestoreDoc(db, 'users', userId);
      const completedCourse = {
        courseId,
        completedAt: now,
        certificateNumber,
        certificatePdfUrl: pdfUrl,
        score: finalScore
      };

      await updateDoc(userDocRef, {
        completedCourses: arrayUnion(completedCourse)
      });

      console.log('Course completion handled successfully');
    } catch (error) {
      console.error('Error handling course completion:', error);
      setError('Wystąpił błąd podczas generowania certyfikatu. Spróbuj ponownie później.');
      throw error;
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
                <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
                  <p>{error}</p>
                  {!currentUser && (
                    <button
                      onClick={() => navigate('/login')}
                      className="mt-2 text-sm underline hover:no-underline"
                    >
                      Zaloguj się
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
  <button
    onClick={handleCertificateDownload}
    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
    disabled={loading}
  >
    {loading ? <LoadingSpinner size="small" /> : 'Pobierz certyfikat'}
  </button>

  <button
    onClick={() => navigate('/courses')}
    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
    disabled={loading}
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

export default CourseTest;