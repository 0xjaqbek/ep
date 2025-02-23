// src/types/blog.ts
export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImage?: string;
    publishedAt: Date;
    updatedAt: Date;
    categories: string[];
    tags: string[];
    author: {
      id: string;
      name: string;
      avatar: string;
      bio: string;
    };
    seo?: {
      title?: string;
      description?: string;
      keywords?: string[];
    };
  }
  
  export interface BlogFormValues {
    title: string;
    content: string;
    excerpt: string;
    categories: string[];
    tags: string[];
    seoTitle: string;
    seoDescription: string;
    coverImage: File | null;
  }
  
  export interface BlogFormProps {
    initialPost?: BlogPost | null;
    onSave: () => void;
    onCancel: () => void;
  }