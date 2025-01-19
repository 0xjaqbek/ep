import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { useAuth } from '../Auth/AuthProvider.tsx';

interface CourseTestProps {
  courseId: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  onClose: () => void;
}

export const CourseTest: React.FC<CourseTestProps> = ({ courseId, questions, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore(newAnswers);
    }
  };

  const calculateScore = (finalAnswers: number[]) => {
    const correctAnswers = finalAnswers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);

    const finalScore = (correctAnswers / questions.length) * 100;
    setScore(finalScore);
    setShowResults(true);

    if (finalScore >= 70) { // Próg zaliczenia testu
      markCourseAsCompleted();
    }
  };

  const markCourseAsCompleted = async () => {
    try {
      // Dodaj logi debugowania
      console.log('Current User:', currentUser);
      console.log('Course ID:', courseId);
      
      if (!currentUser?.uid) {
        console.error('Brak ID użytkownika');
        return;
      }

      // Utwórz referencję do dokumentu użytkownika
      const userDocRef = doc(db, 'users', currentUser.uid);
      console.log('User document reference created for:', currentUser.uid);

      // Aktualizuj dokument
      await updateDoc(userDocRef, {
        completedCourses: arrayUnion(courseId)
      });

      console.log('Kurs został oznaczony jako ukończony');
    } catch (error) {
      console.error('Pełny błąd:', error);
      // Nie pokazuj błędu użytkownikowi - test został zaliczony
    }
};

  if (showResults) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Wynik testu</h2>
        <p className="text-lg mb-4">
          Twój wynik: {score.toFixed(1)}%
        </p>
        {score >= 70 ? (
          <div className="text-green-600 mb-4">
            <p>Gratulacje! Test zaliczony!</p>
            <p>Kurs został oznaczony jako ukończony.</p>
          </div>
        ) : (
          <p className="text-red-600 mb-4">
            Niestety, nie udało się zaliczyć testu. Wymagane jest minimum 70%.
          </p>
        )}
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Wróć do kursu
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Pytanie {currentQuestion + 1} z {questions.length}</h2>
        <div className="h-2 bg-gray-200 rounded">
          <div 
            className="h-2 bg-blue-500 rounded"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-lg mb-4">{questions[currentQuestion].question}</p>
        <div className="space-y-2">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="w-full text-left p-3 rounded border hover:bg-blue-50 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};