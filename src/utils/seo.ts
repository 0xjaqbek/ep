export const getCanonicalUrl = (path: string) => `https://progres999.pl${path}`;

export const generateMetaDescription = (text: string) => 
  text.substring(0, 155).trim() + '...';

export const generateImageAlt = (title: string, description: string) =>
  `Kurs ${title} - ${description.slice(0, 100)}`;