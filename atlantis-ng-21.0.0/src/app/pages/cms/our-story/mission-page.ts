import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, OurStoryMission } from '@/app/services/malik-api.service';
import { ImageUpload } from '@/app/components/image-upload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-mission-page',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, TextareaModule, ToastModule, ImageUpload],
    providers: [MessageService],
    template: `
        <p-toast />
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 lg:col-span-8">
                <p-card header="Mission & Vision">
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Title</label>
                            <input type="text" pInputText [(ngModel)]="mission.title" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="mission.description" rows="6" fluid></textarea>
                        </div>
                        <div>
                            <app-image-upload label="Image" folder="our-story"
                                [(currentImage)]="mission.image_url" />
                        </div>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12 lg:col-span-4">
                <p-card header="Preview" styleClass="h-full">
                    <div class="flex flex-col gap-3">
                        <div *ngIf="mission.image_url">
                            <img [src]="'http://localhost:8000/' + mission.image_url" 
                                alt="Mission" class="w-full rounded-lg shadow-sm" />
                        </div>
                        <h3 class="text-xl font-bold">{{mission.title}}</h3>
                        <p class="text-muted-color">{{mission.description}}</p>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12">
                <p-button label="Save Changes" icon="pi pi-check" severity="success" (onClick)="saveMission()" [loading]="saving" />
            </div>
        </div>
    `
})
export class MissionPage implements OnInit {
    mission: OurStoryMission = { title: '', description: '' };
    saving = false;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadMission();
    }

    loadMission() {
        this.api.getMission().subscribe({
            next: (data) => this.mission = data,
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load mission' })
        });
    }

    saveMission() {
        this.saving = true;
        const data = { ...this.mission };
        const id = this.mission.id;
        const request = id
            ? this.api.adminUpdate('our-story-mission', id, data)
            : this.api.adminCreate('our-story-mission', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Mission saved successfully', life: 3000 });
                this.loadMission();
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save mission' });
            }
        });
    }
}
