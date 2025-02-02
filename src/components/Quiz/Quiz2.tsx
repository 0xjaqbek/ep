// src/components/Quiz/Quiz2.tsx
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

export const advancedQuizData: Question[] = [
    {
        id: "1",
        question: "Jakie są przeciwwskazania do resuscytacji krążeniowo-oddechowej?",
        options: [
          "Zmęczenie ratownika",
          "Widoczny rozkład zwłok",
          "Brak sprzętu medycznego",
          "Brak świadków zdarzenia"
        ],
        correctAnswer: 1,
        explanation: "Jedynym bezwzględnym przeciwwskazaniem do resuscytacji jest stwierdzona śmierć biologiczna, np. rozkład zwłok."
      },
      {
        id: "2",
        question: "Jaki lek podaje się domięśniowo w przypadku wstrząsu anafilaktycznego?",
        options: [
          "Deksametazon",
          "Adrenalinę",
          "Morfina",
          "Dopaminę"
        ],
        correctAnswer: 1,
        explanation: "Adrenalina jest lekiem pierwszego wyboru w leczeniu wstrząsu anafilaktycznego."
      },
      {
        id: "3",
        question: "Jaka jest minimalna częstość uciśnięć klatki piersiowej u dorosłego podczas RKO?",
        options: [
          "60/min",
          "80/min",
          "100/min",
          "120/min"
        ],
        correctAnswer: 2,
        explanation: "Minimalna częstość uciśnięć klatki piersiowej podczas RKO to 100-120 na minutę."
      },
      {
        id: "4",
        question: "Co to jest oddech agonalny?",
        options: [
          "Normalny oddech",
          "Płytki, nieregularny oddech, często mylony z prawidłowym",
          "Szybki i głęboki oddech",
          "Brak oddechu"
        ],
        correctAnswer: 1,
        explanation: "Oddech agonalny to płytki, nieregularny oddech, który może występować przy zatrzymaniu krążenia."
      },
      {
        id: "5",
        question: "Jaki rytm serca można defibrylować przy użyciu AED?",
        options: [
          "Asystolię",
          "Migotanie komór",
          "Bradykardię zatokową",
          "Tachykardię zatokową"
        ],
        correctAnswer: 1,
        explanation: "AED można używać do defibrylacji migotania komór i częstoskurczu komorowego bez tętna. Asystolia nie jest wskazaniem do defibrylacji."
      },
      {
        id: "6",
        question: "Który z poniższych objawów jest wskazaniem do natychmiastowego zatrzymania resuscytacji?",
        options: [
          "Brak reakcji na uciski",
          "Brak tętna po 5 minutach RKO",
          "Powrót oznak życia, np. spontaniczny oddech",
          "Brak dostępu do defibrylatora"
        ],
        correctAnswer: 2,
        explanation: "Resuscytację należy kontynuować do momentu powrotu oznak życia, przekazania pacjenta służbom medycznym lub wyczerpania sił ratownika."
      },
      {
        id: "7",
        question: "W jakiej sytuacji podczas RKO należy podać amiodaron?",
        options: [
          "W przypadku migotania przedsionków",
          "Po trzeciej nieskutecznej defibrylacji w migotaniu komór",
          "Po pierwszej defibrylacji",
          "Podaje się tylko po powrocie spontanicznego krążenia"
        ],
        correctAnswer: 1,
        explanation: "Amiodaron podaje się po trzeciej nieskutecznej defibrylacji w migotaniu komór lub częstoskurczu komorowym bez tętna."
      },
      {
        id: "8",
        question: "Jaki gaz jest podawany w zatruciu tlenkiem węgla?",
        options: [
          "Dwutlenek węgla",
          "Czysty tlen",
          "Podtlenek azotu",
          "Azot"
        ],
        correctAnswer: 1,
        explanation: "W przypadku zatrucia tlenkiem węgla podaje się 100% tlen w celu przyspieszenia eliminacji CO z organizmu."
      }
];

const Quiz2: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(advancedQuizData.length).fill(-1));
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
    if (currentQuestion < advancedQuizData.length - 1) {
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
        quizType: 'advanced',
        answers: selectedAnswers,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Błąd zapisu wyników:', error);
    }
  };

  const calculateScore = () => {
    return selectedAnswers.filter((answer, index) => answer === advancedQuizData[index].correctAnswer).length;
  };

  const returnToCourses = () => {
    navigate('/courses');
  };

  if (showResults) {
    const score = calculateScore();
    const totalQuestions = advancedQuizData.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="p-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Wyniki Quizu Zaawansowanego</h2>
        <div className="text-center mb-6">
          <p className="text-xl">Twój wynik: {score} / {totalQuestions}</p>
          <p className="text-lg font-semibold">
            {percentage >= 70 
              ? "Gratulacje! Zdałeś zaawansowany test pierwszej pomocy." 
              : "Nie udało Ci się zaliczyć zaawansowanego testu. Spróbuj ponownie."}
          </p>
        </div>
        
        <div>
          {advancedQuizData.map((q, i) => (
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
        <p className="text-sm text-gray-600">Pytanie {currentQuestion + 1} z {advancedQuizData.length}</p>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">{advancedQuizData[currentQuestion].question}</h2>
        <div className="space-y-2 mb-6">
          {advancedQuizData[currentQuestion].options.map((option, index) => (
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
          {currentQuestion === advancedQuizData.length - 1 ? (
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

export default Quiz2;