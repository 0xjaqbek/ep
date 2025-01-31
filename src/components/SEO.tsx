import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = 'Platforma edukacyjna dla zawodów medycznych. Zdobywaj wiedzę i punkty edukacyjne online.',
  canonicalUrl = window.location.href,
  keywords = 'kursy medyczne, ratownictwo medyczne, edukacja medyczna, punkty edukacyjne',
  ogImage = '/logo.png',
  ogType = 'website'
}) => {
  const siteName = 'Progres999';
  const fullTitle = `${title} | ${siteName}`;

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
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter Card metadata */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO-friendly meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Polish" />
      <meta charSet="UTF-8" />
      <html lang="pl" />
    </Helmet>
  );
};

export default SEO;