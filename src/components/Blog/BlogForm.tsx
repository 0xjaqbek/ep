import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config.ts';

// Validation Schema
const BlogPostSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  content: Yup.string()
    .required('Content is required')
    .min(50, 'Content must be at least 50 characters'),
  excerpt: Yup.string()
    .required('Excerpt is required')
    .max(300, 'Excerpt must be less than 300 characters'),
  categories: Yup.array()
    .of(Yup.string())
    .min(1, 'Select at least one category'),
  tags: Yup.array()
    .of(Yup.string()),
  seoTitle: Yup.string(),
  seoDescription: Yup.string()
});

const CATEGORIES = [
  'Medical Emergency',
  'First Aid',
  'Training',
  'Tips',
  'Education'
];

interface BlogFormProps {
  initialPost?: {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    categories: string[];
    tags: string[];
    seoTitle?: string;
    seoDescription?: string;
    coverImage?: string;
    publishedAt?: Date;
    updatedAt?: Date;
    author?: {
      id: string;
      name: string;
      avatar: string;
      bio: string;
    };
    seo?: {
      title?: string;
      description?: string;
      keywords?: string[];
    };
  } | null;
  onSave: () => void;
  onCancel: () => void;
}

const BlogForm: React.FC<BlogFormProps> = ({ initialPost, onSave, onCancel }) => {
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialPost?.coverImage || null
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
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

      onSave();
    } catch (error) {
      console.error('Error saving blog post:', error);
      setSubmitError(error instanceof Error ? error.message : 'Error saving post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">
        {initialPost ? 'Edit Blog Post' : 'Create New Blog Post'}
      </h2>

      {submitError && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {submitError}
        </div>
      )}

      <Formik
        initialValues={{
          title: initialPost?.title || '',
          content: initialPost?.content || '',
          excerpt: initialPost?.excerpt || '',
          categories: initialPost?.categories || [],
          tags: initialPost?.tags || [],
          seoTitle: initialPost?.seoTitle || '',
          seoDescription: initialPost?.seoDescription || ''
        }}
        validationSchema={BlogPostSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, values, setFieldValue }) => (
          <Form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Field
                name="title"
                className="w-full p-2 border rounded-lg"
                placeholder="Enter post title"
              />
              {touched.title && errors.title && (
                <div className="text-red-600 text-sm mt-1">{errors.title}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <Field
                name="content"
                as="textarea"
                rows={10}
                className="w-full p-2 border rounded-lg"
                placeholder="Write your post content"
              />
              {touched.content && errors.content && (
                <div className="text-red-600 text-sm mt-1">{errors.content}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Excerpt</label>
              <Field
                name="excerpt"
                as="textarea"
                rows={3}
                className="w-full p-2 border rounded-lg"
                placeholder="Write a brief excerpt"
              />
              {touched.excerpt && errors.excerpt && (
                <div className="text-red-600 text-sm mt-1">{errors.excerpt}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Categories</label>
              <div className="space-y-2">
                {CATEGORIES.map(category => (
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
                <div className="text-red-600 text-sm mt-1">{errors.categories}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <Field name="tags">
                {({ field }: any) => (
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter tags separated by commas"
                    value={field.value.join(', ')}
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(Boolean);
                      setFieldValue('tags', tags);
                    }}
                  />
                )}
              </Field>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cover Image</label>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full p-2 border rounded-lg"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 max-h-48 rounded-lg"
                />
              )}
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">SEO Title</label>
                  <Field
                    name="seoTitle"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter SEO title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">SEO Description</label>
                  <Field
                    name="seoDescription"
                    as="textarea"
                    rows={2}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter SEO description"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? 'Saving...' : initialPost ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BlogForm;