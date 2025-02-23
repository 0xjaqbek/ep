  
  // src/components/DomainRouter.tsx
  import React from 'react';
  import { isBlogDomain } from '../utils/domainHandler.ts';
  import BlogLayout from '../components/Blog/BlogLayout.tsx';
  import LazyLoadedRoutes from '../components/LazyLoadedRoutes.tsx';
  
  const DomainRouter: React.FC = () => {
    if (isBlogDomain()) {
      return <BlogLayout />;
    }
  
    return <LazyLoadedRoutes />;
  };
  
  export default DomainRouter;