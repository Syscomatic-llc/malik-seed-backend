import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, HomepageAbout } from '@/app/services/malik-api.service';
import { ImageUpload } from '@/app/components/image-upload';
import { ImageGalleryUpload } from '@/app/components/image-gallery-upload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { environment } from '@/environments/environment';

@Component({
    selector: 'app-about-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule,
        InputTextModule, TextareaModule, ToastModule, ImageUpload, ImageGalleryUpload
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 lg:col-span-8">
                <p-card header="About Section Content">
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Title</label>
                            <input type="text" pInputText [(ngModel)]="about.title" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Subtitle</label>
                            <input type="text" pInputText [(ngModel)]="about.subtitle" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="about.description" rows="6" fluid></textarea>
                        </div>
                        <div>
                            <app-image-upload label="Primary / Hero Image" folder="homepage"
                                [(currentImage)]="about.image_url" />
                        </div>
                        <div>
                            <app-image-gallery-upload label="Additional Gallery Images" folder="homepage"
                                [(images)]="galleryImages" />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">CTA Text</label>
                            <input type="text" pInputText [(ngModel)]="about.cta_text" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">CTA Link</label>
                            <input type="text" pInputText [(ngModel)]="about.cta_link" fluid />
                        </div>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12 lg:col-span-4">
                <p-card header="Preview" styleClass="h-full">
                    <div class="flex flex-col gap-3">
                        <div *ngIf="about.image_url">
                            <img [src]="mediaBaseUrl + about.image_url"
                                alt="About" class="w-full rounded-lg shadow-sm" />
                        </div>
                        <h3 class="text-xl font-bold">{{about.title}}</h3>
                        <p class="text-muted-color">{{about.description}}</p>
                        <div *ngIf="galleryImages.length" class="grid grid-cols-3 gap-2">
                            <img *ngFor="let img of galleryImages" [src]="mediaBaseUrl + img"
                                class="w-full h-20 object-cover rounded" />
                        </div>
                        <p-button [label]="about.cta_text" icon="pi pi-arrow-right" />
                    </div>
                </p-card>
            </div>
            <div class="col-span-12">
                <p-card header="Stats (5 fixed)">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div *ngFor="let stat of stats; let i = index" class="p-4 bg-primary/5 rounded-lg flex flex-col gap-2">
                            <div>
                                <label class="block text-sm font-bold mb-1">Value</label>
                                <input type="text" pInputText [(ngModel)]="stat.value" fluid />
                            </div>
                            <div>
                                <label class="block text-sm font-bold mb-1">Label</label>
                                <input type="text" pInputText [(ngModel)]="stat.label" fluid />
                            </div>
                        </div>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12">
                <p-button label="Save Changes" icon="pi pi-check" severity="success" (onClick)="saveAbout()" [loading]="saving" [disabled]="!hasChanges()" />
            </div>
        </div>
    `
})
export class AboutPage implements OnInit {
    about: HomepageAbout = {
        title: '',
        description: '',
        cta_text: 'Learn More',
        cta_link: '/our-story'
    };
    galleryImages: string[] = [];
    stats: any[] = [];
    saving = false;
    mediaBaseUrl = environment.mediaBaseUrl;
    private originalSnapshot = '';

    constructor(
        private api: MalikApiService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadAbout();
    }

    loadAbout() {
        this.api.getAbout().subscribe({
            next: (data: any) => {
                this.about = data;
                this.galleryImages = this.parseJsonArray(data?.gallery_images);
                if (data.stats) {
                    try {
                        this.stats = typeof data.stats === 'string' ? JSON.parse(data.stats) : data.stats;
                    } catch (e) {
                        this.stats = [];
                    }
                }
                while (this.stats.length < 5) this.stats.push({ value: '', label: '' });
                this.stats = this.stats.slice(0, 5);
                this.takeSnapshot();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load about section'
                });
            }
        });
    }

    hasChanges(): boolean {
        const current = JSON.stringify({ about: this.about, galleryImages: this.galleryImages, stats: this.stats });
        return current !== this.originalSnapshot;
    }

    private takeSnapshot() {
        this.originalSnapshot = JSON.stringify({ about: this.about, galleryImages: this.galleryImages, stats: this.stats });
    }

    saveAbout() {
        if (!this.hasChanges()) return;
        this.saving = true;
        const data = { ...this.about, gallery_images: this.galleryImages, stats: this.stats };
        const id = this.about.id;
        const request = id
            ? this.api.adminUpdate('homepage-about', id, data)
            : this.api.adminCreate('homepage-about', data);

        request.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Saved',
                    detail: 'About section saved successfully',
                    life: 3000
                });
                this.loadAbout();
                this.saving = false;
                this.takeSnapshot();
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.detail || 'Failed to save about section'
                });
            }
        });
    }

    private parseJsonArray(value: any): string[] {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
}
