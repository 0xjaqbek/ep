import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'course';
  ogLocale?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleTags?: string[];
  courseProvider?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = 'Platforma edukacyjna dla ratowników medycznych. Zdobywaj wiedzę i punkty edukacyjne online.',
  canonicalUrl = window.location.href,
  keywords = 'kursy medyczne,ratownik medyczny, ratownictwo medyczne, edukacja medyczna, punkty edukacyjne',
  ogImage = '/logo.png',
  ogType = 'website',
  ogLocale = 'pl_PL',
  articlePublishedTime,
  articleModifiedTime,
  articleTags,
  courseProvider = 'Progres999'
}) => {
  const siteName = 'Progres999';
  const fullTitle = `${title} | ${siteName}`;
  const absoluteImageUrl = ogImage.startsWith('http') 
    ? ogImage 
    : `https://progres999.pl${ogImage}`;

  return (
    <Helmet>
      {/* Basic metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph metadata */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content={ogLocale} />
      
      {/* Article specific tags */}
      {ogType === 'article' && articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {ogType === 'article' && articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}
      {ogType === 'article' && articleTags?.map(tag => (
        <meta property="article:tag" content={tag} key={tag} />
      ))}
      
      {/* Course specific tags */}
      {ogType === 'course' && (
        <meta property="course:provider" content={courseProvider} />
      )}
      
      {/* Twitter Card metadata */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      
      {/* Additional SEO-friendly meta tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="language" content="Polish" />
      <meta charSet="UTF-8" />
      <html lang="pl" />
    </Helmet>
  );
};

export default SEO;