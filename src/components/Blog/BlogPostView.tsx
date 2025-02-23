import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { BlogPost as BlogPostType } from '../../types';
import  BlogPost  from './BlogPost.tsx';
import  SEO  from '../SEO.tsx';

const BlogPostView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'blog_posts', slug!);
        const postDoc = await getDoc(postRef);
        
        if (postDoc.exists()) {
          setPost({
            id: postDoc.id,
            ...postDoc.data(),
            publishedAt: postDoc.data().publishedAt.toDate()
          } as BlogPostType);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">
          Nie znaleziono artykułu
        </h2>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={post.title}
        description={post.excerpt}
        ogImage={post.coverImage}
        ogType="article"
      />
      <BlogPost post={post} />
    </>
  );
};

export default BlogPostView;