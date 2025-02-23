// src/components/Blog/BlogLayout.tsx
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import  SEO  from '../SEO.tsx';
import { LoadingSpinner } from '../Loading/LoadingSpinner.tsx';
import BlogHeader from './BlogHeader.tsx';

const BlogList = React.lazy(() => import('./BlogList.tsx'));
const BlogPostView = React.lazy(() => import('./BlogPostView.tsx'));

const BlogLayout: React.FC = () => {
  return (
    <>
      <SEO 
        title="Blog - Progres999"
        description="Blog o ratownictwie medycznym, pierwszej pomocy i rozwoju zawodowym."
      />
      <BlogHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog Progres999</h1>
          <p className="mt-2 text-lg text-gray-600">
            Najnowsze artykuły o ratownictwie medycznym i pierwszej pomocy
          </p>
        </header>
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" />
          </div>
        }>
          <Routes>
            <Route index element={<BlogList />} />
            <Route path=":slug" element={<BlogPostView />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
};

export default BlogLayout;