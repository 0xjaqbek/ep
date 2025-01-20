// src/components/Courses/CourseList.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { Course, CompletedCourse, User } from '../../types';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import logoImage from '../../assets/logoEP.png';

export const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const coursesRef = collection(db, 'courses');
      const coursesSnapshot = await getDocs(coursesRef);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Wystąpił błąd podczas ładowania kursów');
    } finally {
      setLoading(false);
    }
  };

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

  const generateCertificate = async (course: Course, user: User) => {
    try {
      const certificateNumber = `CERT-${course.id.substring(0,6)}-${Date.now()}`;
      // Rename the PDF instance to 'pdfDoc' instead of 'doc'
      const pdfDoc = new jsPDF('landscape', 'mm', 'a4');
  
      // Update all references to use pdfDoc instead of doc
      pdfDoc.setFillColor(240, 240, 240);
      pdfDoc.rect(0, 0, 297, 210, 'F');
      pdfDoc.setDrawColor(0);
      pdfDoc.setLineWidth(5);
      pdfDoc.rect(10, 10, 277, 190);
  
      try {
        pdfDoc.addImage(logoImage, 'PNG', 20, 15, 50, 50);
      } catch (error) {
        console.warn('Error adding logo:', error);
      }
  
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.setFontSize(22);
      pdfDoc.text('Certyfikat Ukończenia Kursu', 148, 50, { align: 'center' });
  
      pdfDoc.setFont('helvetica', 'normal');
      pdfDoc.setFontSize(14);
      pdfDoc.text('Niniejszym zaświadcza się, że', 148, 80, { align: 'center' });
  
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.setFontSize(18);
      pdfDoc.text(user.displayName, 148, 100, { align: 'center' });
  
      pdfDoc.setFont('helvetica', 'normal');
      pdfDoc.setFontSize(15);
      pdfDoc.text('pomyślnie ukończył kurs:', 148, 120, { align: 'center' });
  
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.setFontSize(16);
      pdfDoc.text(course.title, 148, 140, { align: 'center' });
  
      const today = new Date();
      pdfDoc.setFont('helvetica', 'normal');
      pdfDoc.setFontSize(12);
      pdfDoc.text(`Data ukończenia: ${today.toLocaleDateString()}`, 148, 160, { align: 'center' });
      pdfDoc.text(`Numer certyfikatu: ${certificateNumber}`, 148, 170, { align: 'center' });
  
      pdfDoc.setDrawColor(100);
      pdfDoc.setLineWidth(0.5);
      pdfDoc.line(50, 180, 120, 180);
      pdfDoc.line(177, 180, 247, 180);
      pdfDoc.setFontSize(10);
      pdfDoc.text('Podpis Instruktora', 85, 185, { align: 'center' });
      pdfDoc.text('Dyrektor Platformy', 212, 185, { align: 'center' });
  
      const pdfOutput = pdfDoc.output('datauristring');
        
      if (user.uid) {
        // Here we use the Firestore doc function
        const userRef = doc(db, 'users', user.uid);
          
        const timestamp = Timestamp.fromDate(today);
          
        const completedCourse = {
          courseId: course.id,
          completedAt: timestamp,
          certificateNumber,
          certificatePdfUrl: pdfOutput,
          score: 100
        };
        
        try {
          await updateDoc(userRef, {
            completedCourses: arrayUnion(completedCourse)
          });
        } catch (error) {
          console.error('Error updating user document:', error);
          throw new Error('Failed to update completion status');
        }
      }
  
      pdfDoc.save(`Certyfikat_${course.title}_${today.toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating certificate:', error);
      setError('Wystąpił błąd podczas generowania certyfikatu');
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => fetchCourses()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Spróbuj ponownie
        </button>
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
                    <span className="mr-2">⏱</span>
                    <span>Czas trwania: {course.duration} min</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-2xl font-bold text-blue-600">{course.price} PLN</span>
                    <div className="flex flex-col items-end">
                      <button 
                        className={`px-6 py-2 rounded-lg text-white font-semibold ${
                          currentUser?.completedCourses?.some(cc => cc.courseId === course.id)
                            ? 'bg-green-500 cursor-default'
                            : currentUser?.purchasedCourses?.includes(course.id)
                              ? 'bg-blue-500 hover:bg-blue-600'
                              : 'bg-blue-500 hover:bg-blue-600'
                        } transition-colors duration-200`}
                        onClick={() => handleCourseAction(course)}
                        disabled={currentUser?.completedCourses?.some(cc => cc.courseId === course.id)}
                      >
                        {currentUser?.completedCourses?.some(cc => cc.courseId === course.id)
                          ? 'Zaliczony'
                          : currentUser?.purchasedCourses?.includes(course.id)
                            ? 'Rozpocznij kurs'
                            : 'Kup teraz'}
                      </button>
                      {currentUser?.completedCourses?.some(cc => cc.courseId === course.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentUser) {
                              generateCertificate(course, currentUser);
                            }
                          }}
                          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
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