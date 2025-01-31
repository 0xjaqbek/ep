import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Breadcrumbs = () => {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);
  
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex">
        <li><Link to="/">Strona główna</Link></li>
        {paths.map((path, i) => (
          <React.Fragment key={path}>
            <li className="mx-2">/</li>
            <li>
              <Link to={`/${paths.slice(0, i + 1).join('/')}`}>
                {path.charAt(0).toUpperCase() + path.slice(1)}
              </Link>
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};