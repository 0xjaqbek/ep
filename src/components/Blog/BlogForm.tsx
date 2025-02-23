// src/components/Blog/BlogForm.tsx
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import { useAuth } from '../../components/Auth/AuthProvider';
import { BlogPostSchema, categories } from '../../validation/blogValidation';
import { BlogFormProps, BlogFormValues, BlogPost } from '../../types/blog';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';

export const BlogForm: React.FC<BlogFormProps> = ({ 
  initialPost = null, 
  onSave, 
  onCancel 
}) => {
  const { currentUser } = useAuth();
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialPost?.coverImage || null
  );
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    console.log('BlogForm mounted', { currentUser });
  }, [currentUser]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (values: BlogFormValues, { setSubmitting }: FormikHelpers<BlogFormValues>) => {
    console.log('Form submission started', { values });
    setLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      if (!currentUser) {
        throw new Error('Nie jesteś zalogowany');
      }

      if (currentUser.role !== 'admin') {
        throw new Error('Nie masz uprawnień administratora');
      }

      let coverImageUrl = initialPost?.coverImage || '';
      if (coverImageFile) {
        const imageRef = ref(storage, `blog_images/${Date.now()}_${coverImageFile.name}`);
        const snapshot = await uploadBytes(imageRef, coverImageFile);
        coverImageUrl = await getDownloadURL(snapshot.ref);
      }

      const postData = {
        title: values.title,
        slug: values.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content: values.content,
        excerpt: values.excerpt,
        categories: values.categories,
        tags: values.tags || [],
        coverImage: coverImageUrl,
        publishedAt: initialPost?.publishedAt || new Date(),
        updatedAt: new Date(),
        author: {
          id: currentUser?.uid || '',
          name: currentUser?.displayName || 'Administrator',
          avatar: '',
          bio: ''
        },
        seo: {
          title: values.seoTitle || values.title,
          description: values.seoDescription || values.excerpt,
          keywords: values.tags || []
        }
      };

      if (initialPost?.id) {
        await updateDoc(doc(db, 'blog_posts', initialPost.id), postData);
      } else {
        await addDoc(collection(db, 'blog_posts'), postData);
      }

      setFormSuccess('Post saved successfully');
      onSave();
    } catch (error) {
      console.error('Error saving post:', error);
      setFormError(error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania wpisu');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const initialValues: BlogFormValues = {
    title: initialPost?.title || '',
    content: initialPost?.content || '',
    excerpt: initialPost?.excerpt || '',
    categories: initialPost?.categories || [],
    tags: initialPost?.tags || [],
    seoTitle: initialPost?.seo?.title || '',
    seoDescription: initialPost?.seo?.description || '',
    coverImage: null
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">
        {initialPost ? 'Edytuj wpis na blogu' : 'Dodaj nowy wpis na blogu'}
      </h2>

      {formError && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
          {formSuccess}
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={BlogPostSchema}
        onSubmit={handleFormSubmit}
      >
        {({ errors, touched, isSubmitting, values }) => (
          <Form className="space-y-6">
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Debug Info:</p>
              <p>User authenticated: {currentUser ? 'Yes' : 'No'}</p>
              <p>User role: {currentUser?.role || 'Not set'}</p>
              <p>Form errors: {Object.keys(errors).length > 0 ? JSON.stringify(errors) : 'None'}</p>
              <p>Current values: {JSON.stringify(values)}</p>
            </div>

            <div>
              <label htmlFor="title" className="block mb-2">Tytuł</label>
              <Field
                name="title"
                className="w-full p-2 border rounded"
              />
              {touched.title && errors.title && (
                <div className="text-red-500 text-sm mt-1">{errors.title}</div>
              )}
            </div>

            <div>
              <label htmlFor="content" className="block mb-2">Treść</label>
              <Field
                name="content"
                as="textarea"
                rows={10}
                className="w-full p-2 border rounded"
              />
              {touched.content && errors.content && (
                <div className="text-red-500 text-sm mt-1">{errors.content}</div>
              )}
            </div>

            <div>
              <label htmlFor="excerpt" className="block mb-2">Krótki opis</label>
              <Field
                name="excerpt"
                as="textarea"
                rows={3}
                className="w-full p-2 border rounded"
              />
              {touched.excerpt && errors.excerpt && (
                <div className="text-red-500 text-sm mt-1">{errors.excerpt}</div>
              )}
            </div>

            <div>
              <label className="block mb-2">Kategorie</label>
              <div className="space-y-2">
                {categories.map(category => (
                  <label key={category} className="flex items-center">
                    <Field
                      type="checkbox"
                      name="categories"
                      value={category}
                      className="mr-2"
                    />
                    {category}
                  </label>
                ))}
              </div>
              {touched.categories && errors.categories && (
                <div className="text-red-500 text-sm mt-1">{errors.categories}</div>
              )}
            </div>

            <div>
              <label htmlFor="tags" className="block mb-2">Tagi (oddziel przecinkami)</label>
              <Field name="tags">
                {({ field, form }: any) => (
                  <input
                    type="text"
                    placeholder="np. ratownictwo, pierwsza pomoc"
                    value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(Boolean);
                      form.setFieldValue('tags', tags);
                    }}
                    className="w-full p-2 border rounded"
                  />
                )}
              </Field>
            </div>

            <div>
              <label htmlFor="coverImage" className="block mb-2">Obrazek</label>
              <input
                type="file"
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
                accept="image/*"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 max-h-48" />
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">SEO</h3>
              <div>
                <label htmlFor="seoTitle" className="block mb-2">Tytuł SEO</label>
                <Field
                  name="seoTitle"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="seoDescription" className="block mb-2">Opis SEO</label>
                <Field
                  name="seoDescription"
                  as="textarea"
                  rows={2}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                disabled={isSubmitting || loading}
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className={`px-4 py-2 rounded text-white ${
                  isSubmitting || loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading || isSubmitting ? (
                  <span>Zapisywanie...</span>
                ) : initialPost ? (
                  'Aktualizuj wpis'
                ) : (
                  'Dodaj wpis'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BlogForm;