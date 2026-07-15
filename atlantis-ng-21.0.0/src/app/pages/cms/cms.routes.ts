import { Routes } from '@angular/router';

export default [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

    // ===== DASHBOARD =====
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then((c) => c.CmsDashboardPage),
        data: { breadcrumb: 'Dashboard' }
    },

    // ===== HOMEPAGE =====
    {
        path: 'homepage/hero',
        loadComponent: () => import('./homepage/hero-slides').then((c) => c.HeroSlidesPage),
        data: { breadcrumb: 'Hero Slides' }
    },
    {
        path: 'homepage/about',
        loadComponent: () => import('./homepage/about-page').then((c) => c.AboutPage),
        data: { breadcrumb: 'About Section' }
    },
    {
        path: 'homepage/services',
        loadComponent: () => import('./homepage/services-page').then((c) => c.ServicesPage),
        data: { breadcrumb: 'Services' }
    },
    {
        path: 'homepage/brands',
        loadComponent: () => import('./homepage/brands-page').then((c) => c.BrandsPage),
        data: { breadcrumb: 'Brands' }
    },
    {
        path: 'homepage/testimonials',
        loadComponent: () => import('./homepage/testimonials-page').then((c) => c.TestimonialsPage),
        data: { breadcrumb: 'Testimonials' }
    },
    {
        path: 'homepage/timeline',
        loadComponent: () => import('./homepage/timeline-page').then((c) => c.TimelinePage),
        data: { breadcrumb: 'Timeline' }
    },
    {
        path: 'homepage/news',
        loadComponent: () => import('./homepage/news-items-page').then((c) => c.NewsItemsPage),
        data: { breadcrumb: 'News Items' }
    },
    {
        path: 'homepage/cta',
        loadComponent: () => import('./homepage/cta-page').then((c) => c.CTAPage),
        data: { breadcrumb: 'CTA Banners' }
    },
    {
        path: 'homepage/partners',
        loadComponent: () => import('./homepage/partners-page').then((c) => c.PartnersPage),
        data: { breadcrumb: 'Development Partners' }
    },

    // ===== OUR STORY =====
    {
        path: 'our-story/hero',
        loadComponent: () => import('./our-story/hero-page').then((c) => c.StoryHeroPage),
        data: { breadcrumb: 'Hero' }
    },
    {
        path: 'our-story/mission',
        loadComponent: () => import('./our-story/mission-page').then((c) => c.MissionPage),
        data: { breadcrumb: 'Mission & Vision' }
    },
    {
        path: 'our-story/values',
        loadComponent: () => import('./our-story/values-page').then((c) => c.ValuesPage),
        data: { breadcrumb: 'Values' }
    },
    {
        path: 'our-story/timeline',
        loadComponent: () => import('./our-story/timeline-page').then((c) => c.StoryTimelinePage),
        data: { breadcrumb: 'Timeline' }
    },

    // ===== BRANDS =====
    {
        path: 'brands',
        loadComponent: () => import('./brands/brands-page').then((c) => c.BrandsListPage),
        data: { breadcrumb: 'Brands' }
    },

    // ===== GALLERY =====
    {
        path: 'gallery/items',
        loadComponent: () => import('./gallery/items-page').then((c) => c.GalleryItemsPage),
        data: { breadcrumb: 'Gallery' }
    },
    {
        path: 'gallery',
        redirectTo: 'gallery/items',
        pathMatch: 'full'
    },

    // ===== CAREER =====
    {
        path: 'career/benefits',
        loadComponent: () => import('./career/benefits-page').then((c) => c.BenefitsPage),
        data: { breadcrumb: 'Benefits' }
    },
    {
        path: 'career/team-stories',
        loadComponent: () => import('./career/team-stories-page').then((c) => c.TeamStoriesPage),
        data: { breadcrumb: "Team's Stories" }
    },
    {
        path: 'career/page-content',
        loadComponent: () => import('./career/page-content-page').then((c) => c.CareerPageContentPage),
        data: { breadcrumb: 'Career Page Content' }
    },

    // ===== HIRING =====
    {
        path: 'hiring/positions',
        loadComponent: () => import('./hiring/positions-page').then((c) => c.PositionsPage),
        data: { breadcrumb: 'Job Positions' }
    },
    {
        path: 'hiring/assessments',
        loadComponent: () => import('./hiring/assessments-page').then((c) => c.AssessmentsPage),
        data: { breadcrumb: 'Assessments' }
    },
    {
        path: 'hiring/assessment/:id',
        loadComponent: () => import('./hiring/assessment-page').then((c) => c.AssessmentPage),
        data: { breadcrumb: 'Assessment Questions' }
    },
    {
        path: 'hiring/resumes',
        loadComponent: () => import('./hiring/resumes-page').then((c) => c.ResumesPage),
        data: { breadcrumb: 'Resume' }
    },

    // ===== CONTACT =====
    {
        path: 'contact/info',
        loadComponent: () => import('./contact/info-page').then((c) => c.ContactInfoPage),
        data: { breadcrumb: 'Contact Info' }
    },
    {
        path: 'contact/messages',
        loadComponent: () => import('./contact/messages-page').then((c) => c.ContactMessagesPage),
        data: { breadcrumb: 'Messages' }
    },

    // ===== NEWS =====
    {
        path: 'news/articles',
        loadComponent: () => import('./news/articles-page').then((c) => c.ArticlesPage),
        data: { breadcrumb: 'Articles' }
    },
    {
        path: 'news/categories',
        loadComponent: () => import('./news/categories-page').then((c) => c.NewsCategoriesPage),
        data: { breadcrumb: 'Categories' }
    },

    // ===== SITE SETTINGS =====
    {
        path: 'settings',
        loadComponent: () => import('./settings/settings-page').then((c) => c.SettingsPage),
        data: { breadcrumb: 'Site Settings' }
    },

    { path: '**', redirectTo: '/notfound' }
] as Routes;
