// src/components/Admin/BlogPostForm.tsx
import React, { useState } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config.ts';
import { BlogPost } from '../../types/blog.ts';
import { useAuth } from '../Auth/AuthProvider.tsx';

// Validation schema
const BlogPostSchema = Yup.object().shape({
  title: Yup.string()
    .required('Tytuł jest wymagany')
    .min(5, 'Tytuł musi mieć co najmniej 5 znaków')
    .max(100, 'Tytuł nie może być dłuższy niż 100 znaków'),
  
  content: Yup.string()
    .required('Treść jest wymagana')
    .min(50, 'Treść musi mieć co najmniej 50 znaków'),
  
  excerpt: Yup.string()
    .required('Krótki opis jest wymagany')
    .max(300, 'Krótki opis nie może być dłuższy niż 300 znaków'),
  
  categories: Yup.array()
    .of(Yup.string().required('Kategoria nie może być pusta'))
    .min(1, 'Wybierz co najmniej jedną kategorię'),
  
  tags: Yup.array()
    .of(Yup.string().required('Tag nie może być pusty'))
    .optional(),
  
  coverImage: Yup.mixed().optional()
});

// Extend the initial form values type
interface FormValues {
  title: string;
  content: string;
  excerpt: string;
  categories: string[];
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  coverImage: File | null;
}

interface BlogPostFormProps {
    initialPost?: BlogPost | null;  // Allow null
    onSave: () => void;
    onCancel: () => void;
}

export const BlogPostForm: React.FC<BlogPostFormProps> = ({ 
  initialPost = null, 
  onSave, 
  onCancel 
}) => {
  const { currentUser } = useAuth();
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialPost?.coverImage || null
  );

  // Predefined categories and tags
  const categories = [
    'Ratownictwo medyczne', 
    'Pierwsza pomoc', 
    'Szkolenia', 
    'Porady', 
    'Edukacja'
  ];

  const handleSubmit = async (
    values: FormValues, 
    { setSubmitting, setErrors }: FormikHelpers<FormValues>
  ) => {
    try {
      // Validate user is authenticated and is an admin
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Brak uprawnień');
      }

      // Upload cover image if a new one is selected
      let coverImageUrl = initialPost?.coverImage || '';
      if (coverImageFile) {
        const imageRef = ref(
          storage, 
          `blog_images/${Date.now()}_${coverImageFile.name}`
        );
        const snapshot = await uploadBytes(imageRef, coverImageFile);
        coverImageUrl = await getDownloadURL(snapshot.ref);
      }

      // Prepare post data
      const postData: Omit<BlogPost, 'id'> = {
        title: values.title,
        slug: values.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
        content: values.content,
        excerpt: values.excerpt,
        categories: values.categories,
        tags: values.tags || [],
        coverImage: coverImageUrl,
        publishedAt: initialPost?.publishedAt || new Date(),
        updatedAt: new Date(),
        author: {
          id: currentUser.uid || '',
          name: currentUser.displayName || 'Administrator',
          avatar: '', 
          bio: '' 
        },
        seo: {
          title: values.seoTitle || values.title,
          description: values.seoDescription || values.excerpt,
          keywords: values.tags || []
        }
      };

      // Save or update the post
      if (initialPost) {
        // Update existing post
        const postRef = doc(db, 'blog_posts', initialPost.id);
        await updateDoc(postRef, postData);
      } else {
        // Create new post
        await addDoc(collection(db, 'blog_posts'), postData);
      }

      // Call onSave callback
      onSave();
      setSubmitting(false);
    } catch (error) {
      console.error('Error saving blog post:', error);
      setErrors({ 
        title: error instanceof Error ? error.message : 'Wystąpił błąd' 
      });
      setSubmitting(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">
        {initialPost ? 'Edytuj wpis na blogu' : 'Dodaj nowy wpis na blogu'}
      </h2>

      <Formik<FormValues>
        initialValues={{
          title: initialPost?.title || '',
          content: initialPost?.content || '',
          excerpt: initialPost?.excerpt || '',
          categories: initialPost?.categories || [],
          tags: initialPost?.tags || [],
          seoTitle: initialPost?.seo?.title || '',
          seoDescription: initialPost?.seo?.description || '',
          coverImage: null
        }}
        validationSchema={BlogPostSchema}
        onSubmit={handleSubmit}
      >
        {({ 
          values, 
          errors, 
          touched, 
          isSubmitting, 
          setFieldValue 
        }) => (
          <Form className="space-y-6">
            {/* Rest of the form remains the same */}
            <div>
              <label htmlFor="title" className="block mb-2">
                Tytuł wpisu
              </label>
              <Field
                name="title"
                type="text"
                className={`w-full p-2 border rounded ${
                  touched.title && errors.title ? 'border-red-500' : ''
                }`}
              />
              {touched.title && errors.title && (
                <div className="text-red-500 text-sm mt-1">
                  {errors.title}
                </div>
              )}
            </div>

            {/* Render the rest of the form as before */}
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSubmitting 
                  ? 'Zapisywanie...' 
                  : (initialPost ? 'Aktualizuj wpis' : 'Dodaj wpis')
                }
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BlogPostForm;