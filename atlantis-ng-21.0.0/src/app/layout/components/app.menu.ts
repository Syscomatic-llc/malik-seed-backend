import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
    host: {
        class: 'layout-menu-container'
    }
})
export class AppMenu {
    model: any[] = [
        {
            label: 'Dashboard',
            icon: 'pi pi-home',
            routerLink: ['/']
        },
        {
            label: 'Homepage',
            icon: 'pi pi-desktop',
            items: [
                {
                    label: 'Hero Slides',
                    icon: 'pi pi-fw pi-image',
                    routerLink: ['/cms/homepage/hero']
                },
                {
                    label: 'About Section',
                    icon: 'pi pi-fw pi-info-circle',
                    routerLink: ['/cms/homepage/about']
                },
                {
                    label: 'Services',
                    icon: 'pi pi-fw pi-briefcase',
                    routerLink: ['/cms/homepage/services']
                },
                {
                    label: 'Testimonials',
                    icon: 'pi pi-fw pi-comment',
                    routerLink: ['/cms/homepage/testimonials']
                },
                {
                    label: 'Timeline',
                    icon: 'pi pi-fw pi-calendar',
                    routerLink: ['/cms/homepage/timeline']
                },
                {
                    label: 'News Items',
                    icon: 'pi pi-fw pi-newspaper',
                    routerLink: ['/cms/homepage/news']
                },
                {
                    label: 'CTA Banners',
                    icon: 'pi pi-fw pi-megaphone',
                    routerLink: ['/cms/homepage/cta']
                },
                {
                    label: 'Development Partners',
                    icon: 'pi pi-fw pi-users',
                    routerLink: ['/cms/homepage/partners']
                }
            ]
        },
        {
            label: 'Our Story',
            icon: 'pi pi-book',
            items: [
                {
                    label: 'Hero',
                    icon: 'pi pi-fw pi-image',
                    routerLink: ['/cms/our-story/hero']
                },
                {
                    label: 'Mission & Vision',
                    icon: 'pi pi-fw pi-eye',
                    routerLink: ['/cms/our-story/mission']
                },
                {
                    label: 'Values',
                    icon: 'pi pi-fw pi-heart',
                    routerLink: ['/cms/our-story/values']
                },
                {
                    label: 'Timeline',
                    icon: 'pi pi-fw pi-calendar',
                    routerLink: ['/cms/our-story/timeline']
                }
            ]
        },
        {
            label: 'Our Brands',
            icon: 'pi pi-tags',
            items: [
                {
                    label: 'Brands',
                    icon: 'pi pi-fw pi-list',
                    routerLink: ['/cms/brands']
                }
            ]
        },
        {
            label: 'Gallery',
            icon: 'pi pi-images',
            items: [
                {
                    label: 'Gallery Images',
                    icon: 'pi pi-fw pi-image',
                    routerLink: ['/cms/gallery/items']
                }
            ]
        },
        {
            label: 'Hiring',
            icon: 'pi pi-users',
            items: [
                {
                    label: 'Job Positions',
                    icon: 'pi pi-fw pi-briefcase',
                    routerLink: ['/cms/hiring/positions']
                },
                {
                    label: 'Benefits',
                    icon: 'pi pi-fw pi-star',
                    routerLink: ['/cms/hiring/benefits']
                },
                {
                    label: 'Testimonials',
                    icon: 'pi pi-fw pi-comment',
                    routerLink: ['/cms/hiring/testimonials']
                },
                {
                    label: 'Assessments',
                    icon: 'pi pi-fw pi-clipboard',
                    routerLink: ['/cms/hiring/assessments']
                }
            ]
        },
        {
            label: 'Contact',
            icon: 'pi pi-phone',
            items: [
                {
                    label: 'Contact Info',
                    icon: 'pi pi-fw pi-info-circle',
                    routerLink: ['/cms/contact/info']
                },
                {
                    label: 'Locations',
                    icon: 'pi pi-fw pi-map-marker',
                    routerLink: ['/cms/contact/locations']
                },
                {
                    label: 'FAQs',
                    icon: 'pi pi-fw pi-question-circle',
                    routerLink: ['/cms/contact/faqs']
                }
            ]
        },
        {
            label: 'News',
            icon: 'pi pi-newspaper',
            items: [
                {
                    label: 'Articles',
                    icon: 'pi pi-fw pi-list',
                    routerLink: ['/cms/news/articles']
                },
                {
                    label: 'Categories',
                    icon: 'pi pi-fw pi-folder',
                    routerLink: ['/cms/news/categories']
                }
            ]
        },
        {
            label: 'Settings',
            icon: 'pi pi-cog',
            items: [
                {
                    label: 'CMS Settings',
                    icon: 'pi pi-fw pi-cog',
                    routerLink: ['/cms/settings']
                }
            ]
        }
    ];
}
