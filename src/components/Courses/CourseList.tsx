// src/components/Courses/CourseList.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { Course, User } from '../../types';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import logoImage from '../../assets/logoEP.png';

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
        })) as Course[];
        setCourses(coursesData);
      } catch (error) {
        console.error('Błąd podczas pobierania kursów:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (currentUser) {
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

  const generateCertificate = (course: Course, user: User) => {
    const certificateNumber = `CERT-${user.uid}-${course.id}`;
  
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
  
    // Tło certyfikatu
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 297, 210, 'F');
  
    // Ramka
    doc.setDrawColor(0);
    doc.setLineWidth(5);
    doc.rect(10, 10, 277, 190);
  
    // Dodaj logo (jeśli masz plik logo)
    try {
      doc.addImage(logoImage, 'PNG', 20, 15, 50, 50);
    } catch (error) {
      console.error('Nie można dodać logo:', error);
    }
  
    // Tytuł certyfikatu
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Certyfikat Ukończenia Kursu', 148, 50, { align: 'center' });
  
    // Dane użytkownika
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text(`Niniejszym zaświadcza się, że`, 148, 80, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(user.displayName, 148, 100, { align: 'center' });
  
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text(`pomyślnie ukończył kurs:`, 148, 120, { align: 'center' });
  
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(course.title, 148, 140, { align: 'center' });
  
    // Data
    const today = new Date();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Data ukończenia: ${today.toLocaleDateString()}`, 148, 160, { align: 'center' });
  
    // Numer certyfikatu
    doc.text(`Numer certyfikatu: ${certificateNumber}`, 148, 170, { align: 'center' });
  
    // Podpisy
    doc.setLineWidth(0.5);
    doc.line(50, 190, 100, 190); // Linia pod podpisem
    doc.line(200, 190, 250, 190); // Linia pod podpisem
    doc.text('Dyrektor Platformy', 75, 200, { align: 'center' });
  
    // Zapis PDF
    doc.save(`Certyfikat_${course.title}_${today.toISOString().split('T')[0]}.pdf`);
  };

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
                    <div className="flex flex-col items-end">
                      <button 
                        className={`px-6 py-2 rounded-lg text-white font-semibold ${
                          currentUser?.completedCourses?.includes(course.id)
                            ? 'bg-green-500 cursor-default'
                            : currentUser?.purchasedCourses?.includes(course.id)
                              ? 'bg-blue-500 hover:bg-blue-600'
                              : 'bg-blue-500 hover:bg-blue-600'
                        } transition-colors duration-200`}
                        onClick={() => handleCourseAction(course)}
                        disabled={currentUser?.completedCourses?.includes(course.id)}
                      >
                        {currentUser?.completedCourses?.includes(course.id)
                          ? 'Zaliczony'
                          : currentUser?.purchasedCourses?.includes(course.id)
                            ? 'Rozpocznij kurs'
                            : 'Kup teraz'}
                      </button>
                      {currentUser?.completedCourses?.includes(course.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateCertificate(course, currentUser);
                          }}
                          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Pobierz certyfikat
                        </button>
                      )}
                    </div>
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