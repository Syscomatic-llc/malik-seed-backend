import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, ContactInfo } from '@/app/services/malik-api.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-contact-info-page',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, TextareaModule, ToastModule, DividerModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 lg:col-span-8">
                <p-card header="Contact Information">
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Title</label>
                            <input type="text" pInputText [(ngModel)]="info.title" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Description</label>
                            <textarea pTextarea [(ngModel)]="info.description" rows="3" fluid></textarea>
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Footer Description</label>
                            <textarea pTextarea [(ngModel)]="info.footer_description" rows="3" fluid></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold mb-2">Primary Phone</label>
                                <input type="text" pInputText [(ngModel)]="info.phone_primary" fluid />
                            </div>
                            <div>
                                <label class="block font-bold mb-2">Primary Email</label>
                                <input type="text" pInputText [(ngModel)]="info.email_primary" fluid />
                            </div>
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Address</label>
                            <textarea pTextarea [(ngModel)]="info.address" rows="2" fluid></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold mb-2">Facebook URL</label>
                                <input type="text" pInputText [(ngModel)]="info.facebook_url" fluid />
                            </div>
                            <div>
                                <label class="block font-bold mb-2">Instagram URL</label>
                                <input type="text" pInputText [(ngModel)]="info.instagram_url" fluid />
                            </div>
                        </div>
                        <div>
                            <label class="block font-bold mb-2">YouTube URL</label>
                            <input type="text" pInputText [(ngModel)]="info.youtube_url" fluid />
                        </div>
                        <p-divider />
                        <div>
                            <label class="block font-bold mb-2">Contact Form Subject Options</label>
                            <div class="flex flex-col gap-2">
                                <div *ngFor="let option of info.subject_options; let i = index" class="flex gap-2">
                                    <input type="text" pInputText [(ngModel)]="info.subject_options![i]" fluid />
                                    <p-button icon="pi pi-trash" severity="danger" (onClick)="removeSubject(i)" />
                                </div>
                                <p-button label="Add Subject" icon="pi pi-plus" severity="success" (onClick)="addSubject()" />
                            </div>
                        </div>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12 lg:col-span-4">
                <p-card header="Preview" styleClass="h-full">
                    <div class="flex flex-col gap-3">
                        <h3 class="text-xl font-bold">{{info.title}}</h3>
                        <p class="text-muted-color">{{info.description}}</p>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-phone text-primary"></i>
                            <span>{{info.phone_primary}}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-envelope text-primary"></i>
                            <span>{{info.email_primary}}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-map-marker text-primary"></i>
                            <span>{{info.address}}</span>
                        </div>
                    </div>
                </p-card>
            </div>
            <div class="col-span-12">
                <p-button label="Save Changes" icon="pi pi-check" severity="success" (onClick)="saveInfo()" [loading]="saving" />
            </div>
        </div>
    `
})
export class ContactInfoPage implements OnInit {
    info: ContactInfo = { title: '', subject_options: [] };
    saving = false;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadInfo();
    }

    loadInfo() {
        this.api.getContactInfo().subscribe({
            next: (data) => {
                this.info = data;
                if (!this.info.subject_options) this.info.subject_options = [];
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load contact info' })
        });
    }

    addSubject() {
        this.info.subject_options = [...(this.info.subject_options || []), ''];
    }

    removeSubject(index: number) {
        this.info.subject_options = (this.info.subject_options || []).filter((_, i) => i !== index);
    }

    saveInfo() {
        this.saving = true;
        const data = { ...this.info };
        data.subject_options = (data.subject_options || []).filter(o => o.trim() !== '');
        const id = this.info.id;
        const request = id
            ? this.api.adminUpdate('contact-info', id, data)
            : this.api.adminCreate('contact-info', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Contact info saved successfully', life: 3000 });
                this.loadInfo();
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save contact info' });
            }
        });
    }
}
