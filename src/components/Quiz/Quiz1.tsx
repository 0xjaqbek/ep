// src/components/Quiz/Quiz1.tsx
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

export const intermediateQuizData: Question[] = [
    {
        id: "1",
        question: "Jakie są objawy wstrząsu anafilaktycznego?",
        options: [
          "Silny ból brzucha",
          "Trudności w oddychaniu, obrzęk twarzy i wysypka",
          "Ból w klatce piersiowej",
          "Ból głowy i nudności"
        ],
        correctAnswer: 1,
        explanation: "Wstrząs anafilaktyczny objawia się trudnościami w oddychaniu, obrzękiem twarzy i wysypką, wymaga natychmiastowej pomocy."
      },
      {
        id: "2",
        question: "Co należy zrobić w przypadku podejrzenia złamania otwartego?",
        options: [
          "Próbować nastawić kość",
          "Zakryć ranę jałowym opatrunkiem i unieruchomić kończynę",
          "Przemyć ranę wodą utlenioną",
          "Natychmiast transportować poszkodowanego"
        ],
        correctAnswer: 1,
        explanation: "W przypadku złamania otwartego należy zabezpieczyć ranę jałowym opatrunkiem, unieruchomić kończynę i wezwać pomoc."
      },
      {
        id: "3",
        question: "Jaki jest pierwszy krok w przypadku oparzenia termicznego?",
        options: [
          "Posmarować miejsce oparzenia maścią",
          "Zanurzyć oparzoną część ciała w zimnej wodzie przez co najmniej 10 minut",
          "Przykryć miejsce folią aluminiową",
          "Przekłuć pęcherze"
        ],
        correctAnswer: 1,
        explanation: "Najlepszym działaniem przy oparzeniu jest chłodzenie miejsca zimną wodą przez co najmniej 10 minut."
      },
      {
        id: "4",
        question: "Co oznacza skrót SAMPLE w wywiadzie medycznym?",
        options: [
          "Symptomy, Alergie, Medykamenty, Przebyte choroby, Lunch, Emocje",
          "Symptomy, Alergie, Medykamenty, Przebyte choroby, Ostatni posiłek, Wydarzenia poprzedzające",
          "Szybka Analiza, Medyczne Przygotowanie, Leczenie, Emocje",
          "Nie ma takiego skrótu w pierwszej pomocy"
        ],
        correctAnswer: 1,
        explanation: "SAMPLE to skrót pomagający zebrać wywiad medyczny: Symptomy, Alergie, Medykamenty, Przebyte choroby, Ostatni posiłek, Wydarzenia poprzedzające."
      },
      {
        id: "5",
        question: "Jaka jest prawidłowa pozycja poszkodowanego w przypadku podejrzenia urazu kręgosłupa?",
        options: [
          "Pozycja boczna ustalona",
          "Leżenie na plecach bez ruchu",
          "Pozycja Trendelenburga",
          "Ułożenie w pozycji półsiedzącej"
        ],
        correctAnswer: 1,
        explanation: "Osoba z podejrzeniem urazu kręgosłupa powinna pozostać na plecach, a jej ruchy powinny być jak najbardziej ograniczone."
      },
      {
        id: "6",
        question: "Jakie objawy wskazują na hipoglikemię?",
        options: [
          "Osłabienie, drżenie rąk, potliwość, dezorientacja",
          "Wysoka gorączka i dreszcze",
          "Bladość, obniżone tętno, obrzęki",
          "Silny ból brzucha i nudności"
        ],
        correctAnswer: 0,
        explanation: "Hipoglikemia objawia się osłabieniem, drżeniem rąk, potliwością i dezorientacją. Pomóc może podanie cukru."
      },
      {
        id: "7",
        question: "Jak postępować w przypadku amputacji palca?",
        options: [
          "Zawinąć amputowaną część w suchą gazę i umieścić w szczelnej torbie, a następnie włożyć do lodu",
          "Bezpośrednio włożyć amputowany palec do lodu",
          "Przemyć amputowaną część wodą utlenioną",
          "Spróbować ponownie przyczepić palec"
        ],
        correctAnswer: 0,
        explanation: "Amputowaną część należy zawinąć w jałowy opatrunek, umieścić w szczelnej torbie i schłodzić, nie wkładając bezpośrednio do lodu."
      },
      {
        id: "8",
        question: "Co oznacza triada Becka?",
        options: [
          "Niskie ciśnienie, ściszenie tonów serca, poszerzone żyły szyjne",
          "Wysoka gorączka, obniżone ciśnienie, dreszcze",
          "Sinica, tachykardia, świszczący oddech",
          "Bradykardia, hipotermia, zwężenie źrenic"
        ],
        correctAnswer: 0,
        explanation: "Triada Becka to klasyczne objawy tamponady serca: niskie ciśnienie, ściszenie tonów serca i poszerzone żyły szyjne."
      }
];

const Quiz1: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(intermediateQuizData.length).fill(-1));
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
    if (currentQuestion < intermediateQuizData.length - 1) {
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
        quizType: 'intermediate',
        answers: selectedAnswers,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Błąd zapisu wyników:', error);
    }
  };

  const calculateScore = () => {
    return selectedAnswers.filter((answer, index) => answer === intermediateQuizData[index].correctAnswer).length;
  };

  const returnToCourses = () => {
    navigate('/courses');
  };

  if (showResults) {
    const score = calculateScore();
    const totalQuestions = intermediateQuizData.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="p-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Wyniki Quizu Średniozaawansowanego</h2>
        <div className="text-center mb-6">
          <p className="text-xl">Twój wynik: {score} / {totalQuestions}</p>
          <p className="text-lg font-semibold">
            {percentage >= 65 
              ? "Gratulacje! Zdałeś test średniozaawansowany." 
              : "Nie udało Ci się zaliczyć testu. Spróbuj ponownie."}
          </p>
        </div>
        
        <div>
          {intermediateQuizData.map((q, i) => (
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
        <p className="text-sm text-gray-600">Pytanie {currentQuestion + 1} z {intermediateQuizData.length}</p>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">{intermediateQuizData[currentQuestion].question}</h2>
        <div className="space-y-2 mb-6">
          {intermediateQuizData[currentQuestion].options.map((option, index) => (
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
          {currentQuestion === intermediateQuizData.length - 1 ? (
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

export default Quiz1;