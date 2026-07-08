import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, OurStoryHero } from '@/app/services/malik-api.service';
import { ImageUpload } from '@/app/components/image-upload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { environment } from '@/environments/environment';

@Component({
    selector: 'app-story-hero-page',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, TextareaModule, ToastModule, ImageUpload],
    providers: [MessageService],
    template: `
        <p-toast />
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 lg:col-span-8">
                <p-card header="Our Story Hero Section">
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Title</label>
                            <input type="text" pInputText [(ngModel)]="hero.title" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Subtitle</label>
                            <input type="text" pInputText [(ngModel)]="hero.subtitle" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="hero.description" rows="4" fluid></textarea>
                        </div>
                        <div>
                            <app-image-upload label="Background Image" folder="our-story"
                                [(currentImage)]="hero.background_image" />
                        </div>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12 lg:col-span-4">
                <p-card header="Preview" styleClass="h-full">
                    <div class="flex flex-col gap-3">
                        <div *ngIf="hero.background_image" class="relative">
                            <img [src]="mediaBaseUrl + hero.background_image"
                                alt="Hero" class="w-full rounded-lg shadow-sm" />
                            <div class="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                                <div class="text-center text-white p-4">
                                    <h3 class="text-xl font-bold">{{hero.title}}</h3>
                                    <p class="text-sm mt-2">{{hero.subtitle}}</p>
                                </div>
                            </div>
                        </div>
                        <p class="text-muted-color">{{hero.description}}</p>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12">
                <p-button label="Save Changes" icon="pi pi-check" severity="success" (onClick)="saveHero()" [loading]="saving" />
            </div>
        </div>
    `
})
export class StoryHeroPage implements OnInit {
    hero: OurStoryHero = { title: '' };
    saving = false;
    mediaBaseUrl = environment.mediaBaseUrl;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadHero();
    }

    loadHero() {
        this.api.getStoryHero().subscribe({
            next: (data) => this.hero = data,
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load hero' })
        });
    }

    saveHero() {
        this.saving = true;
        const data = { ...this.hero };
        const id = this.hero.id;
        const request = id
            ? this.api.adminUpdate('our-story-hero', id, data)
            : this.api.adminCreate('our-story-hero', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Hero saved successfully', life: 3000 });
                this.loadHero();
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save hero' });
            }
        });
    }
}
