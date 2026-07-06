import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService } from '@/app/services/malik-api.service';
import { ImageUpload } from '@/app/components/image-upload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';

@Component({
    selector: 'app-settings-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule,
        TextareaModule, ToastModule, ToggleSwitchModule, DividerModule, ImageUpload
    ],
    providers: [MessageService],
    template: `
        <p-toast />
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 lg:col-span-8">
                <p-card header="Site Settings">
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Site Name</label>
                            <input type="text" pInputText [(ngModel)]="settings.site_name" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Site Tagline</label>
                            <input type="text" pInputText [(ngModel)]="settings.site_tagline" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="settings.site_description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <app-image-upload label="Logo URL" folder="site"
                                [(currentImage)]="settings.logo_url" />
                        </div>
                        <div>
                            <app-image-upload label="Favicon" folder="site"
                                [(currentImage)]="settings.favicon_url" />
                        </div>
                        <p-divider />
                        <div class="grid grid-cols-3 gap-4">
                            <div>
                                <label class="block font-bold mb-2">Primary Color</label>
                                <input type="text" pInputText [(ngModel)]="settings.primary_color" placeholder="#2c5530" fluid />
                            </div>
                            <div>
                                <label class="block font-bold mb-2">Secondary Color</label>
                                <input type="text" pInputText [(ngModel)]="settings.secondary_color" placeholder="#4a7c59" fluid />
                            </div>
                            <div>
                                <label class="block font-bold mb-2">Accent Color</label>
                                <input type="text" pInputText [(ngModel)]="settings.accent_color" placeholder="#f4a261" fluid />
                            </div>
                        </div>
                        <p-divider />
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold mb-2">Contact Email</label>
                                <input type="text" pInputText [(ngModel)]="settings.contact_email" fluid />
                            </div>
                            <div>
                                <label class="block font-bold mb-2">Contact Phone</label>
                                <input type="text" pInputText [(ngModel)]="settings.contact_phone" fluid />
                            </div>
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Google Analytics ID</label>
                            <input type="text" pInputText [(ngModel)]="settings.google_analytics_id" placeholder="G-XXXXXXXXXX" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Maintenance Mode</label>
                            <p-toggleSwitch [(ngModel)]="settings.maintenance_mode" />
                        </div>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12 lg:col-span-4">
                <p-card header="SEO Preview" styleClass="h-full">
                    <div class="flex flex-col gap-3">
                        <div *ngIf="settings.logo_url" class="flex justify-center">
                            <img [src]="'http://localhost:8000/' + settings.logo_url" 
                                alt="Logo" class="h-16 object-contain" />
                        </div>
                        <h3 class="text-xl font-bold">{{settings.site_name}}</h3>
                        <p class="text-muted-color">{{settings.site_tagline}}</p>
                        <p-divider />
                        <div class="text-sm text-muted-color">
                            <div class="mb-2"><strong>Primary:</strong> {{settings.primary_color}}</div>
                            <div class="mb-2"><strong>Secondary:</strong> {{settings.secondary_color}}</div>
                            <div class="mb-2"><strong>Email:</strong> {{settings.contact_email}}</div>
                            <div class="mb-2"><strong>Phone:</strong> {{settings.contact_phone}}</div>
                        </div>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12">
                <p-button label="Save Settings" icon="pi pi-check" severity="success" (onClick)="saveSettings()" [loading]="saving" />
            </div>
        </div>
    `
})
export class SettingsPage implements OnInit {
    settings: any = {};
    saving = false;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadSettings();
    }

    loadSettings() {
        this.api.adminList('site-settings').subscribe({
            next: (data: any[]) => {
                this.settings = data[0] || {};
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load settings' });
            }
        });
    }

    saveSettings() {
        this.saving = true;
        const data = { ...this.settings };
        const id = this.settings.id;
        const request = id
            ? this.api.adminUpdate('site-settings', id, data)
            : this.api.adminCreate('site-settings', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Settings saved successfully', life: 3000 });
                this.loadSettings();
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save settings' });
            }
        });
    }
}
