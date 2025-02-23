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
  
  export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
  }
  
  export interface BlogTag {
    id: string;
    name: string;
    slug: string;
  }
  
  export interface BlogAuthor {
    id: string;
    name: string;
    email: string;
    avatar: string;
    bio: string;
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      facebook?: string;
    };
  }