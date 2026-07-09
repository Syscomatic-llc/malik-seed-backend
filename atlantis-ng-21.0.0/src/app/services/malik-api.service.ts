import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export const API_BASE_URL = environment.apiBaseUrl;

// ============ HOMEPAGE TYPES ============
export interface HeroSlide {
  id?: number;
  title: string;
  subtitle?: string;
  description?: string;
  background_image?: string;
  background_video?: string;
  mobile_image?: string;
  primary_cta_text?: string;
  primary_cta_link?: string;
  secondary_cta_text?: string;
  secondary_cta_link?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface HomepageAbout {
  id?: number;
  title: string;
  subtitle?: string;
  description: string;
  image_url?: string;
  video_url?: string;
  gallery_images?: string[];
  stats?: any[];
  cta_text?: string;
  cta_link?: string;
}

export interface HomepageService {
  id?: number;
  title: string;
  description?: string;
  icon?: string;
  image_url?: string;
  link?: string;
  sort_order?: number;
}

export interface HomepageTestimonial {
  id?: number;
  name: string;
  designation?: string;
  company?: string;
  content: string;
  avatar_url?: string;
  rating?: number;
  sort_order?: number;
}

export interface HomepageTimeline {
  id?: number;
  year: string;
  title: string;
  description?: string;
  image_url?: string;
  gallery_images?: string[];
  is_milestone?: boolean;
  sort_order?: number;
}

export interface HomepageNewsItem {
  id?: number;
  title: string;
  excerpt?: string;
  image_url?: string;
  category?: string;
  display_date?: string;
  sort_order?: number;
}

export interface HomepageCTABanner {
  id?: number;
  title: string;
  subtitle?: string;
  description?: string;
  background_image?: string;
  cta_text?: string;
  cta_link?: string;
}

export interface HomepageBrand {
  id?: number;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  short_description?: string;
  logo_url?: string;
  image_url?: string;
  hover_image_url?: string;
  link?: string;
  category?: string;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
}

export interface HomepagePartner {
  id?: number;
  name: string;
  logo_url?: string;
  logo_white_url?: string;
  website_url?: string;
  is_active?: boolean;
  sort_order?: number;
}

// ============ OUR STORY TYPES ============
export interface OurStoryHero {
  id?: number;
  title: string;
  subtitle?: string;
  description?: string;
  background_image?: string;
}

export interface OurStoryMission {
  id?: number;
  title: string;
  description: string;
  image_url?: string;
}

export interface OurStoryValue {
  id?: number;
  title: string;
  description?: string;
  icon?: string;
  image_url?: string;
  sort_order?: number;
}

export interface OurStoryTimeline {
  id?: number;
  year: string;
  title: string;
  description?: string;
  image_url?: string;
  is_milestone?: boolean;
  sort_order?: number;
}

// ============ OUR BRANDS TYPES ============
export interface OurBrand {
  id?: number;
  name: string;
  slug: string;
  category: string;
  tagline?: string;
  description?: string;
  logo_url?: string;
  image_url?: string;
  is_featured?: boolean;
  sort_order?: number;
}

// ============ GALLERY TYPES ============
export interface GalleryItem {
  id?: number;
  title: string;
  description?: string;
  image_url: string;
  category: string;
  is_featured?: boolean;
  sort_order?: number;
}

export interface GalleryCategory {
  id?: number;
  name: string;
  slug: string;
  description?: string;
}

// ============ HIRING TYPES ============
export interface JobPosition {
  id?: number;
  title: string;
  slug: string;
  department: string;
  job_type: string;
  location: string;
  description: string;
  short_description?: string;
  requirements?: string[];
  responsibilities?: string[];
  skills_required?: string[];
  experience_required?: string;
  is_active?: boolean;
}

export interface CareerBenefit {
  id?: number;
  title: string;
  description?: string;
  icon?: string;
}

export interface HiringTestimonial {
  id?: number;
  name: string;
  designation?: string;
  department?: string;
  content: string;
}

// ============ CONTACT TYPES ============
export interface ContactInfo {
  id?: number;
  title: string;
  description?: string;
  address?: string;
  phone_primary?: string;
  email_primary?: string;
  facebook_url?: string;
  instagram_url?: string;
}

export interface OfficeLocation {
  id?: number;
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  is_headquarters?: boolean;
}

export interface FAQ {
  id?: number;
  question: string;
  answer: string;
  category?: string;
}

// ============ NEWS TYPES ============
export interface NewsArticle {
  id?: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  category: string;
  author_name?: string;
  is_published?: boolean;
  published_at?: string;
}

export interface NewsCategory {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  icon?: string;
  is_active?: boolean;
  sort_order?: number;
  article_count?: number;
}

// ============ AUTH TYPES ============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data?: {
    token?: string;
    user?: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MalikApiService {
  private apiUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  // ============ AUTH ============
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  getMe(token: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/auth/me?token=${token}`);
  }

  // ============ HOMEPAGE ============
  getHeroSlides(): Observable<HeroSlide[]> {
    return this.http.get<HeroSlide[]>(`${this.apiUrl}/homepage/hero`);
  }

  getAbout(): Observable<HomepageAbout> {
    return this.http.get<HomepageAbout>(`${this.apiUrl}/homepage/about`);
  }

  getServices(): Observable<HomepageService[]> {
    return this.http.get<HomepageService[]>(`${this.apiUrl}/homepage/services`);
  }

  getTestimonials(): Observable<HomepageTestimonial[]> {
    return this.http.get<HomepageTestimonial[]>(`${this.apiUrl}/homepage/testimonials`);
  }

  getTimeline(): Observable<HomepageTimeline[]> {
    return this.http.get<HomepageTimeline[]>(`${this.apiUrl}/homepage/timeline`);
  }

  getNewsItems(): Observable<HomepageNewsItem[]> {
    return this.http.get<HomepageNewsItem[]>(`${this.apiUrl}/homepage/news`);
  }

  getCTABanners(): Observable<HomepageCTABanner[]> {
    return this.http.get<HomepageCTABanner[]>(`${this.apiUrl}/homepage/cta-banners`);
  }

  getHomepageBrands(): Observable<HomepageBrand[]> {
    return this.http.get<HomepageBrand[]>(`${this.apiUrl}/homepage/brands`);
  }

  getPartners(): Observable<HomepagePartner[]> {
    return this.http.get<HomepagePartner[]>(`${this.apiUrl}/homepage/partners`);
  }

  getBrandCategories(): Observable<{ label: string; value: string }[]> {
    return this.http.get<{ label: string; value: string }[]>(`${this.apiUrl}/our-brands/categories`);
  }

  // ============ OUR STORY ============
  getStoryHero(): Observable<OurStoryHero> {
    return this.http.get<OurStoryHero>(`${this.apiUrl}/our-story/hero`);
  }

  getMission(): Observable<OurStoryMission> {
    return this.http.get<OurStoryMission>(`${this.apiUrl}/our-story/mission`);
  }

  getValues(): Observable<OurStoryValue[]> {
    return this.http.get<OurStoryValue[]>(`${this.apiUrl}/our-story/values`);
  }

  getStoryTimeline(): Observable<OurStoryTimeline[]> {
    return this.http.get<OurStoryTimeline[]>(`${this.apiUrl}/our-story/timeline`);
  }

  // ============ OUR BRANDS ============
  getBrands(): Observable<OurBrand[]> {
    return this.http.get<OurBrand[]>(`${this.apiUrl}/our-brands/brands`);
  }

  getBrandBySlug(slug: string): Observable<OurBrand> {
    return this.http.get<OurBrand>(`${this.apiUrl}/our-brands/brands/${slug}`);
  }

  // ============ GALLERY ============
  getGalleryItems(): Observable<GalleryItem[]> {
    return this.http.get<GalleryItem[]>(`${this.apiUrl}/our-gallery/items`);
  }

  getGalleryCategories(): Observable<GalleryCategory[]> {
    return this.http.get<GalleryCategory[]>(`${this.apiUrl}/our-gallery/categories`);
  }

  // ============ HIRING ============
  getJobPositions(): Observable<JobPosition[]> {
    return this.http.get<JobPosition[]>(`${this.apiUrl}/hiring/positions`);
  }

  getBenefits(): Observable<CareerBenefit[]> {
    return this.http.get<CareerBenefit[]>(`${this.apiUrl}/hiring/benefits`);
  }

  getHiringTestimonials(): Observable<HiringTestimonial[]> {
    return this.http.get<HiringTestimonial[]>(`${this.apiUrl}/hiring/testimonials`);
  }

  // ============ CONTACT ============
  getContactInfo(): Observable<ContactInfo> {
    return this.http.get<ContactInfo>(`${this.apiUrl}/contact/info`);
  }

  getLocations(): Observable<OfficeLocation[]> {
    return this.http.get<OfficeLocation[]>(`${this.apiUrl}/contact/locations`);
  }

  getFAQs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(`${this.apiUrl}/contact/faqs`);
  }

  // ============ NEWS ============
  getArticles(): Observable<NewsArticle[]> {
    return this.http.get<NewsArticle[]>(`${this.apiUrl}/news/articles`);
  }

  getArticleBySlug(slug: string): Observable<NewsArticle> {
    return this.http.get<NewsArticle>(`${this.apiUrl}/news/articles/${slug}`);
  }

  getNewsCategories(): Observable<NewsCategory[]> {
    return this.http.get<NewsCategory[]>(`${this.apiUrl}/news/categories`);
  }

  // ============ FILE UPLOAD ============
  uploadImage(file: File, folder: string = 'general'): Observable<{ status: string; url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return this.http.post<{ status: string; url: string; filename: string }>(`${this.apiUrl}/admin/upload/image`, formData);
  }

  // ============ ADMIN CRUD HELPERS ============
  adminList(resource: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/${resource}`);
  }

  adminGet(resource: string, id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/${resource}/${id}`);
  }

  adminCreate(resource: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/${resource}`, data);
  }

  adminUpdate(resource: string, id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/${resource}/${id}`, data);
  }

  adminDelete(resource: string, id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/${resource}/${id}`);
  }

  // ============ ASSESSMENT QUESTIONS ============
  getAssessmentQuestions(positionId: number): Observable<{ position_id: number; position_title: string; questions: any[] }> {
    return this.http.get<any>(`${this.apiUrl}/admin/hiring/positions/${positionId}/questions`);
  }

  createAssessmentQuestion(positionId: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/hiring/positions/${positionId}/questions`, data);
  }

  updateAssessmentQuestion(positionId: number, questionId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/hiring/positions/${positionId}/questions/${questionId}`, data);
  }

  deleteAssessmentQuestion(positionId: number, questionId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/hiring/positions/${positionId}/questions/${questionId}`);
  }
}
