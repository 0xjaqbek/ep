// src/components/Quiz/Quiz.tsx
import React, { useState } from 'react';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { db } from '../../firebase/config.ts';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }

export const quizData: Question[] = [
    {
        id: "1",
        question: "Jaki jest ogólny numer alarmowy w Europie?",
        options: [
          "997",
          "999",
          "112",
          "911"
        ],
        correctAnswer: 2,
        explanation: "Numer 112 jest ogólnym numerem alarmowym obowiązującym w całej Europie."
      },
      {
        id: "2",
        question: "Co należy zrobić, jeśli osoba straciła przytomność, ale oddycha?",
        options: [
          "Ułożyć ją w pozycji bocznej ustalonej",
          "Rozpocząć resuscytację",
          "Czekać na oznaki poprawy",
          "Podać wodę do picia"
        ],
        correctAnswer: 0,
        explanation: "Osobę nieprzytomną, ale oddychającą należy ułożyć w pozycji bocznej ustalonej, aby zapobiec zadławieniu."
      },
      {
        id: "3",
        question: "Jakie jest pierwsze działanie przy podejrzeniu zatrzymania krążenia?",
        options: [
          "Sprawdzenie przytomności i oddechu",
          "Natychmiastowe podanie wody",
          "Podanie leku",
          "Uniesienie nóg poszkodowanego"
        ],
        correctAnswer: 0,
        explanation: "Najpierw należy sprawdzić przytomność i oddech, aby ocenić, czy konieczna jest resuscytacja."
      },
      {
        id: "4",
        question: "Ile uciśnięć klatki piersiowej wykonuje się u osoby dorosłej podczas RKO?",
        options: [
          "15",
          "20",
          "30",
          "50"
        ],
        correctAnswer: 2,
        explanation: "Standardowy stosunek uciśnięć do oddechów u dorosłych wynosi 30:2."
      },
      {
        id: "5",
        question: "Co należy zrobić w przypadku krwotoku z nosa?",
        options: [
          "Odchylić głowę do tyłu",
          "Położyć osobę na plecach",
          "Pochylić głowę do przodu i ucisnąć nos",
          "Przepłukać nos wodą"
        ],
        correctAnswer: 2,
        explanation: "Najlepiej pochylić głowę do przodu i ucisnąć nos przez kilka minut, aby zatamować krwawienie."
      },
      {
        id: "6",
        question: "Jakie są podstawowe objawy udaru?",
        options: [
          "Gorączka i dreszcze",
          "Ból głowy i wymioty",
          "Osłabienie jednej strony ciała, trudności w mowie, asymetria twarzy",
          "Nagła utrata przytomności"
        ],
        correctAnswer: 2,
        explanation: "Objawy udaru to osłabienie jednej strony ciała, trudności w mowie i asymetria twarzy."
      },
      {
        id: "7",
        question: "Co należy zrobić, gdy ktoś się dławi i nie może oddychać?",
        options: [
          "Uderzyć 5 razy w plecy i wykonać ucisk nadbrzusza (manewr Heimlicha)",
          "Podać wodę do picia",
          "Ułożyć osobę na plecach",
          "Zastosować sztuczne oddychanie"
        ],
        correctAnswer: 0,
        explanation: "Należy wykonać 5 uderzeń w plecy, a jeśli to nie pomoże, zastosować ucisk nadbrzusza."
      },
      {
        id: "8",
        question: "Co oznacza skrót AED?",
        options: [
          "Automatyczny Elektroniczny Defibrylator",
          "Automatyczny Elektryczny Defibrylator",
          "Aparat do Ewakuacji i Defibrylacji",
          "Analizator EKG i Defibrylator"
        ],
        correctAnswer: 1,
        explanation: "AED to Automatyczny Elektryczny Defibrylator, używany do ratowania życia przy zatrzymaniu krążenia."
      }
];

const Quiz: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(quizData.length).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  if (!currentUser) {
    return <p className="text-center text-red-500 font-semibold">Musisz być zalogowany, aby wziąć udział w quizie.</p>;
  }

  const handleAnswerClick = (index: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = index;
    setSelectedAnswers(newAnswers);
  };

  const moveToNextQuestion = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const moveToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishQuiz = async () => {
    setShowResults(true);
    try {
      await addDoc(collection(db, 'quiz_results'), {
        userId: currentUser.uid,
        answers: selectedAnswers,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Błąd zapisu wyników:', error);
    }
  };

  const calculateScore = () => {
    return selectedAnswers.filter((answer, index) => answer === quizData[index].correctAnswer).length;
  };

  const returnToCourses = () => {
    navigate('/courses');
  };

  if (showResults) {
    const score = calculateScore();
    const totalQuestions = quizData.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    

    return (
      <div className="p-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Wyniki Quizu</h2>
        <div className="text-center mb-6">
          <p className="text-xl">Twój wynik: {score} / {totalQuestions}</p>
          <p className="text-lg font-semibold">
            {percentage >= 70 
              ? "Gratulacje! Zdałeś test." 
              : "Nie udało Ci się zaliczyć testu. Spróbuj ponownie."}
          </p>
        </div>
        
        <div>
          {quizData.map((q, i) => (
            <div key={q.id} className="mb-4 p-4 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">{q.question}</p>
              <p className={`mb-2 ${selectedAnswers[i] === q.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                Twoja odpowiedź: {q.options[selectedAnswers[i]]}
              </p>
              <p className="text-gray-700">
                Prawidłowa odpowiedź: {q.options[q.correctAnswer]}
              </p>
              <p className="text-sm text-gray-600 mt-2">{q.explanation}</p>
            </div>
          ))}
        </div>
                {/* New Return to Courses Button */}
                <div className="mt-6 text-center">
          <button 
            onClick={returnToCourses}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Wróć do kursów
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg">
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">Pytanie {currentQuestion + 1} z {quizData.length}</p>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">{quizData[currentQuestion].question}</h2>
        <div className="space-y-2 mb-6">
          {quizData[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              className={`w-full p-3 rounded-lg transition-all text-left 
                ${selectedAnswers[currentQuestion] === index 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              onClick={() => handleAnswerClick(index)}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex justify-between">
          <button 
            onClick={moveToPreviousQuestion}
            disabled={currentQuestion === 0}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Poprzednie
          </button>
          {currentQuestion === quizData.length - 1 ? (
            <button 
              onClick={finishQuiz}
              disabled={selectedAnswers[currentQuestion] === -1}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Zakończ quiz
            </button>
          ) : (
            <button 
              onClick={moveToNextQuestion}
              disabled={selectedAnswers[currentQuestion] === -1}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Następne
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;