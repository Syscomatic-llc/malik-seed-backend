import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, HiringPageContent } from '@/app/services/malik-api.service';
import { ImageUpload } from '@/app/components/image-upload';
import { ImageGalleryUpload } from '@/app/components/image-gallery-upload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { environment } from '@/environments/environment';

function ensureDefaults(content: HiringPageContent): HiringPageContent {
    return {
        hero_title: 'Join Our Team',
        cta_button_text: 'View Open Positions',
        cta_button_link: '/hiring/positions',
        ...content,
        career_hero_section: {
            badge: '',
            ctaSecondary: { label: '', href: '' },
            teamImage: '',
            ...(content.career_hero_section || {})
        },
        career_manifesto: {
            badge: '',
            images: [],
            ...(content.career_manifesto || {})
        },
        career_team_culture: {
            badge: '',
            images: [],
            ...(content.career_team_culture || {})
        },
        career_future_program: {
            badge: '',
            image: '',
            ...(content.career_future_program || {})
        }
    };
}

@Component({
    selector: 'app-career-page-content-page',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, TextareaModule, ToastModule, ImageUpload, ImageGalleryUpload, DividerModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 lg:col-span-8">
                <p-card header="Career Page Content">
                    <div class="flex flex-col gap-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold mb-2">Hero Title</label>
                                <input type="text" pInputText [(ngModel)]="content.hero_title" fluid />
                            </div>
                            <div>
                                <label class="block font-bold mb-2">Hero Subtitle / Badge</label>
                                <input type="text" pInputText [(ngModel)]="content.hero_badge" placeholder="e.g. Since 1969" fluid />
                            </div>
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Hero Description</label>
                            <textarea pTextarea [(ngModel)]="content.hero_description" rows="4" fluid></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <app-image-upload label="Hero Background Image" folder="hiring"
                                    [(currentImage)]="content.hero_background_image" />
                            </div>
                            <div>
                                <label class="block font-bold mb-2">Hero Video URL</label>
                                <input type="text" pInputText [(ngModel)]="content.hero_video_url" placeholder="https://..." fluid />
                            </div>
                        </div>

                        <p-divider />

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold mb-2">Initiative Title</label>
                                <input type="text" pInputText [(ngModel)]="content.initiative_title" fluid />
                            </div>
                            <div>
                                <app-image-upload label="Initiative Image" folder="hiring"
                                    [(currentImage)]="content.initiative_image" />
                            </div>
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Initiative Description</label>
                            <textarea pTextarea [(ngModel)]="content.initiative_description" rows="3" fluid></textarea>
                        </div>

                        <p-divider />

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold mb-2">CTA Title</label>
                                <input type="text" pInputText [(ngModel)]="content.cta_title" fluid />
                            </div>
                            <div>
                                <label class="block font-bold mb-2">CTA Button Text</label>
                                <input type="text" pInputText [(ngModel)]="content.cta_button_text" fluid />
                            </div>
                        </div>
                        <div>
                            <label class="block font-bold mb-2">CTA Description</label>
                            <textarea pTextarea [(ngModel)]="content.cta_description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <label class="block font-bold mb-2">CTA Button Link</label>
                            <input type="text" pInputText [(ngModel)]="content.cta_button_link" fluid />
                        </div>

                        <p-divider />

                        <h3 class="text-lg font-bold">Career Hero Section</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold mb-2">Badge</label>
                                <input type="text" pInputText [(ngModel)]="content.career_hero_section!.badge" fluid />
                            </div>
                            <div>
                                <app-image-upload label="Team Image" folder="hiring"
                                    [(currentImage)]="content.career_hero_section!.teamImage" />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold mb-2">Secondary CTA Label</label>
                                <input type="text" pInputText [(ngModel)]="content.career_hero_section!.ctaSecondary!.label" fluid />
                            </div>
                            <div>
                                <label class="block font-bold mb-2">Secondary CTA Link</label>
                                <input type="text" pInputText [(ngModel)]="content.career_hero_section!.ctaSecondary!.href" fluid />
                            </div>
                        </div>

                        <p-divider />

                        <h3 class="text-lg font-bold">Career Manifesto</h3>
                        <div>
                            <label class="block font-bold mb-2">Badge</label>
                            <input type="text" pInputText [(ngModel)]="content.career_manifesto!.badge" fluid />
                        </div>
                        <div>
                            <app-image-gallery-upload label="Manifesto Images" folder="hiring"
                                [(images)]="content.career_manifesto!.images" />
                        </div>

                        <p-divider />

                        <h3 class="text-lg font-bold">Team Culture</h3>
                        <div>
                            <label class="block font-bold mb-2">Badge</label>
                            <input type="text" pInputText [(ngModel)]="content.career_team_culture!.badge" fluid />
                        </div>
                        <div>
                            <app-image-gallery-upload label="Culture Images" folder="hiring"
                                [(images)]="content.career_team_culture!.images" />
                        </div>

                        <p-divider />

                        <h3 class="text-lg font-bold">Future Leader Program</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold mb-2">Badge</label>
                                <input type="text" pInputText [(ngModel)]="content.career_future_program!.badge" fluid />
                            </div>
                            <div>
                                <app-image-upload label="Program Image" folder="hiring"
                                    [(currentImage)]="content.career_future_program!.image" />
                            </div>
                        </div>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12 lg:col-span-4">
                <p-card header="Preview" styleClass="h-full">
                    <div class="flex flex-col gap-3">
                        <div *ngIf="content.hero_badge" class="text-sm text-primary font-semibold">{{content.hero_badge}}</div>
                        <h3 class="text-xl font-bold">{{content.hero_title}}</h3>
                        <p class="text-muted-color">{{content.hero_description}}</p>
                        <div *ngIf="content.hero_background_image">
                            <img [src]="mediaBaseUrl + content.hero_background_image" class="w-full rounded-lg shadow-sm" />
                        </div>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12">
                <p-button label="Save Changes" icon="pi pi-check" severity="success" (onClick)="saveContent()" [loading]="saving" />
            </div>
        </div>
    `
})
export class CareerPageContentPage implements OnInit {
    content: HiringPageContent = ensureDefaults({});
    saving = false;
    mediaBaseUrl = environment.mediaBaseUrl;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadContent();
    }

    loadContent() {
        this.api.adminList('hiring-page-content').subscribe({
            next: (data: any[]) => {
                this.content = ensureDefaults(data[0] || {});
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load career page content' })
        });
    }

    saveContent() {
        this.saving = true;
        const data = { ...this.content };
        const id = this.content.id;
        const request = id
            ? this.api.adminUpdate('hiring-page-content', id, data)
            : this.api.adminCreate('hiring-page-content', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Career page content saved', life: 3000 });
                this.loadContent();
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save' });
            }
        });
    }
}
