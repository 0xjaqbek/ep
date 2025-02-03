// src/components/Admin/TestManagement.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';

interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  testQuestions: TestQuestion[];
}

const TestManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionForm, setQuestionForm] = useState<Omit<TestQuestion, 'id'>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const coursesRef = collection(db, 'courses');
      const snapshot = await getDocs(coursesRef);
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const newQuestion: TestQuestion = {
        id: Date.now().toString(),
        ...questionForm
      };

      const courseRef = doc(db, 'courses', selectedCourse.id);
      const updatedQuestions = [...(selectedCourse.testQuestions || []), newQuestion];

      await updateDoc(courseRef, {
        testQuestions: updatedQuestions
      });

      setSelectedCourse({
        ...selectedCourse,
        testQuestions: updatedQuestions
      });

      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      });

      await fetchCourses();
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedCourse || !window.confirm('Czy na pewno chcesz usunąć to pytanie?')) return;

    try {
      const courseRef = doc(db, 'courses', selectedCourse.id);
      const updatedQuestions = selectedCourse.testQuestions.filter(q => q.id !== questionId);

      await updateDoc(courseRef, {
        testQuestions: updatedQuestions
      });

      setSelectedCourse({
        ...selectedCourse,
        testQuestions: updatedQuestions
      });

      await fetchCourses();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Zarządzanie Testami</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Course List */}
        <div className="col-span-1 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Kursy</h3>
          <div className="space-y-2">
            {courses.map(course => (
              <div
                key={course.id}
                onClick={() => handleCourseSelect(course)}
                className={`p-3 rounded cursor-pointer transition-colors duration-200 ${
                  selectedCourse?.id === course.id
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{course.title}</div>
                <div className="text-sm text-gray-500">
                  Liczba pytań: {course.testQuestions?.length || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Management */}
        <div className="col-span-2">
          {selectedCourse ? (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">
                Pytania testowe - {selectedCourse.title}
              </h3>

              {/* Add Question Form */}
              <form onSubmit={handleQuestionSubmit} className="mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pytanie
                    </label>
                    <input
                      type="text"
                      value={questionForm.question}
                      onChange={(e) => setQuestionForm(prev => ({
                        ...prev,
                        question: e.target.value
                      }))}
                      className="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {questionForm.options.map((option, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Odpowiedź {index + 1}
                      </label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poprawna odpowiedź
                    </label>
                    <select
                      value={questionForm.correctAnswer}
                      onChange={(e) => setQuestionForm(prev => ({
                        ...prev,
                        correctAnswer: parseInt(e.target.value)
                      }))}
                      className="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {questionForm.options.map((_, index) => (
                        <option key={index} value={index}>
                          Odpowiedź {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
                  >
                    Dodaj pytanie
                  </button>
                </div>
              </form>

              {/* Questions List */}
              <div className="space-y-4">
                <h4 className="font-medium">Istniejące pytania:</h4>
                {selectedCourse.testQuestions?.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          {index + 1}. {question.question}
                        </p>
                        <ul className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <li
                              key={optIndex}
                              className={`pl-4 ${
                                optIndex === question.correctAnswer
                                  ? 'text-green-600 font-medium'
                                  : 'text-gray-600'
                              }`}
                            >
                              {optIndex === question.correctAnswer ? '✓ ' : ''}
                              {option}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">
              Wybierz kurs, aby zarządzać pytaniami testowymi
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestManagement;