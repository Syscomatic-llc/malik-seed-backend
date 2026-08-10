import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalikApiService, HomepageTimeline } from '@/app/services/malik-api.service';
import { ImageUpload } from '@/app/components/image-upload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-timeline-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
        DialogModule, InputTextModule, TextareaModule, InputNumberModule,
        ToastModule, ToolbarModule, TagModule, ConfirmDialogModule, ImageUpload
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="bottom-left" />
        <p-confirmdialog />
        <div class="card">
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="New Timeline Entry" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="timeline()" (onRowReorder)="onRowReorder($event)"
                [rows]="100" [tableStyle]="{ 'min-width': '60rem' }">
                <ng-template #header>
                    <tr>
                        <th style="width: 3rem"></th>
                        <th>Order</th>
                        <th>Year</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item let-i="rowIndex">
                    <tr [pReorderableRow]="i">
                        <td>
                            <span class="pi pi-bars" pReorderableRowHandle style="cursor: move"></span>
                        </td>
                        <td><span class="font-bold text-primary">{{i + 1}}</span></td>
                        <td>{{item.year}}</td>
                        <td>{{item.title}}</td>
                        <td>{{item.description | slice:0:60}}...</td>
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
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold mb-2">Year</label>
                            <input type="text" pInputText [(ngModel)]="item.year" placeholder="e.g. 1969" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Sort Order</label>
                            <p-inputnumber [(ngModel)]="item.sort_order" [min]="0" fluid />
                        </div>
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
                        <app-image-upload label="Primary Image" folder="homepage"
                            [(currentImage)]="item.image_url" />
                    </div>
                    <div>
                        <app-image-upload label="Gallery Image" folder="homepage"
                            [(currentImage)]="galleryImageUrl" />
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
export class TimelinePage implements OnInit {
    timeline = signal<HomepageTimeline[]>([]);
    dialog = false;
    item: HomepageTimeline = { year: '', title: '' };
    saving = false;
    galleryImageUrl = '';

    constructor(
        private api: MalikApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadTimeline();
    }

    loadTimeline() {
        this.api.getTimeline().subscribe({
            next: (data) => this.timeline.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load timeline' })
        });
    }

    openNew() {
        this.item = { year: '', title: '', is_milestone: false, sort_order: 0 };
        this.galleryImageUrl = '';
        this.dialog = true;
    }

    editItem(t: HomepageTimeline) {
        this.item = { ...t };
        this.galleryImageUrl = (t.gallery_images && t.gallery_images[0]) || '';
        this.dialog = true;
    }

    hideDialog() {
        this.dialog = false;
    }

    saveItem() {
        if (!this.item.year?.trim() || !this.item.title?.trim()) return;
        this.saving = true;
        const data = { ...this.item, gallery_images: this.galleryImageUrl ? [this.galleryImageUrl] : [] };
        const request = data.id
            ? this.api.adminUpdate('homepage-timeline', data.id, data)
            : this.api.adminCreate('homepage-timeline', data);

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

    deleteItem(t: HomepageTimeline) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${t.title}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!t.id) return;
                this.api.adminDelete('homepage-timeline', t.id).subscribe({
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

    onRowReorder(event: any) {
        const order = this.timeline().map(t => t.id!).filter(id => id !== undefined);
        if (!order.length) return;
        this.api.reorder('homepage-timeline', order).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Reordered', detail: 'Timeline order saved', life: 2000 });
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Failed to reorder timeline' });
                this.loadTimeline();
            }
        });
    }
}
