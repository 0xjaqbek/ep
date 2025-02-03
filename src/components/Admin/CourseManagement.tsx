// File: src/components/Admin/CourseManagement.tsx
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {  auth, db, storage } from '../../firebase/config.ts';
import { Course } from '../../types';
import { useAuth } from '../Auth/AuthProvider.tsx';

const CourseSchema = Yup.object().shape({
  title: Yup.string().required('Wymagane'),
  description: Yup.string().required('Wymagane'),
  price: Yup.number().required('Wymagane').min(0),
  duration: Yup.number().required('Wymagane').min(1),
});

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchCourses();
  
    // Add these logging statements
    if (currentUser) {
      auth.currentUser?.getIdTokenResult().then(token => {
        console.log('Token Claims:', token.claims);
        console.log('User Role:', currentUser.role);
      });
    }
  }, []);

  const fetchCourses = async () => {
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    const coursesData = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Course[];
    setCourses(coursesData);
  };

  const handleFileUpload = async (file: File, path: string): Promise<string> => {
    try {
      // Explicit role check
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      console.log('Current user role:', currentUser.role);
      console.log('Upload path:', path);

      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      
      console.log('Download URL:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Upload error details:', error);
      throw error;
    }
  };

  let videoUrl: string | undefined = undefined;
  let thumbnailUrl: string | undefined = undefined;

  useEffect(() => {
    if(currentUser) {
      auth.currentUser?.getIdTokenResult().then(token => {
        console.log('Admin role:', token.claims.role);
      });
    }
  }, [currentUser]);
  
  const handleSubmit = async (values: Partial<Course>, { resetForm }: any) => {
        // Debug user and token info
        const token = await auth.currentUser?.getIdTokenResult();
        console.log('User:', currentUser);
        console.log('Token claims:', token?.claims);

   try {
     if (!currentUser || currentUser.role !== 'admin') {
       throw new Error('Unauthorized: Admin access required');
     }
  
     if (videoFile) {
       videoUrl = await handleFileUpload(
         videoFile,
         `courses/videos/${Date.now()}_${videoFile.name}`
       );
     }
  
     if (thumbnailFile) {
       thumbnailUrl = await handleFileUpload(
         thumbnailFile,
         `courses/thumbnails/${Date.now()}_${thumbnailFile.name}`
       );
     }
  
     const courseData: Partial<Course> = {
       ...values,
       videoUrl: videoUrl || '',
       thumbnail: thumbnailUrl || '',
       updatedAt: new Date(),
       testQuestions: selectedCourse?.testQuestions || [],
       isPublished: selectedCourse?.isPublished || false,
       createdAt: new Date()
     };
  
     if (selectedCourse) {
       await updateDoc(doc(db, 'courses', selectedCourse.id), courseData);
     } else {
       await addDoc(collection(db, 'courses'), courseData);
     }
  
     resetForm();
     setSelectedCourse(null);
     setVideoFile(null);
     setThumbnailFile(null);
     await fetchCourses();
   } catch (error) {
     console.error('Error saving course:', error);
     alert('Error during course save');
   }
  };

  const handleDelete = async (courseId: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten kurs?')) {
      try {
        await deleteDoc(doc(db, 'courses', courseId));
        await fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Wystąpił błąd podczas usuwania kursu');
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Zarządzanie kursami</h2>
      
      <Formik
        initialValues={selectedCourse || {
          title: '',
          description: '',
          price: 0,
          duration: 0,
        }}
        validationSchema={CourseSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched }) => (
          <Form className="space-y-4 mb-8">
          <div>
            <label className="block mb-1">Tytuł</label>
            <Field
              name="title"
              className="w-full p-2 border rounded"
            />
            {errors.title && touched.title && (
              <div className="text-red-500">{errors.title}</div>
            )}
          </div>

          <div>
            <label className="block mb-1">Opis</label>
            <Field
              name="description"
              as="textarea"
              className="w-full p-2 border rounded"
            />
            {errors.description && touched.description && (
              <div className="text-red-500">{errors.description}</div>
            )}
          </div>

          <div>
            <label className="block mb-1">Cena (PLN)</label>
            <Field
              name="price"
              type="number"
              className="w-full p-2 border rounded"
            />
            {errors.price && touched.price && (
              <div className="text-red-500">{errors.price}</div>
            )}
          </div>

          <div>
            <label className="block mb-1">Czas trwania (minuty)</label>
            <Field
              name="duration"
              type="number"
              className="w-full p-2 border rounded"
            />
            {errors.duration && touched.duration && (
              <div className="text-red-500">{errors.duration}</div>
            )}
          </div>

          <div>
            <label className="block mb-1">Video</label>
            <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label>Miniatura</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {selectedCourse ? 'Aktualizuj kurs' : 'Dodaj kurs'}
            </button>
          </Form>
        )}
      </Formik>

      {/* Course list rendering */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="border rounded-lg p-4">
            <h3 className="text-xl font-bold mb-2">{course.title}</h3>
            <p className="mb-2">{course.description}</p>
            <p>Cena: {course.price} PLN</p>
            <p>Czas trwania: {course.duration} min</p>
            <div className="mt-4 space-x-2">
              <button
                onClick={() => setSelectedCourse(course)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edytuj
              </button>
              <button
                onClick={() => handleDelete(course.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Usuń
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseManagement;