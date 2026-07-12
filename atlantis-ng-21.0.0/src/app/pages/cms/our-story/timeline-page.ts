import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, OurStoryTimeline } from '@/app/services/malik-api.service';
import { ImageUpload } from '@/app/components/image-upload';
import { ImageGalleryUpload } from '@/app/components/image-gallery-upload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-story-timeline-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, ToastModule, ToolbarModule,
        ToggleSwitchModule, TagModule, ConfirmDialogModule, ImageUpload, ImageGalleryUpload
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New Entry" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="timeline()" [rows]="10" [paginator]="true"
                [tableStyle]="{ 'min-width': '75rem' }">
                <ng-template #header>
                    <tr>
                        <th>ID</th>
                        <th>Year</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Milestone</th>
                        <th>Order</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{item.id}}</td>
                        <td><span class="font-bold text-primary">{{item.year}}</span></td>
                        <td>{{item.title}}</td>
                        <td>{{item.description | slice:0:60}}...</td>
                        <td>
                            <p-tag [value]="item.is_milestone ? 'Yes' : 'No'" 
                                [severity]="item.is_milestone ? 'success' : 'secondary'" />
                        </td>
                        <td>{{item.sort_order}}</td>
                        <td>
                            <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" 
                                (onClick)="editItem(item)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                (onClick)="deleteItem(item)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialog" [style]="{ width: '560px' }" header="Timeline Entry" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Year</label>
                        <input type="text" pInputText [(ngModel)]="item.year" placeholder="e.g. 1969" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Title</label>
                        <input type="text" pInputText [(ngModel)]="item.title" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Description</label>
                        <textarea pTextarea [(ngModel)]="item.description" rows="3" fluid></textarea>
                    </div>
                    <div>
                        <app-image-upload label="Primary Image" folder="our-story"
                            [(currentImage)]="item.image_url" />
                    </div>
                    <div>
                        <app-image-gallery-upload label="Gallery Images" folder="our-story"
                            [(images)]="galleryImages" />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Milestone</label>
                        <p-toggleSwitch [(ngModel)]="item.is_milestone" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveItem()" [loading]="saving" />
            </ng-template>
        </p-dialog>
    `
})
export class StoryTimelinePage implements OnInit {
    timeline = signal<OurStoryTimeline[]>([]);
    dialog = false;
    item: OurStoryTimeline = { year: '', title: '' };
    galleryImages: string[] = [];
    saving = false;

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadTimeline();
    }

    loadTimeline() {
        this.api.getStoryTimeline().subscribe({
            next: (data) => this.timeline.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load timeline' })
        });
    }

    openNew() {
        this.item = { year: '', title: '', is_milestone: false, sort_order: 0 };
        this.galleryImages = [];
        this.dialog = true;
    }

    editItem(t: OurStoryTimeline) {
        this.item = { ...t };
        this.galleryImages = this.parseJsonArray(t.gallery_images);
        this.dialog = true;
    }

    hideDialog() {
        this.dialog = false;
    }

    saveItem() {
        if (!this.item.year?.trim() || !this.item.title?.trim()) return;
        this.saving = true;
        const data = { ...this.item, gallery_images: this.galleryImages };
        const request = data.id
            ? this.api.adminUpdate('our-story-timeline', data.id, data)
            : this.api.adminCreate('our-story-timeline', data);

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Timeline entry saved successfully', life: 3000 });
                this.loadTimeline();
                this.dialog = false;
                this.saving = false;
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to save timeline entry' });
            }
        });
    }

    deleteItem(t: OurStoryTimeline) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${t.title}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!t.id) return;
                this.api.adminDelete('our-story-timeline', t.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Timeline entry deleted', life: 3000 });
                        this.loadTimeline();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to delete timeline entry' });
                    }
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
