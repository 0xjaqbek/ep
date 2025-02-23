// src/components/Admin/BlogPostView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { BlogPost } from '../../types/blog.ts';
import { PrivateRoute } from '../Auth/PrivateRoute.tsx';

export const BlogPostView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError('Nie podano identyfikatora wpisu');
        setLoading(false);
        return;
      }

      try {
        const postRef = doc(db, 'blog_posts', id);
        const postDoc = await getDoc(postRef);

        if (postDoc.exists()) {
          const postData = {
            id: postDoc.id,
            ...postDoc.data(),
            publishedAt: postDoc.data().publishedAt.toDate(),
            updatedAt: postDoc.data().updatedAt?.toDate()
          } as BlogPost;

          setPost(postData);
        } else {
          setError('Nie znaleziono wpisu o podanym identyfikatorze');
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Wystąpił błąd podczas ładowania wpisu');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        {error}
        <button 
          onClick={() => navigate('/admin/blog-posts')}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Wróć do listy wpisów
        </button>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <PrivateRoute requiredRole="admin">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            <div className="flex justify-between items-center text-gray-600">
              <div>
                <span>Autor: {post.author.name}</span>
                <span className="mx-2">•</span>
                <span>
                  Opublikowano: {post.publishedAt.toLocaleDateString()}
                </span>
                {post.updatedAt && (
                  <>
                    <span className="mx-2">•</span>
                    <span>
                      Zaktualizowano: {post.updatedAt.toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="w-full h-96 overflow-hidden">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content Section */}
          <div className="p-6">
            <div className="prose max-w-none">
              {/* Excerpt */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
                <p className="italic text-gray-700">{post.excerpt}</p>
              </div>

              {/* Main Content */}
              <div 
                dangerouslySetInnerHTML={{ __html: post.content }} 
                className="mb-6"
              />

              {/* Metadata */}
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-semibold mb-2">Kategorie</h4>
                    <div className="flex space-x-2">
                      {post.categories.map((category) => (
                        <span 
                          key={category} 
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Tagi</h4>
                      <div className="flex space-x-2">
                        {post.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Details */}
              {post.seo && (
                <div className="bg-gray-50 p-4 rounded-lg mt-6">
                  <h4 className="font-semibold mb-2">Informacje SEO</h4>
                  {post.seo.title && (
                    <p>
                      <strong>Tytuł SEO:</strong> {post.seo.title}
                    </p>
                  )}
                  {post.seo.description && (
                    <p>
                      <strong>Opis SEO:</strong> {post.seo.description}
                    </p>
                  )}
                  {post.seo.keywords && post.seo.keywords.length > 0 && (
                    <p>
                      <strong>Słowa kluczowe:</strong> {post.seo.keywords.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t flex justify-between">
            <button
              onClick={() => navigate(`/admin/blog-posts/edit/${post.id}`)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edytuj wpis
            </button>
            <button
              onClick={() => navigate('/admin/blog-posts')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Wróć do listy wpisów
            </button>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
};

export default BlogPostView;