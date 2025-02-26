import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export const Breadcrumbs = () => {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);
  
  // Create breadcrumb items
  const breadcrumbs = paths.map((path, i) => {
    const url = `/${paths.slice(0, i + 1).join('/')}`;
    const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
    return { url, label };
  });
  
  // Prepare breadcrumb JSON-LD
  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Strona główna',
        'item': 'https://progres999.pl'
      },
      ...breadcrumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        'position': i + 2,
        'name': crumb.label,
        'item': `https://progres999.pl${crumb.url}`
      }))
    ]
  };
  
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbsJsonLd)}
        </script>
      </Helmet>
      
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center">
          <li>
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Strona główna
            </Link>
          </li>
          
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.url}>
              <li className="mx-2 text-gray-500">/</li>
              <li>
                <Link 
                  to={crumb.url}
                  className="text-blue-600 hover:text-blue-800"
                  aria-current={i === breadcrumbs.length - 1 ? "page" : undefined}
                >
                  {crumb.label}
                </Link>
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>
    </>
  );
};