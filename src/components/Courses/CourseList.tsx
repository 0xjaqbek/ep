// src/components/Courses/CourseList.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { Course } from '../../types';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { useNavigate, useLocation } from 'react-router-dom';

export const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  

  useEffect(() => {
    const fetchCourses = async () => {
        try {
          const coursesSnapshot = await getDocs(collection(db, 'courses'));
          const coursesData = coursesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Course[];  // Usuwamy filtrowanie po isPublished
          setCourses(coursesData);
        } catch (error) {
          console.error('Błąd podczas pobierania kursów:', error);
        } finally {
          setLoading(false);
        }
      };

    fetchCourses();
  }, []);

    // Nowy useEffect do odświeżania listy zakupionych kursów
    useEffect(() => {
      if (currentUser) {
        // Odśwież listę kursów po zmianie currentUser lub lokalizacji
        const fetchCourses = async () => {
          try {
            const coursesSnapshot = await getDocs(collection(db, 'courses'));
            const coursesData = coursesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Course[];
            setCourses(coursesData);
          } catch (error) {
            console.error('Błąd podczas pobierania kursów:', error);
          }
        };
  
        fetchCourses();
      }
    }, [currentUser, location.pathname]);

    const handleCourseAction = async (course: Course) => {
      if (!currentUser) {
        navigate('/login', { 
          state: { 
            redirectAfterLogin: `/courses/${course.id}`,
            message: 'Zaloguj się, aby kupić kurs' 
          } 
        });
        return;
      }
    
      if (currentUser.purchasedCourses?.includes(course.id)) {
        // Sprawdź, czy ta linia się wykonuje przez dodanie console.log
        console.log('Przekierowuję do kursu:', `/course/${course.id}/learn`);
        navigate(`/course/${course.id}/learn`);
      } else {
        navigate(`/payment/checkout`, {
          state: {
            courseId: course.id,
            courseTitle: course.title,
            coursePrice: course.price
          }
        });
      }
    };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Dostępne kursy</h2>
      {courses.length === 0 ? (
        <p className="text-center text-gray-600">Brak dostępnych kursów</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="border rounded-lg overflow-hidden shadow-lg bg-white">
              {course.thumbnail && (
                <div className="relative h-48">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                  />
                  {currentUser?.purchasedCourses?.includes(course.id) && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                      Zakupiony
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                      </svg>
                    </span>
                    <span>Czas trwania: {course.duration} min</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-2xl font-bold text-blue-600">{course.price} PLN</span>
                    <button 
                      className={`px-6 py-2 rounded-lg text-white font-semibold ${
                        currentUser?.purchasedCourses?.includes(course.id)
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } transition-colors duration-200`}
                      onClick={() => handleCourseAction(course)}
                    >
                      {currentUser?.purchasedCourses?.includes(course.id)
                        ? 'Rozpocznij kurs'
                        : 'Kup teraz'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};