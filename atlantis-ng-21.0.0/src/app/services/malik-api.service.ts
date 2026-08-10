import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export const API_BASE_URL = environment.apiBaseUrl;

// ============ HOMEPAGE TYPES ============
export interface HeroSlide {
  id?: number;
  title: string;
  description?: string;
  background_image?: string;
  background_video?: string;
  mobile_image?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface HeroCTAButton {
  type: 'primary' | 'secondary';
  text: string;
  link: string;
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
  icon?: string;
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
  background_images: string[];
}

export interface OurStoryMission {
  id?: number;
  title: string;
  description: string;
  vision_title?: string;
  vision_description?: string;
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
  gallery_images?: string[];
  is_milestone?: boolean;
  sort_order?: number;
}

// ============ OUR BRANDS TYPES ============
export interface OurBrand {
  id?: number;
  name: string;
  slug: string;
  category?: string;
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
  title?: string;
  description?: string;
  image_url: string;
  category?: string;
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
  details_pdf_url?: string;
  is_active?: boolean;
  has_assessment?: boolean;
  assessment_duration?: number;
  mcq_duration?: number;
  short_answer_duration?: number;
  long_answer_duration?: number;
  passing_score?: number;
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
  avatar_url?: string;
  sort_order?: number;
}

export interface HiringPageContent {
  id?: number;
  hero_title?: string;
  hero_subtitle?: string;
  hero_badge?: string;
  hero_description?: string;
  hero_background_image?: string;
  hero_video_url?: string;
  stats?: any[];
  initiative_title?: string;
  initiative_description?: string;
  initiative_image?: string;
  cta_title?: string;
  cta_description?: string;
  cta_button_text?: string;
  cta_button_link?: string;
  is_active?: boolean;
}

export interface ResumeUpload {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  message?: string;
  filename?: string;
  file_url?: string;
  file_size?: number;
  is_reviewed?: boolean;
  resume_type?: 'open_position' | 'future_leader' | 'general';
  position_id?: number;
  position_name?: string;
  applicant_name?: string;
  current_location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  source?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AssessmentSubmission {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  position_id?: number;
  position_title?: string;
  assessment_score?: number;
  assessment_submitted_at?: string;
  status?: string;
}

export interface AssessmentSubmissionQuestion {
  id: number;
  question_type: string;
  question: string;
  options?: string[];
  correct_answer?: string;
  applicant_answer?: string;
  marks: number;
  earned_marks?: number;
  is_correct?: boolean | null;
}

export interface AssessmentSubmissionDetail extends AssessmentSubmission {
  passing_score?: number;
  total_questions?: number;
  mcq_score?: string;
  total_marks?: number;
  earned_marks?: number;
  questions?: AssessmentSubmissionQuestion[];
}

export interface JobApplication {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  current_location?: string;
  position_id?: number;
  position_title?: string;
  resume_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  source?: string[];
  status?: string;
  assessment_score?: number | null;
  assessment_submitted_at?: string;
  submitted_at?: string;
  created_at?: string;
  education?: any[];
  skills?: any[];
  experience_years?: number;
  current_company?: string;
  current_designation?: string;
  expected_salary?: string;
  why_join?: string;
  additional_info?: string;
  admin_notes?: string;
  interview_date?: string;
}

// ============ CONTACT TYPES ============
export interface ContactInfo {
  id?: number;
  title: string;
  description?: string;
  footer_description?: string;
  address?: string;
  phone_primary?: string;
  email_primary?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  subject_options?: string[];
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

export interface ContactMessage {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  inquiry_type?: string;
  is_read?: boolean;
  is_replied?: boolean;
  created_at?: string;
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
  author_title?: string;
  author_avatar?: string;
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

// ============ SITE SETTINGS / SEO / USERS ============
export interface SiteSettings {
  id?: number;
  site_name?: string;
  site_tagline?: string;
  site_description?: string;
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  google_analytics_id?: string;
  google_search_console_verification?: string;
  hero_primary_cta_text?: string;
  hero_primary_cta_link?: string;
  footer_text?: string;
  copyright_text?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  maintenance_mode?: boolean;
}

export interface PageSEO {
  id?: number;
  page_path: string;
  title?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  is_active?: boolean;
}

export interface Sitemap {
  id?: number;
  url_path: string;
  last_modified?: string;
  changefreq?: string;
  priority?: string;
  is_active?: boolean;
}

export interface ActivityLog {
  id?: number;
  user_id?: number;
  user_email?: string;
  action: string;
  resource_type?: string;
  resource_id?: number;
  resource_name?: string;
  details?: any;
  created_at?: string;
}

export interface CMSUser {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  email_verified?: boolean;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
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

  getMe(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/auth/me`);
  }

  // ============ HOMEPAGE ============
  getHeroSlides(): Observable<{ slides: HeroSlide[]; cta_buttons: HeroCTAButton[] }> {
    return this.http.get<{ slides: HeroSlide[]; cta_buttons: HeroCTAButton[] }>(`${this.apiUrl}/homepage/hero`);
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

  uploadPublicCV(formData: FormData): Observable<{ status: string; message: string; id: number; url: string; filename: string }> {
    return this.http.post<{ status: string; message: string; id: number; url: string; filename: string }>(`${this.apiUrl}/hiring/upload-cv`, formData);
  }

  // Generic reorder for any sortable admin resource
  reorder(resource: string, order: number[]): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/admin/${resource}/reorder`, order);
  }

  // ============ RESUME MANAGEMENT ============
  getResumes(resumeType?: string): Observable<ResumeUpload[]> {
    let params = new HttpParams();
    if (resumeType) {
      params = params.set('resume_type', resumeType);
    }
    return this.http.get<ResumeUpload[]>(`${this.apiUrl}/admin/resume`, { params });
  }

  exportResumes(resumeType?: string): Observable<Blob> {
    let params = new HttpParams();
    if (resumeType) {
      params = params.set('resume_type', resumeType);
    }
    return this.http.get(`${this.apiUrl}/admin/resume/export`, { params, responseType: 'blob' });
  }

  downloadResumePDFs(ids: number[], resumeType?: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/admin/resume/download-pdfs`, { ids, resume_type: resumeType }, { responseType: 'blob' });
  }

  bulkDeleteResumes(ids: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/resume/bulk-delete`, { ids });
  }

  deleteResume(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/resume/${id}`);
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
  getArticles(page: number = 1, limit: number = 10, category?: string, featured?: boolean): Observable<{ items: NewsArticle[]; total: number; page: number; limit: number; pages: number; has_next: boolean; has_prev: boolean }> {
    let params: any = { page, limit };
    if (category) params.category = category;
    if (featured !== undefined) params.featured = featured;
    return this.http.get<{ items: NewsArticle[]; total: number; page: number; limit: number; pages: number; has_next: boolean; has_prev: boolean }>(`${this.apiUrl}/news/articles`, { params });
  }

  getArticleBySlug(slug: string): Observable<NewsArticle> {
    return this.http.get<NewsArticle>(`${this.apiUrl}/news/articles/${slug}`);
  }

  getNewsCategories(): Observable<NewsCategory[]> {
    return this.http.get<NewsCategory[]>(`${this.apiUrl}/news/categories`);
  }

  uploadFile(file: File, folder: string = 'files'): Observable<{ status: string; url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return this.http.post<{ status: string; url: string; filename: string }>(`${this.apiUrl}/admin/upload/file`, formData);
  }

  // ============ FILE UPLOAD ============
  uploadImage(file: File, folder: string = 'general', options?: { resize?: boolean; maxWidth?: number; maxHeight?: number; quality?: number }): Observable<{ status: string; url: string; filename: string; original_url?: string; resized?: boolean; width?: number; height?: number }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    if (options) {
      if (options.resize) formData.append('resize', 'true');
      if (options.maxWidth !== undefined) formData.append('max_width', options.maxWidth.toString());
      if (options.maxHeight !== undefined) formData.append('max_height', options.maxHeight.toString());
      if (options.quality !== undefined) formData.append('quality', options.quality.toString());
    }
    return this.http.post<{ status: string; url: string; filename: string; original_url?: string; resized?: boolean; width?: number; height?: number }>(`${this.apiUrl}/admin/upload/image`, formData);
  }

  uploadImageWithProgress(
    file: File,
    folder: string = 'general',
    options?: { resize?: boolean; maxWidth?: number; maxHeight?: number; quality?: number }
  ): Observable<HttpEvent<{ status: string; url: string; filename: string; original_url?: string; resized?: boolean; width?: number; height?: number }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    if (options) {
      if (options.resize) formData.append('resize', 'true');
      if (options.maxWidth !== undefined) formData.append('max_width', options.maxWidth.toString());
      if (options.maxHeight !== undefined) formData.append('max_height', options.maxHeight.toString());
      if (options.quality !== undefined) formData.append('quality', options.quality.toString());
    }
    return this.http.post<{ status: string; url: string; filename: string; original_url?: string; resized?: boolean; width?: number; height?: number }>(
      `${this.apiUrl}/admin/upload/image`,
      formData,
      { reportProgress: true, observe: 'events' }
    );
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

  reorderGalleryItems(order: number[]): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/admin/gallery-items/reorder`, order);
  }

  reorderOurStoryTimeline(order: number[]): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/admin/our-story-timeline/reorder`, order);
  }

  reorderHomepageTimeline(order: number[]): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/admin/homepage-timeline/reorder`, order);
  }

  reorderHomepageTestimonials(order: number[]): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/admin/homepage-testimonial/reorder`, order);
  }

  reorderHiringTestimonials(order: number[]): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/admin/hiring-testimonial/reorder`, order);
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

  // ============ ASSESSMENT SUBMISSIONS ============
  getAssessmentSubmissions(positionId?: number): Observable<AssessmentSubmission[]> {
    let params = new HttpParams();
    if (positionId) {
      params = params.set('position_id', positionId.toString());
    }
    return this.http.get<AssessmentSubmission[]>(`${this.apiUrl}/admin/hiring/assessment-submissions`, { params });
  }

  getAssessmentSubmission(id: number): Observable<AssessmentSubmissionDetail> {
    return this.http.get<AssessmentSubmissionDetail>(`${this.apiUrl}/admin/hiring/assessment-submissions/${id}`);
  }

  // ============ JOB APPLICATIONS ============
  getJobApplications(positionId?: number, search?: string): Observable<JobApplication[]> {
    let params = new HttpParams();
    if (positionId) params = params.set('position_id', positionId.toString());
    if (search) params = params.set('search', search);
    return this.http.get<JobApplication[]>(`${this.apiUrl}/admin/hiring/applications`, { params });
  }

  getJobApplication(id: number): Observable<JobApplication> {
    return this.http.get<JobApplication>(`${this.apiUrl}/admin/hiring/applications/${id}`);
  }

  updateJobApplicationStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/hiring/applications/${id}/status`, { status });
  }

  deleteJobApplication(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/hiring/applications/${id}`);
  }

  // ============ SITE SETTINGS / SEO / SITEMAP ============
  getPublicSiteSettings(): Observable<SiteSettings> {
    return this.http.get<SiteSettings>(`${this.apiUrl}/site-settings`);
  }

  getPageSEOList(): Observable<PageSEO[]> {
    return this.http.get<PageSEO[]>(`${this.apiUrl}/admin/page-seo`);
  }

  createPageSEO(data: PageSEO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/page-seo`, data);
  }

  updatePageSEO(id: number, data: PageSEO): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/page-seo/${id}`, data);
  }

  deletePageSEO(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/page-seo/${id}`);
  }

  getSitemapList(): Observable<Sitemap[]> {
    return this.http.get<Sitemap[]>(`${this.apiUrl}/admin/sitemap`);
  }

  createSitemap(data: Sitemap): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/sitemap`, data);
  }

  updateSitemap(id: number, data: Sitemap): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/sitemap/${id}`, data);
  }

  deleteSitemap(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/sitemap/${id}`);
  }

  // ============ ACTIVITY LOGS ============
  getActivityLogs(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.apiUrl}/admin/activity-logs`);
  }

  // ============ USER MANAGEMENT ============
  getUsers(): Observable<CMSUser[]> {
    return this.http.get<CMSUser[]>(`${this.apiUrl}/admin/users`);
  }

  createUser(data: Partial<CMSUser> & { password: string }): Observable<CMSUser> {
    return this.http.post<CMSUser>(`${this.apiUrl}/admin/users`, data);
  }

  updateUser(id: number, data: Partial<CMSUser>): Observable<CMSUser> {
    return this.http.put<CMSUser>(`${this.apiUrl}/admin/users/${id}`, data);
  }

  updateUserPassword(id: number, password: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/users/${id}/password`, { password });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/users/${id}`);
  }
}
