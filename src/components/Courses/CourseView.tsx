import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { CourseTest } from './CourseTest.tsx';
import { Course } from '../../types';
import SEO from '../SEO.tsx';

export const CourseView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showTest, setShowTest] = useState(false);
  
    useEffect(() => {
      const fetchCourse = async () => {
        try {
          if (!id) return;
          
          const courseDoc = await getDoc(doc(db, 'courses', id));
          
          if (!courseDoc.exists()) {
            setError('Kurs nie istnieje');
            return;
          }
    
          const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
          setCourse(courseData);
        } catch (error) {
          setError('Błąd podczas ładowania kursu');
          console.error('Error fetching course:', error);
        } finally {
          setLoading(false);
        }
      };
    
      fetchCourse();
    }, [id]);
    
    useEffect(() => {
      if (!loading && currentUser && course) {
        if (!currentUser.purchasedCourses?.includes(course.id)) {
          navigate('/courses');
        }
      }
    }, [loading, currentUser, course, navigate]);
  
    const handleTestClose = () => {
      setShowTest(false);
    };
    
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    if (error || !course) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error || 'Kurs nie został znaleziony'}</h1>
          <button
            onClick={() => navigate('/courses')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Wróć do listy kursów
          </button>
        </div>
      );
    }
    
    return (
      <>
      <SEO 
        title="Kursy"
        description="Przeglądaj nasze kursy medyczne. Zdobywaj wiedzę i punkty edukacyjne online."
        ogType="website"
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
        
        {course.videoUrl ? (
          <div className="aspect-w-16 aspect-h-9 mb-6">
            <iframe
              src={course.videoUrl}
              className="w-full h-full rounded-lg shadow-lg"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="bg-gray-100 p-8 rounded-lg mb-6 text-center">
            <p className="text-gray-600">Film zostanie dodany wkrótce</p>
          </div>
        )}
    
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Opis kursu</h2>
          <p className="text-gray-700 mb-6">{course.description}</p>
    
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Szczegóły:</h3>
            <p className="text-gray-600">Czas trwania: {course.duration} minut</p>
          </div>
    
          {course.testQuestions && course.testQuestions.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Test sprawdzający</h2>
              {showTest ? (
                <CourseTest
                  courseId={course.id}
                  courseName={course.title}
                  questions={course.testQuestions}
                  onClose={handleTestClose}
                />
              ) : (
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  onClick={() => setShowTest(true)}
                >
                  Rozpocznij test
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      </>
    );
  };