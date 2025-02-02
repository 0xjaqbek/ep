// src/components/Courses/CourseList.tsx
import React, { useEffect, useState } from 'react';
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc as firestoreDoc, 
  arrayUnion, 
  addDoc, 
  Timestamp,
  getDoc 
} from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { Course, CompletedCourse, User, Quiz } from '../../types';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import logoImage from '../../assets/logoEP.webp';
import { RatingModal } from '../RatingModal.tsx';
import { useCart } from '../../contexts/CartContext.tsx';
import SEO from '../SEO.tsx';
import { quizData } from '../Quiz/Quiz.tsx'; 


interface CertificateData {
  userName: string;
  courseName: string;
  certificateNumber: string;
  completionDate: Date;
}

const generateAndDownloadPDF = async (data: CertificateData) => {
  const { jsPDF } = await import('jspdf');
  const pdfDoc = new jsPDF('landscape', 'mm', 'a4');

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
  pdfDoc.setFontSize(30);
  pdfDoc.text('Certyfikat Ukończenia', 148.5, 40, { align: 'center' });

  pdfDoc.setFontSize(20);
  pdfDoc.text(data.courseName, 148.5, 60, { align: 'center' });

  pdfDoc.setFontSize(16);
  pdfDoc.text('Certyfikat wystawiony dla:', 148.5, 80, { align: 'center' });
  pdfDoc.setFont('helvetica', 'bold');
  pdfDoc.text(data.userName, 148.5, 90, { align: 'center' });

  pdfDoc.setFont('helvetica', 'normal');
  pdfDoc.setFontSize(14);
  pdfDoc.text(`Wynik testu: 100%`, 148.5, 110, { align: 'center' });

  pdfDoc.setFontSize(12);
  pdfDoc.text(`Numer certyfikatu: ${data.certificateNumber}`, 148.5, 130, { align: 'center' });
  pdfDoc.text(`Data wystawienia: ${data.completionDate.toLocaleDateString('pl-PL')}`, 148.5, 140, { align: 'center' });

  pdfDoc.setDrawColor(100);
  pdfDoc.setLineWidth(0.5);
  pdfDoc.line(50, 170, 120, 170);
  pdfDoc.line(177, 170, 247, 170);

  pdfDoc.setFontSize(10);
  pdfDoc.text('Podpis Instruktora', 85, 180, { align: 'center' });
  pdfDoc.text('Dyrektor Platformy', 212, 180, { align: 'center' });

  pdfDoc.save(`Certyfikat_${data.courseName}_${data.completionDate.toISOString().split('T')[0]}.pdf`);
};

export const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { addToCart, state: cartState } = useCart();
  const [quizzes, setQuizzes] = useState<(Course | Quiz)[]>([]);

  const refreshUserData = async () => {
    if (currentUser?.uid) {
      try {
        const userDoc = await getDoc(firestoreDoc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          // Only fetch courses if needed, e.g., if courses array is empty
          if (courses.length === 0) {
            await fetchCoursesAndQuizzes();
          }
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  const fetchCoursesAndQuizzes = async () => {
    try {
      // Fetch Courses
      const coursesRef = collection(db, 'courses');
      const coursesSnapshot = await getDocs(coursesRef);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(coursesData);
  
      // Create a single quiz entry
      const singleQuiz: Quiz = {
        id: 'first-aid-quiz',
        title: 'Quiz Pierwszej Pomocy - Poziom Podstawowy',
        description: 'Sprawdź swoją wiedzę z zakresu pierwszej pomocy. Ten darmowy quiz pomoże Ci zrozumieć podstawowe zasady ratowania życia w nagłych wypadkach.',
        questions: quizData.map(q => ({
          ...q,
          correctAnswer: q.correctAnswer // Map correctIndex to correctAnswer
        })), 
        price: 0,
        duration: 20,
        points: 2
      };
      
      setQuizzes([singleQuiz]);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Wystąpił błąd podczas ładowania kursów');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Fetch courses regardless of user authentication
        await fetchCoursesAndQuizzes();
        
        // Only refresh user data if logged in
        if (currentUser?.uid) {
          await refreshUserData();
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Wystąpił błąd podczas ładowania danych');
      } finally {
        setLoading(false);
      }
    };
  
    initializeData();
  
    // Only add visibility and focus handlers if user is logged in
    if (currentUser?.uid) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          refreshUserData();
        }
      };
  
      const handleFocus = () => {
        refreshUserData();
      };
  
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
  
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [currentUser?.uid]);

  const handleCourseAction = async (course: Course) => {
    if (!currentUser) {
      navigate('/login', { 
        state: { 
          redirectAfterLogin: `/courses`,
          message: 'Zaloguj się, aby kupić kurs' 
        } 
      });
      return;
    }
  
    if (currentUser.purchasedCourses?.includes(course.id)) {
      navigate(`/course/${course.id}/learn`);
    } else {
      addToCart(course);
    }
  };

  const generateCertificate = async (course: Course, user: User) => {
    try {
      if (!user.uid) {
        throw new Error('User not authenticated');
      }

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      const dateStr = `${year}${month}${day}-${hours}${minutes}`;
      const userPrefix = user.uid.substring(0, 3);
      
      const certificateNumber = `CERT-${course.id.substring(0, 4)}-${dateStr}-${userPrefix}`;

      const now_timestamp = Timestamp.now();

      const certificateData = {
        userId: user.uid,
        userName: user.displayName,
        courseId: course.id,
        courseName: course.title,
        certificateNumber,
        completionDate: now_timestamp,
        score: 100,
        status: 'active'
      };

      await addDoc(collection(db, 'certificates'), certificateData);

      const userRef = firestoreDoc(db, 'users', user.uid);
      const completedCourseData = {
        courseId: course.id,
        completedAt: now_timestamp,
        certificateNumber,
        score: 100
      };

      await updateDoc(userRef, {
        completedCourses: arrayUnion(completedCourseData)
      });

    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  };

  return (
    <>
      <SEO 
        title="Kursy"
        description="Przeglądaj kursy z ratownictwa medycznego. Ucz się online, zdobywaj punkty edukacyjne i certyfikaty."
        keywords="kursy medyczne, ratownictwo medyczne, punkty edukacyjne, certyfikaty"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Courses Section */}
        <h2 className="text-2xl font-bold mb-6">Dostępne kursy</h2>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <p className="text-center text-gray-600">Brak dostępnych kursów</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div 
                key={course.id} 
                className="border rounded-lg overflow-hidden shadow-lg bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-500"
              >
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
                    <div className="space-y-1 text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-2">⏱</span>
                        <span>Czas trwania: {course.duration} min</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">🎯</span>
                        <span>Punkty edykacyjne: {course.points || 5}</span>
                      </div>
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
                              : cartState.items.some(item => item.courseId === course.id)
                                ? 'W koszyku'
                                : 'Dodaj do koszyka'
                          }
                        </button>
                        {currentUser?.completedCourses?.some(cc => cc.courseId === course.id) && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (currentUser) {
                                  const completedCourse = currentUser.completedCourses.find(
                                    cc => cc.courseId === course.id
                                  );
                                  if (completedCourse) {
                                    generateAndDownloadPDF({
                                      userName: currentUser.displayName,
                                      courseName: course.title,
                                      certificateNumber: completedCourse.certificateNumber,
                                      completionDate: completedCourse.completedAt.toDate()
                                    });
                                  }
                                }
                              }}
                              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                              Pobierz certyfikat
                            </button>
                            <button
                              onClick={() => setSelectedCourse(course)}
                              className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                            >
                              Oceń kurs
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

{/* Quizzes Section */}
<h2 className="text-2xl font-bold mt-8 mb-6">Sprawdź swoja wiedzę.</h2>
{loading ? (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Basic Quiz Card */}
    <div 
      className="border rounded-lg overflow-hidden shadow-lg bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-green-500"
    >
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">Quiz Podstawowy</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          Sprawdź swoją wiedzę z zakresu pierwszej pomocy. Idealny dla początkujących.
        </p>
        <div className="space-y-2">

        </div>
        <Link 
          to={`/quiz`} 
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 block text-center transition-colors"
        >
          Rozpocznij quiz podstawowy
        </Link>
      </div>
    </div>

    {/* Intermediate Quiz Card */}
    <div 
      className="border rounded-lg overflow-hidden shadow-lg bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-yellow-500"
    >
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">Quiz Średniozaawansowany</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          Pogłęb swoją wiedzę z pierwszej pomocy. Dla osób, które chcą więcej.
        </p>
        <div className="space-y-2">

        </div>
        <Link 
          to={`/quiz1`} 
          className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 block text-center transition-colors"
        >
          Rozpocznij quiz średniozaawansowany
        </Link>
      </div>
    </div>

    {/* Advanced Quiz Card */}
    <div 
      className="border rounded-lg overflow-hidden shadow-lg bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-500"
    >
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">Quiz Zaawansowany</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          Sprawdź swoją zaawansowaną wiedzę z pierwszej pomocy. Dla osób z doświadczeniem.
        </p>
        <div className="space-y-2">

        </div>
        <Link 
          to={`/quiz2`} 
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 block text-center transition-colors"
        >
          Rozpocznij quiz zaawansowany
        </Link>
      </div>
    </div>
  </div>
)}


        {/* Rating Modal */}
        {selectedCourse && currentUser && (
          <RatingModal
            isOpen={!!selectedCourse}
            onClose={() => setSelectedCourse(null)}
            courseId={selectedCourse.id}
            courseName={selectedCourse.title}
            userId={currentUser?.uid || ''}
            userName={currentUser?.displayName || ''}
          />
        )}
      </div>
    </>
  );
};

export default CourseList;