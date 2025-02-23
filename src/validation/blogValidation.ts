// src/validation/blogValidation.ts
import * as Yup from 'yup';

export const BlogPostSchema = Yup.object().shape({
  title: Yup.string()
    .required('Tytuł jest wymagany')
    .min(5, 'Tytuł musi mieć co najmniej 5 znaków')
    .max(100, 'Tytuł nie może być dłuższy niż 100 znaków'),
  
  content: Yup.string()
    .required('Treść jest wymagana')
    .min(50, 'Treść musi mieć co najmniej 50 znaków'),
  
  excerpt: Yup.string()
    .required('Krótki opis jest wymagany')
    .max(300, 'Krótki opis nie może być dłuższy niż 300 znaków'),
  
  categories: Yup.array()
    .of(Yup.string())
    .min(1, 'Wybierz co najmniej jedną kategorię'),
  
  tags: Yup.array()
    .of(Yup.string())
    .nullable(),
  
  seoTitle: Yup.string().optional(),
  seoDescription: Yup.string().optional(),
  coverImage: Yup.mixed().optional()
});

export const categories = [
  'Ratownictwo medyczne', 
  'Pierwsza pomoc', 
  'Szkolenia', 
  'Porady', 
  'Edukacja'
];