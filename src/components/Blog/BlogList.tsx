import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { BlogPost as BlogPostType } from '../../types';
import  BlogPost  from './BlogPost.tsx';

const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRef = collection(db, 'blog_posts');
        const q = query(postsRef, orderBy('publishedAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          publishedAt: doc.data().publishedAt.toDate()
        })) as BlogPostType[];
        
        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {posts.map(post => (
        <BlogPost key={post.id} post={post} isPreview />
      ))}
    </div>
  );
};

export default BlogList;