import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost as BlogPostType } from '../../types';

interface BlogPostProps {
  post: BlogPostType;
  isPreview?: boolean;
}

const BlogPost: React.FC<BlogPostProps> = ({ post, isPreview = false }) => {
  const content = isPreview ? post.excerpt : post.content;
  
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      {post.coverImage && (
        <img 
          src={post.coverImage}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <header className="mb-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <time dateTime={post.publishedAt.toISOString()}>
              {post.publishedAt.toLocaleDateString('pl-PL')}
            </time>
            <span className="mx-2">•</span>
            {post.categories.map((category, index) => (
              <React.Fragment key={category}>
                <Link 
                  to={`/blog/category/${category}`}
                  className="hover:text-blue-600"
                >
                  {category}
                </Link>
                {index < post.categories.length - 1 && ', '}
              </React.Fragment>
            ))}
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {isPreview ? (
              <Link to={`/blog/${post.slug}`} className="hover:text-blue-600">
                {post.title}
              </Link>
            ) : (
              post.title
            )}
          </h2>
        </header>
        
        <div className="prose max-w-none">
          {content}
        </div>
        
        {isPreview && (
          <div className="mt-4">
            <Link 
              to={`/blog/${post.slug}`}
              className="text-blue-600 hover:text-blue-800"
            >
              Czytaj więcej →
            </Link>
          </div>
        )}
        
        {!isPreview && (
          <footer className="mt-6 pt-6 border-t">
            <div className="flex items-center">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {post.author.name}
                </p>
                <p className="text-sm text-gray-500">
                  {post.author.bio}
                </p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </article>
  );
};

export default BlogPost;